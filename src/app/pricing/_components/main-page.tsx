"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FAQ from "@/app/home/_components/faq";
import { billingPlans } from "@/app/dashboard/billing/data";
import { MainLayout } from "@/app/home/_components/main-layout";

import { Button } from "@/components/ui/button";

const pricingFacts = [
  { label: "Sense PC plans", value: "Hourly, Daily, Monthly" },
  {
    label: "Sense Cloud billing",
    value: "Auto-tier by highest monthly usage",
  },
  { label: "Final billing source", value: "Billing dashboard usage records" },
];

const planBestFor: Record<string, string> = {
  hourly: "Short sessions or variable usage",
  daily: "Consistent day-based workloads",
  monthly: "Frequent long-duration workloads",
};

const instanceSpecMap: Record<
  string,
  {
    cpu: string;
    ram: string;
    gpu: string;
    gpuMemory: string;
    network: string;
  }
> = {
  "m7a.xlarge": {
    cpu: "4 vCPU",
    ram: "16 GB",
    gpu: "—",
    gpuMemory: "—",
    network: "Up to 12.5 Gbps",
  },
  "m7a.2xlarge": {
    cpu: "8 vCPU",
    ram: "32 GB",
    gpu: "—",
    gpuMemory: "—",
    network: "Up to 12.5 Gbps",
  },
  "m7a.4xlarge": {
    cpu: "16 vCPU",
    ram: "64 GB",
    gpu: "—",
    gpuMemory: "—",
    network: "Up to 12.5 Gbps",
  },
  "m8g.xlarge": {
    cpu: "4 vCPU",
    ram: "16 GB",
    gpu: "—",
    gpuMemory: "—",
    network: "Up to 15 Gbps",
  },
  "m8g.2xlarge": {
    cpu: "8 vCPU",
    ram: "32 GB",
    gpu: "—",
    gpuMemory: "—",
    network: "Up to 15 Gbps",
  },
  "m8g.4xlarge": {
    cpu: "16 vCPU",
    ram: "64 GB",
    gpu: "—",
    gpuMemory: "—",
    network: "Up to 15 Gbps",
  },
  "g6f.xlarge": {
    cpu: "4 vCPU",
    ram: "16 GB",
    gpu: "NVIDIA L4 (shared)",
    gpuMemory: "L4 Memory (shared)",
    network: "Up to 12.5 Gbps",
  },
  "g6f.2xlarge": {
    cpu: "8 vCPU",
    ram: "32 GB",
    gpu: "NVIDIA L4 (shared)",
    gpuMemory: "L4 Memory (shared)",
    network: "Up to 12.5 Gbps",
  },
  "g6f.4xlarge": {
    cpu: "16 vCPU",
    ram: "64 GB",
    gpu: "NVIDIA L4 (shared)",
    gpuMemory: "L4 Memory (shared)",
    network: "Up to 12.5 Gbps",
  },
};

const locationMap: Record<string, string> = {
  "us-east-1": "N. Virginia",
  "us-west-2": "Oregon",
};

const allConfigRowsSource: Array<{
  os: string;
  pcType: string;
  instanceType: string;
  region: string;
  hourly: string;
  daily: string;
  monthly: string;
}> = [
  {
    os: "Windows 10",
    pcType: "SensePC.Standard10—4Cores·16GBRAM",
    instanceType: "m7a.xlarge",
    region: "us-east-1",
    hourly: "$0.59",
    daily: "$4.69",
    monthly: "$79.79",
  },
  {
    os: "Windows 10",
    pcType: "SensePC.Standard10—4Cores·16GBRAM.GPU",
    instanceType: "g6f.xlarge",
    region: "us-east-1",
    hourly: "$0.69",
    daily: "$4.79",
    monthly: "$80.79",
  },
  {
    os: "Windows 10",
    pcType: "SensePC.Pro10—8Cores·32GBRAM",
    instanceType: "m7a.2xlarge",
    region: "us-east-1",
    hourly: "$0.99",
    daily: "$9.29",
    monthly: "$158.49",
  },
  {
    os: "Windows 10",
    pcType: "SensePC.Pro10—8Cores·32GBRAM.GPU",
    instanceType: "g6f.2xlarge",
    region: "us-east-1",
    hourly: "$1.09",
    daily: "$9.49",
    monthly: "$160.69",
  },
  {
    os: "Windows 10",
    pcType: "SensePC.Ultra10—16Cores·64GBRAM",
    instanceType: "m7a.4xlarge",
    region: "us-east-1",
    hourly: "$1.99",
    daily: "$18.49",
    monthly: "$316.09",
  },
  {
    os: "Windows 10",
    pcType: "SensePC.Ultra10—16Cores·64GBRAM.GPU",
    instanceType: "g6f.4xlarge",
    region: "us-east-1",
    hourly: "$2.19",
    daily: "$18.69",
    monthly: "$320.39",
  },
  {
    os: "Windows 10",
    pcType: "SensePC.Standard10—4Cores·16GBRAM",
    instanceType: "m7a.xlarge",
    region: "us-west-2",
    hourly: "$0.59",
    daily: "$4.69",
    monthly: "$79.79",
  },
  {
    os: "Windows 10",
    pcType: "SensePC.Standard10—4Cores·16GBRAM.GPU",
    instanceType: "g6f.xlarge",
    region: "us-west-2",
    hourly: "$0.69",
    daily: "$4.79",
    monthly: "$80.79",
  },
  {
    os: "Windows 10",
    pcType: "SensePC.Pro10—8Cores·32GBRAM",
    instanceType: "m7a.2xlarge",
    region: "us-west-2",
    hourly: "$0.99",
    daily: "$9.29",
    monthly: "$158.49",
  },
  {
    os: "Windows 10",
    pcType: "SensePC.Pro10—8Cores·32GBRAM.GPU",
    instanceType: "g6f.2xlarge",
    region: "us-west-2",
    hourly: "$1.09",
    daily: "$9.49",
    monthly: "$160.69",
  },
  {
    os: "Windows 10",
    pcType: "SensePC.Ultra10—16Cores·64GBRAM",
    instanceType: "m7a.4xlarge",
    region: "us-west-2",
    hourly: "$1.99",
    daily: "$18.49",
    monthly: "$316.09",
  },
  {
    os: "Windows 10",
    pcType: "SensePC.Ultra10—16Cores·64GBRAM.GPU",
    instanceType: "g6f.4xlarge",
    region: "us-west-2",
    hourly: "$2.19",
    daily: "$18.69",
    monthly: "$320.39",
  },

  {
    os: "Windows 11",
    pcType: "SensePC.Standard11—4Cores·16GBRAM",
    instanceType: "m7a.xlarge",
    region: "us-east-1",
    hourly: "$0.59",
    daily: "$4.69",
    monthly: "$79.79",
  },
  {
    os: "Windows 11",
    pcType: "SensePC.Standard11—4Cores·16GBRAM.GPU",
    instanceType: "g6f.xlarge",
    region: "us-east-1",
    hourly: "$0.69",
    daily: "$4.79",
    monthly: "$80.79",
  },
  {
    os: "Windows 11",
    pcType: "SensePC.Pro11—8Cores·32GBRAM",
    instanceType: "m7a.2xlarge",
    region: "us-east-1",
    hourly: "$0.99",
    daily: "$9.39",
    monthly: "$158.49",
  },
  {
    os: "Windows 11",
    pcType: "SensePC.Pro11—8Cores·32GBRAM.GPU",
    instanceType: "g6f.2xlarge",
    region: "us-east-1",
    hourly: "$1.09",
    daily: "$9.49",
    monthly: "$160.69",
  },
  {
    os: "Windows 11",
    pcType: "SensePC.Ultra11—16Cores·64GBRAM",
    instanceType: "m7a.4xlarge",
    region: "us-east-1",
    hourly: "$1.99",
    daily: "$18.49",
    monthly: "$316.09",
  },
  {
    os: "Windows 11",
    pcType: "SensePC.Ultra11—16Cores·64GBRAM.GPU",
    instanceType: "g6f.4xlarge",
    region: "us-east-1",
    hourly: "$2.19",
    daily: "$18.69",
    monthly: "$320.39",
  },
  {
    os: "Windows 11",
    pcType: "SensePC.Standard11—4Cores·16GBRAM",
    instanceType: "m7a.xlarge",
    region: "us-west-2",
    hourly: "$0.59",
    daily: "$4.69",
    monthly: "$79.79",
  },
  {
    os: "Windows 11",
    pcType: "SensePC.Standard11—4Cores·16GBRAM.GPU",
    instanceType: "g6f.xlarge",
    region: "us-west-2",
    hourly: "$0.69",
    daily: "$4.79",
    monthly: "$80.79",
  },
  {
    os: "Windows 11",
    pcType: "SensePC.Pro11—8Cores·32GBRAM",
    instanceType: "m7a.2xlarge",
    region: "us-west-2",
    hourly: "$0.99",
    daily: "$9.39",
    monthly: "$158.49",
  },
  {
    os: "Windows 11",
    pcType: "SensePC.Pro11—8Cores·32GBRAM.GPU",
    instanceType: "g6f.2xlarge",
    region: "us-west-2",
    hourly: "$1.09",
    daily: "$9.49",
    monthly: "$160.69",
  },
  {
    os: "Windows 11",
    pcType: "SensePC.Ultra11—16Cores·64GBRAM",
    instanceType: "m7a.4xlarge",
    region: "us-west-2",
    hourly: "$1.99",
    daily: "$18.49",
    monthly: "$316.09",
  },
  {
    os: "Windows 11",
    pcType: "SensePC.Ultra11—16Cores·64GBRAM.GPU",
    instanceType: "g6f.4xlarge",
    region: "us-west-2",
    hourly: "$2.19",
    daily: "$18.69",
    monthly: "$320.39",
  },

  {
    os: "Debian 12 ARM",
    pcType: "Debian12_ARM_4core_16gbRam",
    instanceType: "m8g.xlarge",
    region: "us-east-1",
    hourly: "$0.29",
    daily: "$2.09",
    monthly: "$34.99",
  },
  {
    os: "Debian 12 ARM",
    pcType: "Debian12_ARM_8core_32gbRam",
    instanceType: "m8g.2xlarge",
    region: "us-east-1",
    hourly: "$0.49",
    daily: "$4.09",
    monthly: "$68.99",
  },
  {
    os: "Debian 12 ARM",
    pcType: "Debian12_ARM_16core_64gbRam",
    instanceType: "m8g.4xlarge",
    region: "us-east-1",
    hourly: "$0.99",
    daily: "$8.09",
    monthly: "$136.99",
  },
  {
    os: "Debian 12 ARM",
    pcType: "Debian12_ARM_4core_16gbRam",
    instanceType: "m8g.xlarge",
    region: "us-west-2",
    hourly: "$0.29",
    daily: "$2.09",
    monthly: "$34.99",
  },
  {
    os: "Debian 12 ARM",
    pcType: "Debian12_ARM_8core_32gbRam",
    instanceType: "m8g.2xlarge",
    region: "us-west-2",
    hourly: "$0.49",
    daily: "$4.09",
    monthly: "$68.99",
  },
  {
    os: "Debian 12 ARM",
    pcType: "Debian12_ARM_16core_64gbRam",
    instanceType: "m8g.4xlarge",
    region: "us-west-2",
    hourly: "$0.99",
    daily: "$8.09",
    monthly: "$136.99",
  },

  {
    os: "Debian 12 x64",
    pcType: "Debian12_X64_4core_16gbRam",
    instanceType: "m7a.xlarge",
    region: "us-east-1",
    hourly: "$0.39",
    daily: "$2.69",
    monthly: "$44.89",
  },
  {
    os: "Debian 12 x64",
    pcType: "Debian12_X64_4core_16gbRam.GPU",
    instanceType: "g6f.xlarge",
    region: "us-east-1",
    hourly: "$0.49",
    daily: "$2.79",
    monthly: "$45.99",
  },
  {
    os: "Debian 12 x64",
    pcType: "Debian12_X64_8core_32gbRam",
    instanceType: "m7a.2xlarge",
    region: "us-east-1",
    hourly: "$0.59",
    daily: "$5.19",
    monthly: "$88.79",
  },
  {
    os: "Debian 12 x64",
    pcType: "Debian12_X64_8core_32gbRam.GPU",
    instanceType: "g6f.2xlarge",
    region: "us-east-1",
    hourly: "$0.69",
    daily: "$5.39",
    monthly: "$90.89",
  },
  {
    os: "Debian 12 x64",
    pcType: "Debian12_X64_16core_64gbRam",
    instanceType: "m7a.4xlarge",
    region: "us-east-1",
    hourly: "$1.19",
    daily: "$10.29",
    monthly: "$176.59",
  },
  {
    os: "Debian 12 x64",
    pcType: "Debian12_X64_16core_64gbRam.GPU",
    instanceType: "g6f.4xlarge",
    region: "us-east-1",
    hourly: "$1.29",
    daily: "$10.59",
    monthly: "$180.89",
  },
  {
    os: "Debian 12 x64",
    pcType: "Debian12_X64_4core_16gbRam",
    instanceType: "m7a.xlarge",
    region: "us-west-2",
    hourly: "$0.39",
    daily: "$2.69",
    monthly: "$44.89",
  },
  {
    os: "Debian 12 x64",
    pcType: "Debian12_X64_4core_16gbRam.GPU",
    instanceType: "g6f.xlarge",
    region: "us-west-2",
    hourly: "$0.49",
    daily: "$2.79",
    monthly: "$45.99",
  },
  {
    os: "Debian 12 x64",
    pcType: "Debian12_X64_8core_32gbRam",
    instanceType: "m7a.2xlarge",
    region: "us-west-2",
    hourly: "$0.59",
    daily: "$5.19",
    monthly: "$88.79",
  },
  {
    os: "Debian 12 x64",
    pcType: "Debian12_X64_8core_32gbRam.GPU",
    instanceType: "g6f.2xlarge",
    region: "us-west-2",
    hourly: "$0.69",
    daily: "$5.39",
    monthly: "$90.89",
  },
  {
    os: "Debian 12 x64",
    pcType: "Debian12_X64_16core_64gbRam",
    instanceType: "m7a.4xlarge",
    region: "us-west-2",
    hourly: "$1.19",
    daily: "$10.29",
    monthly: "$176.59",
  },
  {
    os: "Debian 12 x64",
    pcType: "Debian12_X64_16core_64gbRam.GPU",
    instanceType: "g6f.4xlarge",
    region: "us-west-2",
    hourly: "$1.29",
    daily: "$10.59",
    monthly: "$180.89",
  },

  {
    os: "Ubuntu 24.04 LTS ARM",
    pcType: "Ubuntu_24.04_LTS_ARM_4core_16gbRam",
    instanceType: "m8g.xlarge",
    region: "us-east-1",
    hourly: "$0.29",
    daily: "$2.89",
    monthly: "$34.99",
  },
  {
    os: "Ubuntu 24.04 LTS ARM",
    pcType: "Ubuntu_24.04_LTS_ARM_8core_32gbRam",
    instanceType: "m8g.2xlarge",
    region: "us-east-1",
    hourly: "$0.49",
    daily: "$4.09",
    monthly: "$68.99",
  },
  {
    os: "Ubuntu 24.04 LTS ARM",
    pcType: "Ubuntu_24.04_LTS_ARM_16core_64gbRam",
    instanceType: "m8g.4xlarge",
    region: "us-east-1",
    hourly: "$0.99",
    daily: "$8.09",
    monthly: "$136.99",
  },
  {
    os: "Ubuntu 24.04 LTS ARM",
    pcType: "Ubuntu_24.04_LTS_ARM_4core_16gbRam",
    instanceType: "m8g.xlarge",
    region: "us-west-2",
    hourly: "$0.29",
    daily: "$2.89",
    monthly: "$34.99",
  },
  {
    os: "Ubuntu 24.04 LTS ARM",
    pcType: "Ubuntu_24.04_LTS_ARM_8core_32gbRam",
    instanceType: "m8g.2xlarge",
    region: "us-west-2",
    hourly: "$0.49",
    daily: "$4.09",
    monthly: "$68.99",
  },
  {
    os: "Ubuntu 24.04 LTS ARM",
    pcType: "Ubuntu_24.04_LTS_ARM_16core_64gbRam",
    instanceType: "m8g.4xlarge",
    region: "us-west-2",
    hourly: "$0.99",
    daily: "$8.09",
    monthly: "$136.99",
  },

  {
    os: "Ubuntu 24.04 LTS x64",
    pcType: "Ubuntu_24.04_LTS_X64_4core_16gbRam",
    instanceType: "m7a.xlarge",
    region: "us-east-1",
    hourly: "$0.39",
    daily: "$2.69",
    monthly: "$44.89",
  },
  {
    os: "Ubuntu 24.04 LTS x64",
    pcType: "Ubuntu_24.04_LTS_X64_4core_16gbRam.GPU",
    instanceType: "g6f.xlarge",
    region: "us-east-1",
    hourly: "$0.49",
    daily: "$2.79",
    monthly: "$45.89",
  },
  {
    os: "Ubuntu 24.04 LTS x64",
    pcType: "Ubuntu_24.04_LTS_X64_8core_32gbRam",
    instanceType: "m7a.2xlarge",
    region: "us-east-1",
    hourly: "$0.59",
    daily: "$5.19",
    monthly: "$88.79",
  },
  {
    os: "Ubuntu 24.04 LTS x64",
    pcType: "Ubuntu_24.04_LTS_X64_8core_32gbRam.GPU",
    instanceType: "g6f.2xlarge",
    region: "us-east-1",
    hourly: "$0.69",
    daily: "$5.39",
    monthly: "$90.89",
  },
  {
    os: "Ubuntu 24.04 LTS x64",
    pcType: "Ubuntu_24.04_LTS_X64_16core_64gbRam",
    instanceType: "m7a.4xlarge",
    region: "us-east-1",
    hourly: "$1.19",
    daily: "$10.29",
    monthly: "$176.69",
  },
  {
    os: "Ubuntu 24.04 LTS x64",
    pcType: "Ubuntu_24.04_LTS_X64_16core_64gbRam.GPU",
    instanceType: "g6f.4xlarge",
    region: "us-east-1",
    hourly: "$1.29",
    daily: "$10.59",
    monthly: "$180.89",
  },
  {
    os: "Ubuntu 24.04 LTS x64",
    pcType: "Ubuntu_24.04_LTS_X64_4core_16gbRam",
    instanceType: "m7a.xlarge",
    region: "us-west-2",
    hourly: "$0.39",
    daily: "$2.69",
    monthly: "$44.89",
  },
  {
    os: "Ubuntu 24.04 LTS x64",
    pcType: "Ubuntu_24.04_LTS_X64_4core_16gbRam.GPU",
    instanceType: "g6f.xlarge",
    region: "us-west-2",
    hourly: "$0.49",
    daily: "$2.79",
    monthly: "$45.89",
  },
  {
    os: "Ubuntu 24.04 LTS x64",
    pcType: "Ubuntu_24.04_LTS_X64_8core_32gbRam",
    instanceType: "m7a.2xlarge",
    region: "us-west-2",
    hourly: "$0.59",
    daily: "$5.19",
    monthly: "$88.79",
  },
  {
    os: "Ubuntu 24.04 LTS x64",
    pcType: "Ubuntu_24.04_LTS_X64_8core_32gbRam.GPU",
    instanceType: "g6f.2xlarge",
    region: "us-west-2",
    hourly: "$0.69",
    daily: "$5.39",
    monthly: "$90.89",
  },
  {
    os: "Ubuntu 24.04 LTS x64",
    pcType: "Ubuntu_24.04_LTS_X64_16core_64gbRam",
    instanceType: "m7a.4xlarge",
    region: "us-west-2",
    hourly: "$1.19",
    daily: "$10.29",
    monthly: "$176.69",
  },
  {
    os: "Ubuntu 24.04 LTS x64",
    pcType: "Ubuntu_24.04_LTS_X64_16core_64gbRam.GPU",
    instanceType: "g6f.4xlarge",
    region: "us-west-2",
    hourly: "$1.29",
    daily: "$10.59",
    monthly: "$180.89",
  },
];

const pcConfigurationRows = allConfigRowsSource.map((row) => ({
  ...row,
  ...instanceSpecMap[row.instanceType],
  regionLocation: `${row.region} > ${locationMap[row.region]}`,
}));

const regionFilterOptions = [
  { label: "All Locations", value: "all" },
  { label: "New York", value: "us-east-1" },
  { label: "California", value: "us-west-2" },
];

const ssdPricingRows = [
  // {
  //   capacity: "120 GB",
  //   iops: "3,000",
  //   throughput: "125 MB/s",
  //   hourly: "$0.02",
  //   daily: "$0.39",
  //   monthly: "$10.67",
  // },
  {
    capacity: "220 GB",
    iops: "3,000",
    throughput: "125 MB/s",
    hourly: "$0.03",
    daily: "$0.83",
    monthly: "$19.80",
    type: "gp3",
  },
  {
    capacity: "300 GB",
    iops: "3,000",
    throughput: "125 MB/s",
    hourly: "$0.04",
    daily: "$1.13",
    monthly: "$27.00",
  },
  {
    capacity: "400 GB",
    iops: "3,000",
    throughput: "125 MB/s",
    hourly: "$0.05",
    daily: "$1.50",
    monthly: "$36.00",
  },
  {
    capacity: "500 GB",
    iops: "3,000",
    throughput: "125 MB/s",
    hourly: "$0.06",
    daily: "$1.88",
    monthly: "$45.00",
  },
  {
    capacity: "1000 GB",
    iops: "3,000",
    throughput: "125 MB/s",
    hourly: "$0.13",
    daily: "$3.75",
    monthly: "$90.00",
  },
];

const cloudBillingSteps = [
  {
    title: "1) Use Sense Cloud normally",
    detail:
      "Upload and store files throughout the month. You do not manually select a storage tier.",
  },
  {
    title: "2) Tier is calculated automatically",
    detail:
      "Sense Cloud tracks the highest storage tier reached in your billing cycle (T-1 to T-50).",
  },
  {
    title: "3) Review final amount",
    detail:
      "Your billing dashboard shows the final storage tier and effective charge for that cycle.",
  },
];

const pricingFaqItems = [
  {
    question: "How does Sense PC billing work?",
    answer:
      "Sense PC offers Hourly, Daily, and Monthly plans. You can choose a plan for each machine based on expected usage.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Yes. You can update plan selection as your workload changes, based on the options available in your account.",
  },
  {
    question: "How is Sense Cloud storage billed?",
    answer:
      "Sense Cloud billing is auto-tiered. The system calculates your final tier from highest monthly usage and shows the charge in your billing dashboard.",
  },
  {
    question: "Where can I track my charges?",
    answer:
      "You can review usage history and charge details from your account billing section.",
  },
];

const cleanText = (value: string) => value.replace("—", "-");

const MainPage = () => {
  const [selectedRegion, setSelectedRegion] = useState("all");

  const filteredPcConfigurationRows = useMemo(() => {
    if (selectedRegion === "all") return pcConfigurationRows;
    return pcConfigurationRows.filter(
      (config) => config.region === selectedRegion,
    );
  }, [selectedRegion]);

  return (
    <MainLayout>
      <div className="flex-grow pt-28 md:pt-32 pb-16 font-['Inter']">
        <div className="container mx-auto px-4 md:px-6 space-y-10 md:space-y-14">
        <section className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0 px-6 md:px-12 py-10 md:py-12">
          {/* <Breadcrumb
            items={[{ label: "Home", href: "/" }, { label: "Pricing" }]}
          /> */}

          <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <h1 className="text-black dark:text-white text-3xl md:text-[50px] font-bold font-['Space_Grotesk'] leading-[1.02]">
                Pricing and billing for Sense PC and Sense Cloud
              </h1>

              <p className="mt-5 max-w-3xl text-base md:text-lg text-[#454545] dark:text-[#B9C2D5] leading-relaxed">
                Choose a plan based on your usage pattern. Final charges are
                calculated from usage records shown in your billing dashboard.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {pricingFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-2xl border border-[#2530F022] dark:border-white/10 bg-[#2530F008] dark:bg-white/[0.03] px-4 py-4"
                  >
                    <p className="text-xs uppercase tracking-[0.12em] text-[#2530F0] dark:text-[#13E1EA]">
                      {fact.label}
                    </p>
                    <p className="mt-2 text-sm md:text-base text-black dark:text-white font-semibold">
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="rounded-full px-7 py-3 w-full sm:w-auto"
                >
                  <Link href="/build-sensepc">Build Sense PC</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full px-7 py-3 w-full sm:w-auto"
                >
                  <Link href="/dashboard/billing">Open Billing Dashboard</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full px-7 py-3 w-full sm:w-auto"
                >
                  <Link href="/#sensepc-cost-calculator">
                    Open Cost Calculator
                  </Link>
                </Button>
              </div>
            </div>

            <aside className="rounded-2xl border border-[#2530F033] dark:border-white/15 bg-[#2530F00A] dark:bg-white/[0.03] p-5 md:p-6">
              <h2 className="text-black dark:text-white text-xl font-semibold font-['Space_Grotesk']">
                Start here
              </h2>
              <ul className="mt-4 space-y-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5]">
                <li>- Use Hourly for short or variable usage.</li>
                <li>- Use Daily for regular day-based usage.</li>
                <li>- Use Monthly for steady long-duration workloads.</li>
                <li>
                  - Sense Cloud tier is auto-calculated from monthly usage.
                </li>
              </ul>
            </aside>
          </div>

          <nav
            className="mt-8 flex flex-wrap gap-2"
            aria-label="Pricing sections quick navigation"
          >
            <a
              href="#sense-pc-pricing"
              className="rounded-full border border-[#2530F033] dark:border-white/20 px-4 py-2 text-sm text-[#2530F0] dark:text-[#13E1EA] transition-colors hover:bg-[#2530F014] dark:hover:bg-white/10"
            >
              Sense PC Plans
            </a>
            <a
              href="#sense-cloud-pricing"
              className="rounded-full border border-[#2530F033] dark:border-white/20 px-4 py-2 text-sm text-[#2530F0] dark:text-[#13E1EA] transition-colors hover:bg-[#2530F014] dark:hover:bg-white/10"
            >
              Sense Cloud Billing
            </a>
            <a
              href="#billing-notes"
              className="rounded-full border border-[#2530F033] dark:border-white/20 px-4 py-2 text-sm text-[#2530F0] dark:text-[#13E1EA] transition-colors hover:bg-[#2530F014] dark:hover:bg-white/10"
            >
              Billing Notes
            </a>
          </nav>
        </section>

        <section
          id="sense-pc-pricing"
          className="grid gap-4 md:grid-cols-3"
          aria-label="Sense PC plan cards"
        >
          {billingPlans.map((plan) => (
            <article
              key={plan.id}
              className="rounded-2xl border border-[#2530F022] dark:border-white/10 bg-[#5220DE08] dark:bg-white/[0.03] px-5 py-5"
            >
              <h2 className="text-black dark:text-white text-lg font-semibold font-['Space_Grotesk']">
                Sense PC {plan.name}
              </h2>
              <p className="mt-2 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5] leading-relaxed">
                Best for: {planBestFor[plan.id]}
              </p>
              <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-[#454545] dark:text-[#B9C2D5]">
                {plan.features.slice(0, 2).map((feature) => (
                  <li key={feature}>{cleanText(feature)}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section
          className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0 px-6 md:px-12 py-8"
          aria-label="Sense PC configuration comparison"
        >
          <h2 className="text-black dark:text-white text-2xl md:text-3xl font-bold font-['Space_Grotesk'] leading-8 tracking-tight">
            Sense PC Pricing and Comparison
          </h2>
          <p className="mt-3 text-[#454545] dark:text-[#B9C2D5]">
            Compare hardware profiles and review pricing in the live calculator.
            Pricing during PC creation may be slightly different from the values
            shown here. Please check the live cost calculator or the pricing
            shown during PC creation for the most accurate final price.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-black dark:text-white">
                Filter by Location
              </p>
              <p className="mt-1 text-sm text-[#454545] dark:text-[#B9C2D5]">
                Narrow the table to a specific location.
              </p>
            </div>

            <div className="w-full sm:w-[320px]">
              <label htmlFor="region-filter" className="sr-only">
                Filter Sense PC configurations by region and location
              </label>
              <select
                id="region-filter"
                className="w-full rounded-2xl border border-[#2530F022] dark:border-white/10 bg-white dark:bg-white/[0.03] px-4 py-3 text-sm text-black dark:text-white outline-none transition-colors focus:border-[#2530F0] dark:focus:border-[#13E1EA]"
                name="regionFilter"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                {regionFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-[#2530F022] dark:border-white/10 touch-pan-x [-webkit-overflow-scrolling:touch]">
            <div className="w-max min-w-full">
              <table className="w-max min-w-[1600px] text-left">
              <thead className="bg-[#2530F00D] dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white bg-[#eef1ff] dark:bg-[#111827] min-w-[140px] md:sticky md:left-0 md:z-30">
                    OS
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white bg-[#eef1ff] dark:bg-[#111827] min-w-[140px] md:sticky md:left-[140px] md:z-30">
                    Location
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white bg-[#eef1ff] dark:bg-[#111827] min-w-[320px] border-r border-[#2530F022] dark:border-white/10 md:sticky md:left-[280px] md:z-30">
                    PC Type
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                    CPU
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                    RAM
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                    GPU
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                    GPU Memory
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                    Network
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                    Hourly
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                    Daily
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                    Monthly
                  </th>
                </tr>
              </thead>
                <tbody>
                  {filteredPcConfigurationRows.map((config) => (
                    <tr
                      key={`${config.os}-${config.pcType}-${config.region}`}
                      data-region-row
                      data-region={config.region}
                      className={`border-t border-[#2530F018] dark:border-white/10 ${
                        config.pcType.includes("Pro11")
                          ? "bg-[#2530F014] dark:bg-white/[0.04]"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-sm md:text-base text-black dark:text-white font-medium whitespace-nowrap bg-white dark:bg-[#0b1220] min-w-[140px] md:sticky md:left-0 md:z-20">
                        {config.os}
                      </td>

                      <td className="px-4 py-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5] whitespace-nowrap bg-white dark:bg-[#0b1220] min-w-[140px] md:sticky md:left-[140px] md:z-20">
                        {config.region === "us-east-1"
                          ? "New York"
                          : config.region === "us-west-2"
                            ? "California"
                            : config.region}
                      </td>

                      <td className="px-4 py-3 text-sm md:text-base text-black dark:text-white font-medium whitespace-nowrap bg-white dark:bg-[#0b1220] min-w-[320px] border-r border-[#2530F022] dark:border-white/10 md:sticky md:left-[280px] md:z-20">
                        {config.pcType}
                      </td>

                      <td className="px-4 py-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5] whitespace-nowrap">
                        {config.cpu}
                      </td>
                      <td className="px-4 py-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5] whitespace-nowrap">
                        {config.ram}
                      </td>
                      <td className="px-4 py-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5] whitespace-nowrap">
                        {config.gpu}
                      </td>
                      <td className="px-4 py-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5] whitespace-nowrap">
                        {config.gpuMemory}
                      </td>
                      <td className="px-4 py-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5] whitespace-nowrap">
                        {config.network}
                      </td>
                      <td className="px-4 py-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5] whitespace-nowrap">
                        {config.hourly}
                      </td>
                      <td className="px-4 py-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5] whitespace-nowrap">
                        {config.daily}
                      </td>
                      <td className="px-4 py-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5] whitespace-nowrap">
                        {config.monthly}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-8">
            <div className="overflow-x-auto rounded-2xl border border-[#2530F022] dark:border-white/10">
              <table className="min-w-[900px] w-full text-left">
                <thead className="bg-[#2530F00D] dark:bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                      SSD Size
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                      IOPS
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                      Throughput
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                      Hourly
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                      Daily
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                      Monthly
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ssdPricingRows.map((row) => (
                    <tr
                      key={row.capacity}
                      className="border-t border-[#2530F018] dark:border-white/10"
                    >
                      <td className="px-4 py-3 text-sm md:text-base text-black dark:text-white font-medium whitespace-nowrap">
                        {row.capacity}
                      </td>
                      <td className="px-4 py-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5] whitespace-nowrap">
                        {row.iops}
                      </td>
                      <td className="px-4 py-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5] whitespace-nowrap">
                        {row.throughput}
                      </td>
                      <td className="px-4 py-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5] whitespace-nowrap">
                        {row.hourly}
                      </td>
                      <td className="px-4 py-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5] whitespace-nowrap">
                        {row.daily}
                      </td>
                      <td className="px-4 py-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5] whitespace-nowrap">
                        {row.monthly}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-5">
            <Button
              asChild
              className="rounded-full px-6 py-3 font-semibold
            text-white
            bg-gradient-to-r from-[#A801BA] to-[#2530F0]
            hover:from-[#8A01A0] hover:to-[#1E26C9]
            shadow-lg shadow-[#2530F040]
            dark:shadow-[#2530F080]
            transition-all duration-300"
            >
              <Link href="/#sensepc-cost-calculator">
                Check Sense PC Price in real time
              </Link>
            </Button>
          </div>
        </section>

        <section
          id="sense-cloud-pricing"
          className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0 px-6 md:px-12 py-8"
          aria-label="Sense Cloud billing model"
        >
          <h2 className="text-black dark:text-white text-2xl md:text-3xl font-bold font-['Space_Grotesk'] leading-8 tracking-tight">
            Sense Cloud billing in 3 steps
          </h2>

          <p className="mt-3 text-[#454545] dark:text-[#B9C2D5]">
            Sense Cloud storage pricing depends on the highest storage tier
            reached during your billing cycle. For real-time storage pricing
            based on your desired storage usage, please use the live cost
            calculator.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {cloudBillingSteps.map((step) => (
              <article
                key={step.title}
                className="rounded-2xl border border-[#2530F022] dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-5"
              >
                <h3 className="text-black dark:text-white text-lg font-semibold font-['Space_Grotesk']">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5] leading-relaxed">
                  {step.detail}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-5">
            <Button
              asChild
              className="rounded-full px-6 py-3 font-semibold
            text-white
            bg-gradient-to-r from-[#A801BA] to-[#2530F0]
            hover:from-[#8A01A0] hover:to-[#1E26C9]
            shadow-lg shadow-[#2530F040]
            dark:shadow-[#2530F080]
            transition-all duration-300"
            >
              <Link href="/#sensepc-cost-calculator">
                Check Sense Cloud Price in real time
              </Link>
            </Button>
          </div>
        </section>

        <section
          id="billing-notes"
          className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0 px-6 md:px-12 py-8"
        >
          <h2 className="text-black dark:text-white text-2xl md:text-3xl font-bold font-['Space_Grotesk'] leading-8 tracking-tight">
            Billing notes
          </h2>
          <ul className="mt-5 list-disc pl-6 space-y-2 text-[#454545] dark:text-[#B9C2D5]">
            <li>Sense PC uses Hourly, Daily, and Monthly billing plans.</li>
            <li>
              Sense Cloud tier is auto-calculated from highest monthly storage
              usage.
            </li>
            <li>Compute and storage are tracked as separate billing items.</li>
            <li>
              Your billing dashboard shows the latest effective charge and usage
              history.
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/terms#subscription-terms">Review Billing Terms</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/contact">Contact Billing Team</Link>
            </Button>
          </div>
        </section>

          <FAQ
            items={pricingFaqItems}
            subtitle="Everything you need to know about pricing and billing"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default MainPage;
