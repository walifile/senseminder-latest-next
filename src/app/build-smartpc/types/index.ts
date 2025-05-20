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
  region?: string;
  // for dummy data

  name?: string;
  template?: string;
  uptime?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  cost?: number;
  createdAt?: Date;
  idleTimeout?: number; // minutes until PC goes to sleep
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
  idleTime?: string;
  specs?: {
    cpu: string;
    ram: string;
    storage: string;
    gpu: string;
    os: string;
  };
  assignedUsers?: AssignedUser[];
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
  setCloudPCs?: React.Dispatch<React.SetStateAction<PC[]>>;
  handleAssignUser: (pc: PC) => void;
};
