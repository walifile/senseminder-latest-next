export interface InstanceSpecs {
  cpu: string;
  ram: string;
  storage: string;
  gpu: string;
  os: string;
}

export interface InstanceDetail {
  systemName: string;
  instanceId?: string;
  region?: string;
  uptime?: string;
  idleTimeout?: number;//mewly added by me
  cpuUsage?: string;
  memoryUsage?: string;
  specs?: InstanceSpecs;
  error?: string;
}

export async function fetchInstanceDetails(userId: string, instanceNames: string[]): Promise<InstanceDetail[]> {
  try {
    const res = await fetch("https://4oacxj1xyk.execute-api.us-east-1.amazonaws.com/instance-details-v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        instanceNames,
      }),
    });

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const data = await res.json();
    return data as InstanceDetail[];
  } catch (err) {
    console.error("Failed to load real-time metrics:", err);
    return [];
  }
}