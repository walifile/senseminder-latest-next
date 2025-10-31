import Client from "./share-client";

export default async function ShareDownloadPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  return <Client shareId={shareId} />;
}

export const dynamic = "force-dynamic";
