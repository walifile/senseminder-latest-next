# API Gateway OpenAPI -> Postman CLI

Production-oriented Python 3.10+ CLI tool to:
1. Export OpenAPI 3.0 from AWS API Gateway (REST or HTTP)
2. Convert OpenAPI (JSON or YAML) to Postman Collection v2.1
3. Save locally or create/update in Postman using Postman API

## Files

- `api_gateway_to_postman_cli.py` - single-file CLI
- `requirements.txt` - Python dependencies

## Prerequisites

- Python 3.10+
- AWS CLI v2
- AWS credentials configured (`aws configure`, SSO, or environment variables)
- (Optional) Postman API key for upload

## Install

```bash
cd backend/auth/api_gateway_postman_tool
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

## Environment Variables

```bash
# Required unless you pass --region
export AWS_REGION=us-east-1

# Optional for upload mode
export POSTMAN_API_KEY=your_postman_api_key
export POSTMAN_WORKSPACE_ID=your_workspace_id
```

On Windows PowerShell:

```powershell
$env:AWS_REGION="us-east-1"
$env:POSTMAN_API_KEY="your_postman_api_key"
$env:POSTMAN_WORKSPACE_ID="your_workspace_id"
```

## Usage

```bash
python api_gateway_to_postman_cli.py --type rest|http [--api-id <api-id>] [--stage <stage>] [options]
```

### REST API export + local Postman collection

```bash
python api_gateway_to_postman_cli.py \
  --type rest \
  --api-id 558xjerom8 \
  --stage dev \
  --region us-east-1 \
  --auth bearer \
  --output-dir ./out
```

Internally this uses:
`aws apigateway get-export --rest-api-id <id> --stage-name <stage> --export-type oas30 --parameters extensions='integrations,authorizers,apigateway' <outfile>`

### HTTP API export + local Postman collection

```bash
python api_gateway_to_postman_cli.py \
  --type http \
  --api-id lvir6hp7hb \
  --stage dev \
  --region us-east-1 \
  --auth apiKey \
  --output-dir ./out
```

Internally this uses:
`aws apigatewayv2 export-api --api-id <id> --stage-name <stage> --specification OAS30 --output-type JSON <outfile>`

### All HTTP APIs -> one combined Postman collection

```bash
python api_gateway_to_postman_cli.py \
  --type http \
  --all-http \
  --region us-east-1 \
  --auth bearer \
  --output-dir ./out \
  --collection-name all-http-apis
```

Notes:
- Discovers all HTTP APIs from API Gateway v2 automatically.
- Creates one collection with API-wise folders.
- If `--stage` is provided, that stage is preferred. Otherwise auto-selects stage (`dev`, then `$default`, then first available).

### Upload to Postman (create new)

```bash
python api_gateway_to_postman_cli.py \
  --type http \
  --api-id lvir6hp7hb \
  --stage dev \
  --postman-api-key "$POSTMAN_API_KEY" \
  --postman-workspace-id "$POSTMAN_WORKSPACE_ID"
```

### Upload to Postman (update existing)

```bash
python api_gateway_to_postman_cli.py \
  --type http \
  --api-id lvir6hp7hb \
  --stage dev \
  --postman-api-key "$POSTMAN_API_KEY" \
  --postman-collection-id 12345678-abcd-efgh-ijkl-1234567890ab
```

### Dry run

```bash
python api_gateway_to_postman_cli.py --type rest --api-id 558xjerom8 --stage dev --dry-run
```

## CLI Options

- `--type` (`rest|http`) required
- `--api-id` required in single API mode (or `--rest-api-id` alias)
- `--all-http` for all HTTP APIs in one combined collection
- `--stage` required in single API mode; optional in `--all-http` mode
- `--region` default from `AWS_REGION`
- `--output-dir` default `./out`
- `--base-url` override collection `{{baseUrl}}` value
- `--auth` `none|apiKey|bearer|awsSigV4`
- `--include-examples` include request examples from OpenAPI
- `--postman-api-key` Postman API key
- `--postman-workspace-id` workspace for collection creation
- `--postman-collection-id` update existing collection
- `--collection-name` default `<api-id>-<stage>`
- `--dry-run`
- `--verbose`

## Auth handling in generated Postman collection

- `none` -> no auth
- `apiKey` -> `x-api-key: {{apiKey}}` (collection auth)
- `bearer` -> `Authorization: Bearer {{token}}` (collection auth)
- `awsSigV4` -> AWS SigV4 placeholders as collection auth

## URL rewriting behavior

Single API mode:
Every request URL is rewritten to:
`{{baseUrl}}/<path>`

Default `baseUrl`:
`https://{apiId}.execute-api.{region}.amazonaws.com/{stage}`

Use `--base-url` to override.

All HTTP mode:
- Requests are grouped under API folders in one collection.
- URLs are materialized per API/stage (so each API keeps its own execute-api host/stage path).

## Troubleshooting

- **`AWS CLI was not found in PATH`**
  - Install AWS CLI v2 and verify with `aws --version`
- **`Unable to locate credentials`**
  - Configure credentials (`aws configure` or `aws sso login`)
- **`Missing region`**
  - Pass `--region` or set `AWS_REGION`
- **Postman API 401/403**
  - Verify `--postman-api-key` and workspace/collection IDs
- **OpenAPI parse error**
  - Confirm file is valid OpenAPI 3.x JSON/YAML

## Exit Codes

- `0` success
- `2` handled runtime/validation error
- `130` interrupted by user
