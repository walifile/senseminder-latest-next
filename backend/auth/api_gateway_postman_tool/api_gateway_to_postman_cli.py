from __future__ import annotations

import argparse
import json
import logging
import os
import re
import shutil
import subprocess
import sys
from collections import OrderedDict
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional
from urllib.parse import parse_qsl, urlparse


LOGGER = logging.getLogger(__name__)
BASE_URL_VARIABLE = "{{baseUrl}}"
HTTP_METHOD_ORDER = ["get", "post", "put", "patch", "delete", "options", "head", "trace"]
POSTMAN_BASE_URL = "https://api.getpostman.com"


class CliError(RuntimeError):
    pass


def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export OpenAPI from API Gateway and convert/upload to Postman collection."
    )
    parser.add_argument("--type", choices=["rest", "http"], required=True, help="API Gateway type")
    parser.add_argument("--api-id", dest="api_id", help="API Gateway API ID")
    parser.add_argument("--rest-api-id", dest="api_id", help="Alias for --api-id")
    parser.add_argument("--all-http", action="store_true", help="Process all HTTP APIs into one collection")
    parser.add_argument("--stage", help="API stage name (required for single API mode)")
    parser.add_argument("--region", default=os.getenv("AWS_REGION"), help="AWS region")
    parser.add_argument("--output-dir", default="./out", help="Output directory")
    parser.add_argument("--base-url", help="Override base URL variable value")
    parser.add_argument(
        "--auth",
        choices=["none", "apiKey", "bearer", "awsSigV4"],
        default="none",
        help="Collection-level auth mode",
    )
    parser.add_argument("--include-examples", action="store_true", help="Include examples")
    parser.add_argument("--postman-api-key", help="Postman API key")
    parser.add_argument("--postman-workspace-id", help="Postman workspace ID")
    parser.add_argument("--postman-collection-id", help="Existing Postman collection ID")
    parser.add_argument("--collection-name", help="Collection name (default <api-id>-<stage>)")
    parser.add_argument(
        "--keep-openapi-files",
        action="store_true",
        help="Keep intermediate exported OpenAPI files in output-dir",
    )
    parser.add_argument("--dry-run", action="store_true", help="Print actions only")
    parser.add_argument("--verbose", action="store_true", help="Verbose logs")
    return parser.parse_args(argv)


def configure_logging(verbose: bool) -> None:
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(level=level, format="%(levelname)s: %(message)s")


def check_aws_cli(verbose: bool) -> None:
    if shutil.which("aws") is None:
        raise CliError("AWS CLI v2 not found in PATH.")
    run_command_stream(["aws", "--version"], verbose=verbose)


def run_command_stream(command: List[str], verbose: bool = False) -> List[str]:
    LOGGER.debug("Running: %s", " ".join(command))
    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        universal_newlines=True,
    )
    assert process.stdout is not None
    lines: List[str] = []
    for line in process.stdout:
        text = line.rstrip()
        lines.append(text)
        if verbose and text:
            LOGGER.info(text)
    process.wait()
    if process.returncode != 0:
        tail = "\n".join(lines[-30:])
        raise CliError(f"Command failed ({process.returncode}): {' '.join(command)}\n{tail}")
    return lines


def build_export_command(
    api_type: str,
    api_id: str,
    stage: str,
    region: str,
    output_file: Path,
) -> List[str]:
    if api_type == "rest":
        return [
            "aws",
            "apigateway",
            "get-export",
            "--rest-api-id",
            api_id,
            "--stage-name",
            stage,
            "--export-type",
            "oas30",
            "--parameters",
            "extensions=integrations,authorizers,apigateway",
            "--region",
            region,
            str(output_file),
        ]
    if api_type == "http":
        return [
            "aws",
            "apigatewayv2",
            "export-api",
            "--api-id",
            api_id,
            "--stage-name",
            stage,
            "--specification",
            "OAS30",
            "--output-type",
            "JSON",
            "--region",
            region,
            str(output_file),
        ]
    raise CliError(f"Unsupported --type: {api_type}")


def export_openapi(
    api_type: str,
    api_id: str,
    stage: str,
    region: str,
    output_file: Path,
    verbose: bool,
) -> Path:
    output_file.parent.mkdir(parents=True, exist_ok=True)
    command = build_export_command(api_type, api_id, stage, region, output_file)
    run_command_stream(command, verbose=verbose)
    if not output_file.exists():
        raise CliError(f"OpenAPI export file missing: {output_file}")
    return output_file


def load_openapi(path: Path) -> Dict[str, Any]:
    raw = path.read_text(encoding="utf-8")
    try:
        spec = json.loads(raw)
    except json.JSONDecodeError:
        try:
            import yaml  # type: ignore
        except ImportError as exc:
            raise CliError("PyYAML required for YAML OpenAPI files.") from exc
        spec = yaml.safe_load(raw)

    if not isinstance(spec, dict):
        raise CliError("OpenAPI must be an object.")
    version = str(spec.get("openapi", ""))
    if not version.startswith("3."):
        raise CliError(f"Only OpenAPI 3.x supported. Found: {version}")
    return spec


def convert_openapi_to_postman(
    openapi: Dict[str, Any],
    collection_name: str,
    base_url: str,
    auth_type: str,
    include_examples: bool,
    region: str,
) -> Dict[str, Any]:
    tags: "OrderedDict[str, List[Dict[str, Any]]]" = OrderedDict()
    paths = openapi.get("paths", {})
    if not isinstance(paths, dict):
        raise CliError("OpenAPI paths must be an object.")

    for path, path_item in paths.items():
        if not isinstance(path_item, dict):
            continue
        path_params = _as_list(path_item.get("parameters"))
        for method in HTTP_METHOD_ORDER:
            op = path_item.get(method)
            if not isinstance(op, dict):
                continue
            params = _merge_parameters(path_params, _as_list(op.get("parameters")))
            item = _build_item(path, method, op, params, include_examples)
            tag = _primary_tag(op)
            tags.setdefault(tag, []).append(item)

    collection = {
        "info": {
            "name": collection_name,
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
            "description": openapi.get("info", {}).get("description", ""),
        },
        "item": [{"name": tag, "item": items} for tag, items in tags.items()],
        "variable": _build_variables(base_url, auth_type, region),
        "auth": _build_auth(auth_type),
    }
    return rewrite_collection_urls(collection)


def _build_item(
    path: str,
    method: str,
    operation: Dict[str, Any],
    parameters: List[Dict[str, Any]],
    include_examples: bool,
) -> Dict[str, Any]:
    headers = _headers_from_parameters(parameters)
    query = _query_from_parameters(parameters)
    media_type, body = _build_body(operation.get("requestBody"), include_examples)
    if media_type and not _has_header(headers, "Content-Type"):
        headers.append({"key": "Content-Type", "value": media_type})

    url = build_request_url(path)
    if query:
        query_str = "&".join([f"{q['key']}={q['value']}" for q in query])
        url = f"{url}?{query_str}"

    request: Dict[str, Any] = {
        "method": method.upper(),
        "header": headers,
        "url": url,
        "description": operation.get("description") or operation.get("summary", ""),
    }
    if body is not None:
        request["body"] = body

    return {
        "name": operation.get("summary") or operation.get("operationId") or f"{method.upper()} {path}",
        "request": request,
        "response": [],
    }


def _as_list(value: Any) -> List[Dict[str, Any]]:
    if isinstance(value, list):
        return [v for v in value if isinstance(v, dict)]
    return []


def _merge_parameters(
    path_params: List[Dict[str, Any]],
    op_params: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    merged: OrderedDict[tuple[str, str], Dict[str, Any]] = OrderedDict()
    for p in path_params + op_params:
        name = str(p.get("name", ""))
        location = str(p.get("in", ""))
        if name and location:
            merged[(name, location)] = p
    return list(merged.values())


def _primary_tag(operation: Dict[str, Any]) -> str:
    tags = operation.get("tags", [])
    if isinstance(tags, list) and tags:
        return str(tags[0])
    return "Untagged"


def _query_from_parameters(parameters: Iterable[Dict[str, Any]]) -> List[Dict[str, str]]:
    result: List[Dict[str, str]] = []
    for p in parameters:
        if p.get("in") != "query":
            continue
        key = str(p.get("name", ""))
        if not key:
            continue
        result.append({"key": key, "value": _parameter_value(p)})
    return result


def _headers_from_parameters(parameters: Iterable[Dict[str, Any]]) -> List[Dict[str, str]]:
    result: List[Dict[str, str]] = []
    for p in parameters:
        if p.get("in") != "header":
            continue
        key = str(p.get("name", ""))
        if not key:
            continue
        result.append({"key": key, "value": _parameter_value(p)})
    return result


def _parameter_value(parameter: Dict[str, Any]) -> str:
    if "example" in parameter:
        return str(parameter["example"])
    schema = parameter.get("schema", {})
    if isinstance(schema, dict):
        if "example" in schema:
            return str(schema["example"])
        if "default" in schema:
            return str(schema["default"])
    return f"{{{{{parameter.get('name', 'value')}}}}}"


def _build_body(request_body: Any, include_examples: bool) -> tuple[str | None, Dict[str, Any] | None]:
    if not isinstance(request_body, dict):
        return None, None
    content = request_body.get("content")
    if not isinstance(content, dict) or not content:
        return None, None
    media_type = "application/json" if "application/json" in content else next(iter(content.keys()))
    media_obj = content.get(media_type) if isinstance(content.get(media_type), dict) else {}

    if media_type == "application/json":
        raw = "{}"
        if include_examples:
            sample = _first_example_value(media_obj)
            raw = json.dumps(sample if sample is not None else {}, indent=2)
        return media_type, {"mode": "raw", "raw": raw, "options": {"raw": {"language": "json"}}}
    if media_type == "application/x-www-form-urlencoded":
        return media_type, {"mode": "urlencoded", "urlencoded": []}
    if media_type == "multipart/form-data":
        return media_type, {"mode": "formdata", "formdata": []}

    raw = ""
    if include_examples:
        sample = _first_example_value(media_obj)
        if sample is not None:
            raw = sample if isinstance(sample, str) else json.dumps(sample, indent=2)
    return media_type, {"mode": "raw", "raw": raw}


def _first_example_value(media_obj: Dict[str, Any]) -> Any:
    if "example" in media_obj:
        return media_obj["example"]
    examples = media_obj.get("examples")
    if isinstance(examples, dict):
        for ex in examples.values():
            if isinstance(ex, dict) and "value" in ex:
                return ex["value"]
    return None


def _has_header(headers: Iterable[Dict[str, str]], name: str) -> bool:
    wanted = name.lower()
    return any(str(h.get("key", "")).lower() == wanted for h in headers)


def build_request_url(path: str) -> str:
    normalized = re.sub(r"\{([^{}]+)\}", r":\1", path)
    if normalized.startswith("/"):
        return f"{BASE_URL_VARIABLE}{normalized}"
    return f"{BASE_URL_VARIABLE}/{normalized}"


def rewrite_collection_urls(collection: Dict[str, Any]) -> Dict[str, Any]:
    for item in collection.get("item", []):
        _rewrite_item(item)
    return collection


def _rewrite_item(item: Dict[str, Any]) -> None:
    if "item" in item:
        for child in item["item"]:
            _rewrite_item(child)
        return
    request = item.get("request")
    if not request:
        return
    url = request.get("url")
    if isinstance(url, str):
        request["url"] = _rewrite_url_value(url)
    elif isinstance(url, dict):
        raw = str(url.get("raw", ""))
        rewritten = _rewrite_url_value(raw)
        parsed = urlparse(rewritten.replace(BASE_URL_VARIABLE, "https://example.com", 1))
        url["raw"] = rewritten
        url["path"] = [p for p in parsed.path.split("/") if p]
        if parsed.query:
            url["query"] = [{"key": k, "value": v} for k, v in parse_qsl(parsed.query, keep_blank_values=True)]


def _rewrite_url_value(url: str) -> str:
    stripped = url.strip()
    if not stripped:
        return BASE_URL_VARIABLE
    if stripped.startswith(BASE_URL_VARIABLE):
        return stripped
    parsed = urlparse(stripped)
    if parsed.scheme and parsed.netloc:
        query = f"?{parsed.query}" if parsed.query else ""
        return f"{BASE_URL_VARIABLE}{parsed.path}{query}"
    if stripped.startswith("/"):
        return f"{BASE_URL_VARIABLE}{stripped}"
    return f"{BASE_URL_VARIABLE}/{stripped}"


def _build_variables(base_url: str, auth_type: str, region: str) -> List[Dict[str, str]]:
    variables = []
    if base_url:
        variables.append({"key": "baseUrl", "value": base_url, "type": "string"})
    if auth_type == "apiKey":
        variables.append({"key": "apiKey", "value": "", "type": "string"})
    elif auth_type == "bearer":
        variables.append({"key": "token", "value": "", "type": "string"})
    elif auth_type == "awsSigV4":
        variables.extend(
            [
                {"key": "awsAccessKeyId", "value": "", "type": "string"},
                {"key": "awsSecretAccessKey", "value": "", "type": "string"},
                {"key": "awsSessionToken", "value": "", "type": "string"},
                {"key": "awsRegion", "value": region, "type": "string"},
                {"key": "awsService", "value": "execute-api", "type": "string"},
            ]
        )
    return variables


def _build_auth(auth_type: str) -> Dict[str, Any]:
    if auth_type == "none":
        return {"type": "noauth"}
    if auth_type == "apiKey":
        return {
            "type": "apikey",
            "apikey": [
                {"key": "key", "value": "x-api-key", "type": "string"},
                {"key": "value", "value": "{{apiKey}}", "type": "string"},
                {"key": "in", "value": "header", "type": "string"},
            ],
        }
    if auth_type == "bearer":
        return {"type": "bearer", "bearer": [{"key": "token", "value": "{{token}}", "type": "string"}]}
    if auth_type == "awsSigV4":
        return {
            "type": "awsv4",
            "awsv4": [
                {"key": "accessKey", "value": "{{awsAccessKeyId}}", "type": "string"},
                {"key": "secretKey", "value": "{{awsSecretAccessKey}}", "type": "string"},
                {"key": "sessionToken", "value": "{{awsSessionToken}}", "type": "string"},
                {"key": "region", "value": "{{awsRegion}}", "type": "string"},
                {"key": "service", "value": "{{awsService}}", "type": "string"},
            ],
        }
    raise CliError(f"Unsupported auth type: {auth_type}")


def create_collection(api_key: str, collection: Dict[str, Any], workspace_id: Optional[str]) -> str:
    requests = _requests_module()
    params = {"workspace": workspace_id} if workspace_id else None
    response = requests.post(
        f"{POSTMAN_BASE_URL}/collections",
        headers={"X-Api-Key": api_key, "Content-Type": "application/json"},
        params=params,
        json={"collection": collection},
        timeout=30,
    )
    return _extract_collection_id(response)


def update_collection(api_key: str, collection_id: str, collection: Dict[str, Any]) -> str:
    requests = _requests_module()
    response = requests.put(
        f"{POSTMAN_BASE_URL}/collections/{collection_id}",
        headers={"X-Api-Key": api_key, "Content-Type": "application/json"},
        json={"collection": collection},
        timeout=30,
    )
    cid = _extract_collection_id(response)
    return cid or collection_id


def _extract_collection_id(response: Any) -> str:
    if not response.ok:
        raise CliError(f"Postman API error {response.status_code}: {response.text.strip()}")
    try:
        data = response.json()
    except ValueError as exc:
        raise CliError("Postman API returned non-JSON response.") from exc
    info = data.get("collection", {})
    return str(info.get("uid") or info.get("id") or "")


def _requests_module():
    try:
        import requests  # type: ignore
    except ImportError as exc:
        raise CliError("requests package missing. Install: pip install -r requirements.txt") from exc
    return requests


def list_http_apis(region: str, verbose: bool) -> List[Dict[str, Any]]:
    lines = run_command_stream(
        [
            "aws",
            "apigatewayv2",
            "get-apis",
            "--region",
            region,
            "--query",
            "Items[?ProtocolType=='HTTP'].[ApiId,Name]",
            "--output",
            "json",
        ],
        verbose=verbose,
    )
    raw = "\n".join(lines).strip()
    if not raw:
        return []
    try:
        rows = json.loads(raw)
    except ValueError as exc:
        raise CliError("Failed to parse API list from AWS CLI output.") from exc

    result: List[Dict[str, Any]] = []
    for row in rows:
        if isinstance(row, list) and row:
            api_id = str(row[0])
            api_name = str(row[1]) if len(row) > 1 and row[1] is not None else api_id
            result.append({"ApiId": api_id, "Name": api_name})
    return result


def list_http_api_stages(api_id: str, region: str, verbose: bool) -> List[str]:
    lines = run_command_stream(
        [
            "aws",
            "apigatewayv2",
            "get-stages",
            "--api-id",
            api_id,
            "--region",
            region,
            "--query",
            "Items[].StageName",
            "--output",
            "json",
        ],
        verbose=verbose,
    )
    raw = "\n".join(lines).strip()
    if not raw:
        return []
    try:
        values = json.loads(raw)
    except ValueError as exc:
        raise CliError(f"Failed to parse stages for API {api_id}.") from exc
    if isinstance(values, list):
        return [str(v) for v in values if v]
    return []


def choose_stage(stages: List[str], preferred: Optional[str]) -> Optional[str]:
    if not stages:
        return None
    if preferred and preferred in stages:
        return preferred
    if "dev" in stages:
        return "dev"
    if "$default" in stages:
        return "$default"
    return stages[0]


def apply_base_url_to_items(items: List[Dict[str, Any]], base_url: str) -> None:
    for item in items:
        _apply_base_url_in_item(item, base_url.rstrip("/"))


def _apply_base_url_in_item(item: Dict[str, Any], base_url: str) -> None:
    if "item" in item and isinstance(item["item"], list):
        for child in item["item"]:
            if isinstance(child, dict):
                _apply_base_url_in_item(child, base_url)
        return

    request = item.get("request")
    if not isinstance(request, dict):
        return
    url = request.get("url")
    if isinstance(url, str):
        request["url"] = url.replace(BASE_URL_VARIABLE, base_url)
    elif isinstance(url, dict):
        raw = str(url.get("raw", ""))
        replaced = raw.replace(BASE_URL_VARIABLE, base_url)
        url["raw"] = replaced
        parsed = urlparse(replaced)
        url["path"] = [p for p in parsed.path.split("/") if p]
        if parsed.query:
            url["query"] = [{"key": k, "value": v} for k, v in parse_qsl(parsed.query, keep_blank_values=True)]
        elif "query" in url:
            del url["query"]


def main(argv: Optional[list[str]] = None) -> int:
    args = parse_args(argv)
    configure_logging(args.verbose)
    try:
        region = args.region or os.getenv("AWS_DEFAULT_REGION")
        if not region:
            raise CliError("Region is required. Pass --region or set AWS_REGION.")

        output_dir = Path(args.output_dir).resolve()
        single_mode = not args.all_http

        if args.dry_run:
            print("Dry run mode: no files exported/uploaded.")
            if single_mode:
                if not args.api_id:
                    raise CliError("--api-id is required unless --all-http is used.")
                if not args.stage:
                    raise CliError("--stage is required in single API mode.")
                openapi_path = output_dir / f"{args.api_id}-{args.stage}-openapi.json"
                collection_name = args.collection_name or f"{args.api_id}-{args.stage}"
                collection_path = output_dir / f"{_slugify(collection_name)}.postman_collection.json"
                base_url = args.base_url or f"https://{args.api_id}.execute-api.{region}.amazonaws.com/{args.stage}"
                command = build_export_command(args.type, args.api_id, args.stage, region, openapi_path)
                print(f"Planned AWS export command: {' '.join(command)}")
                print(f"Planned OpenAPI path: {openapi_path}")
                print(f"Planned Postman path: {collection_path}")
                print(f"Planned baseUrl: {base_url}")
            else:
                if args.type != "http":
                    raise CliError("--all-http only supports --type http.")
                collection_name = args.collection_name or f"all-http-apis-{region}"
                collection_path = output_dir / f"{_slugify(collection_name)}.postman_collection.json"
                preferred_stage = args.stage or "(auto)"
                print("Planned action: discover all HTTP APIs from API Gateway v2")
                print(f"Planned preferred stage: {preferred_stage}")
                print(f"Planned combined Postman path: {collection_path}")
            return 0

        check_aws_cli(args.verbose)
        output_dir.mkdir(parents=True, exist_ok=True)
        if single_mode:
            api_id = args.api_id
            if not api_id:
                raise CliError("--api-id is required unless --all-http is used.")
            if not args.stage:
                raise CliError("--stage is required in single API mode.")

            collection_name = args.collection_name or f"{api_id}-{args.stage}"
            base_url = args.base_url or f"https://{api_id}.execute-api.{region}.amazonaws.com/{args.stage}"
            openapi_path = output_dir / f"{api_id}-{args.stage}-openapi.json"
            collection_path = output_dir / f"{_slugify(collection_name)}.postman_collection.json"
            exported_path = export_openapi(args.type, api_id, args.stage, region, openapi_path, args.verbose)
            spec = load_openapi(exported_path)
            collection = convert_openapi_to_postman(
                openapi=spec,
                collection_name=collection_name,
                base_url=base_url,
                auth_type=args.auth,
                include_examples=args.include_examples,
                region=region,
            )
            collection_path.write_text(json.dumps(collection, indent=2), encoding="utf-8")
            exported_summary = [str(exported_path)]
            if not args.keep_openapi_files:
                _safe_unlink(exported_path)
        else:
            if args.type != "http":
                raise CliError("--all-http only supports --type http.")

            apis = list_http_apis(region, args.verbose)
            if not apis:
                raise CliError("No HTTP APIs found in this account/region.")

            collection_name = args.collection_name or f"all-http-apis-{region}"
            collection_path = output_dir / f"{_slugify(collection_name)}.postman_collection.json"
            merged_items: List[Dict[str, Any]] = []
            exported_summary = []
            failures: List[str] = []

            for api in apis:
                api_id = str(api.get("ApiId", ""))
                api_name = str(api.get("Name") or api_id)
                if not api_id:
                    continue

                try:
                    stages = list_http_api_stages(api_id, region, args.verbose)
                    stage = choose_stage(stages, args.stage)
                    if not stage:
                        failures.append(f"{api_id} (no stage)")
                        continue

                    base_url = args.base_url or f"https://{api_id}.execute-api.{region}.amazonaws.com/{stage}"
                    openapi_path = output_dir / f"{api_id}-{stage}-openapi.json"
                    exported_path = export_openapi("http", api_id, stage, region, openapi_path, args.verbose)
                    spec = load_openapi(exported_path)
                    api_collection = convert_openapi_to_postman(
                        openapi=spec,
                        collection_name=f"{api_name}-{stage}",
                        base_url=base_url,
                        auth_type=args.auth,
                        include_examples=args.include_examples,
                        region=region,
                    )

                    api_items = api_collection.get("item", [])
                    if isinstance(api_items, list):
                        apply_base_url_to_items(api_items, base_url)
                        merged_items.append({"name": f"{api_name} ({api_id})", "item": api_items})
                        exported_summary.append(str(exported_path))
                    if not args.keep_openapi_files:
                        _safe_unlink(exported_path)
                except CliError as exc:
                    failures.append(f"{api_id} ({exc})")

            if not merged_items:
                joined = "; ".join(failures) if failures else "No APIs were processed."
                raise CliError(f"Failed to generate combined collection. {joined}")

            collection = {
                "info": {
                    "name": collection_name,
                    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
                    "description": "Combined collection for all HTTP APIs.",
                },
                "item": merged_items,
                "variable": _build_variables("", args.auth, region),
                "auth": _build_auth(args.auth),
            }
            collection_path.write_text(json.dumps(collection, indent=2), encoding="utf-8")

            if failures:
                LOGGER.warning("Some APIs were skipped/failed: %s", "; ".join(failures))

        upload_status = "not uploaded"
        collection_id = ""
        if args.postman_api_key:
            if args.postman_collection_id:
                collection_id = update_collection(args.postman_api_key, args.postman_collection_id, collection)
                upload_status = "updated"
            else:
                collection_id = create_collection(args.postman_api_key, collection, args.postman_workspace_id)
                upload_status = "created"

        print("\nSummary")
        print(f"- Exported OpenAPI files: {len(exported_summary)}")
        print(f"- Generated Postman Collection: {collection_path}")
        print(f"- Upload status: {upload_status}")
        if collection_id:
            print(f"- Collection ID: {collection_id}")
        return 0
    except CliError as exc:
        LOGGER.error(str(exc))
        return 2
    except KeyboardInterrupt:
        LOGGER.error("Interrupted by user.")
        return 130


def _slugify(name: str) -> str:
    safe = "".join(ch if ch.isalnum() or ch in ("-", "_") else "-" for ch in name)
    while "--" in safe:
        safe = safe.replace("--", "-")
    return safe.strip("-_") or "collection"


def _safe_unlink(path: Path) -> None:
    try:
        if path.exists():
            path.unlink()
    except OSError as exc:
        LOGGER.warning("Could not delete temporary OpenAPI file %s: %s", path, exc)


if __name__ == "__main__":
    sys.exit(main())
