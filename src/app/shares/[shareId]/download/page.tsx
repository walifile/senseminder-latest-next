import Client from "./share-client";

export default function ShareDownloadPage({ params }: { params: { shareId: string } }) {
  return <Client shareId={params.shareId} />;
}

export const dynamic = "force-dynamic";
