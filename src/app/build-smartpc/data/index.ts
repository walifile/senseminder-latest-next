import { AssignedUser, Option } from "../types";

export const osOptions: Option[] = [
  { value: "Windows 11", label: "Windows 11" },
  // { value: "windows11pro", label: "Windows 11 Pro" },
  // { value: "windows10", label: "Windows 10" },
  // { value: "windows10pro", label: "Windows 10 Pro" },
];

export const cpuOptions: Option[] = [
  { value: "Basic_win11_2core_4gbRam", label: "Basic_win11_2core_4gbRam" },
  {
    value: "Standerd_win11_4core_8gbRam",
    label: "Standerd_win11_4core_8gbRam",
  },
  { value: "Pro_win11_8core_16gbRam", label: "Pro_win11_8core_16gbRam" },
  { value: "Ultra_win11_16core_32gbRam", label: "Ultra_win11_16core_32gbRam" },
  // { value: "4", label: "4 Core", pricePerHour: 0.5 },
  // { value: "8", label: "8 Core", pricePerHour: 1.0 },
  // { value: "12", label: "12 Core", pricePerHour: 1.5 },
];

// const memoryOptions: Option[] = [
//   { value: "4", label: "4 GB RAM", pricePerHour: 0.1 },
//   { value: "8", label: "8 GB RAM", pricePerHour: 0.2 },
//   { value: "16", label: "16 GB RAM", pricePerHour: 0.4 },
//   { value: "32", label: "32 GB RAM", pricePerHour: 0.8 },
// ];

export const storageOptions: Option[] = [
  { value: "120", label: "120 GB" },
  { value: "220", label: "220 GB" },
  { value: "300", label: "300 GB" },
  { value: "500", label: "500 GB" },
  // { value: "256", label: "256 GB", pricePerHour: 0.1 },
  // { value: "512", label: "512 GB", pricePerHour: 0.2 },
  // { value: "1024", label: "1 TB", pricePerHour: 0.4 },
];

export const locationOptions: Option[] = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  // { value: "us-west", label: "US West (San Francisco)" },
  // { value: "eu-central", label: "EU Central (Frankfurt)" },
  // { value: "ap-southeast", label: "Asia Pacific (Singapore)" },
];

export const stableStates = ["running", "stopped"];

// unused

export const regionOptions = [
  { value: "us-east", label: "US East" },
  { value: "eu-central", label: "EU Central" },
];

export const mockUsers: AssignedUser[] = [
  { id: 1, name: "John Doe", email: "john.doe@example.com" },
  { id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
  { id: 3, name: "Alice Johnson", email: "alice@example.com" },
];

export const mockPCs = [
  {
    id: "1",
    name: "DevelopmentPC",
    template: "performance",
    status: "running",
    uptime: 86400,
    cpuUsage: 45,
    memoryUsage: 60,
    region: "us-east",
    cost: 2.5,
    createdAt: new Date(),
    idleTimeout: 0,
    description: "Development environment",
    idleTime: "None",
    specs: {
      cpu: "8 Core",
      ram: "16GB",
      storage: "512GB SSD",
      gpu: "NVIDIA RTX 3060",
      os: "Windows 11 Pro",
    },
    assignedUsers: [mockUsers[0], mockUsers[1]],

    // assignedUsers: [mockUsers[0], mockUsers[1]],
  },
  // {
  //   id: "2",
  //   name: "GamingPC",
  //   template: "ultimate",
  //   status: "building",
  //   uptime: 0,
  //   cpuUsage: 0,
  //   memoryUsage: 0,
  //   region: "us-west",
  //   cost: 96.0,
  //   createdAt: new Date("2024-02-01"),
  //   idleTimeout: 0,
  //   description: "For high-end workloads",
  //   idleTime: "None",
  //   specs: {
  //     cpu: "12 Core Intel Xeon",
  //     ram: "32GB DDR4",
  //     storage: "1TB NVMe SSD",
  //     gpu: "NVIDIA RTX 3080",
  //     os: "Windows 11 Pro",
  //   },
  //   assignedUsers: [],
  // },
];

export const pcTemplates = [
  {
    id: "basic",
    name: "Basic PC",
    cpu: "2 Core",
    ram: "4GB",
    storage: "128GB SSD",
    gpu: "Integrated",
    os: "Windows 11",
    description: "Perfect for basic productivity tasks",
    pricePerHour: 0.5,
  },
  {
    id: "standard",
    name: "Standard PC",
    cpu: "4 Core",
    ram: "8GB",
    storage: "256GB SSD",
    gpu: "NVIDIA RTX 2060",
    os: "Windows 11 Pro",
    description: "Great for multitasking and light gaming",
    pricePerHour: 1.0,
  },
  {
    id: "performance",
    name: "Performance PC",
    cpu: "8 Core",
    ram: "16GB",
    storage: "512GB SSD",
    gpu: "NVIDIA RTX 3060",
    os: "Windows 11 Pro",
    description: "Ideal for demanding applications",
    pricePerHour: 2.0,
  },
  {
    id: "ultimate",
    name: "Ultimate PC",
    cpu: "12 Core",
    ram: "32GB",
    storage: "1TB SSD",
    gpu: "NVIDIA RTX 3080",
    os: "Windows 11 Pro",
    description: "For high-end workloads",
    pricePerHour: 4.0,
  },
];

// const cpuOptions = [
//   { value: "2", label: "2 Core", pricePerHour: 0.25 },
//   { value: "4", label: "4 Core", pricePerHour: 0.5 },
//   { value: "8", label: "8 Core", pricePerHour: 1.0 },
//   { value: "12", label: "12 Core", pricePerHour: 1.5 },
// ];

// const osOptions = [
//   { value: "windows11", label: "Windows 11" },
//   { value: "windows11pro", label: "Windows 11 Pro" },
//   { value: "windows10", label: "Windows 10" },
//   { value: "windows10pro", label: "Windows 10 Pro" },
// ];

// const storageOptions = [
//   { value: "120", label: "120 GB", pricePerHour: 0.05 },
//   { value: "256", label: "256 GB", pricePerHour: 0.1 },
//   { value: "512", label: "512 GB", pricePerHour: 0.2 },
//   { value: "1024", label: "1 TB", pricePerHour: 0.4 },
// ];

// const locationOptions = [
//   { value: "us-east", label: "US East (New York)" },
//   { value: "us-west", label: "US West (San Francisco)" },
//   { value: "eu-central", label: "EU Central (Frankfurt)" },
//   { value: "ap-southeast", label: "Asia Pacific (Singapore)" },
// ];
