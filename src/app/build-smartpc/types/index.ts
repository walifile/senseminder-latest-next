export interface Option {
  value: string;
  label: string;
  pricePerHour?: number;
}

export interface DesktopInstance {
  instanceId: string;
  status?: string;
  state?: string;
  systemName: string;
}



export type PC = {
  id: string;
  systemName: string;
  state: string;
  status: string;
  instanceId: string;
  description?: string;
  configId?: string;
  region?: string;
  userId?: string;
  // for dummy data

  name?: string;
  template?: string;
  uptime?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  cost?: number;
  createdAt?: Date;
  idleTimeout?: number; // minutes until PC goes to sleep
  billingPlan?: string;
  billingPlanDescription?: string;
  schedule?: {
    enabled: boolean;
    autoStartTime?: string;
    autoStopTime?: string;
    frequency?: "everyday" | "weekdays" | "weekends" | "custom";
    startDate?: string | null;
    endDate?: string | null;
    timeZone?: string;
  };
  idleTime?: string;
  specs?: {
    cpu: string;
    ram: string;
    storage: string;
    gpu: string;
    os: string;
  };
  assignedUsers?: AssignedUser[];
  // assignedUsers?: { id: string; name: string; email: string }[];
  assignedUser?: {
    name: string;
    email: string;
  };
  monthlyBillingTotal?: number;
};
export interface CloudPC {
  id?: string;
  name?: string;
  template: string;
  status:
    | "initializing"
    | "initialization"
    | "pending"
    | "building"
    | "running"
    | "starting"
    | "stopping"
    | "stopped"
    | "idle"
    | "not_running";
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  region: string;
  cost: number;
  createdAt: Date;
  idleTimeout: number; // minutes until PC goes to sleep
  schedule?: {
    timeZone: string;
    frequency: string;
    start: string | null;
    end: string | null;
    days: string[];
    customDateRange?: {
      startDate: string;
      endDate: string;
    };
  };
  description: string;
  idleTime: string;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    gpu: string;
    os: string;
  };
  assignedUsers: AssignedUser[];
}

export interface AssignedUser {
  id: number;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export type SelectedPcProps = {
  selectedPCs: number[];
  showDetails: boolean;
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
  cloudPCs: PC[];
  setCloudPCs: React.Dispatch<React.SetStateAction<PC[]>>;
  handleAssignUser: (pc: PC) => void;
};

export type SmartPCConfigDialogMode = "create" | "resize";
export type ResizeInitial = {
  pcName: string;
  operatingSystem: string;
  cpu: string;
  region: string;
  billingPlan: "hourly" | "daily" | "monthly";
  storage?: string;
};

export type ExtraResizeProps = {
  mode?: SmartPCConfigDialogMode;
  initial?: ResizeInitial;
  lockedFields?: ReadonlyArray<
    "pcName" | "operatingSystem" | "region" | "billingPlan" | "storage"
  >;
  onConfirm?: (vals: { cpu: string }) => Promise<boolean> | boolean;
  instanceIdForResize?: string;

  loadExisting?: () => Promise<ResizeInitial | undefined>;
};

export type BaseProps = {
  showNewPCDialog: boolean;
  setShowNewPCDialog: (value: boolean) => void;
};

export type SmartPCConfigDialogProps = BaseProps & ExtraResizeProps;
