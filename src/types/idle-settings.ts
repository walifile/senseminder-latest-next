export type SetIdleSettingsPayload = {
  instanceId: string;
  timeout: number; 
  sessionTimeout?: number;
};

export type IdleSettingsResponse = {
  instanceId: string;
  timeout: number; // Y
  sessionTimeout?: number;
  os?: "windows" | "linux";
  operatingSystem?: string;
  configId?: string;
};
