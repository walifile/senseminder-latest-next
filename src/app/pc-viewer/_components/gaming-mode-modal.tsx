"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Apple,
  Server,
  Laptop,
  Monitor,
  Download,
  MonitorPlay,
  ChevronRight,
} from "lucide-react";

import {
  viewerGlassInnerClass,
  viewerGlassSurfaceClass,
  viewerGlassSurfaceStyle,
} from "./viewer-surface";

interface GamingModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownloadFallback: () => void;
}

type DownloadOptionItem = {
  label: string;
  meta: string;
  url: string;
};

type DownloadGroupItem = {
  title: string;
  icon: React.ReactNode;
  options: DownloadOptionItem[];
};

const DCV_LATEST = {
  windowsInstaller:
    "https://d1uj6qtbmh3dt5.cloudfront.net/nice-dcv-client-Release.msi",
  windowsPortable:
    "https://d1uj6qtbmh3dt5.cloudfront.net/nice-dcv-client-Release-portable.zip",

  macIntel:
    "https://d1uj6qtbmh3dt5.cloudfront.net/nice-dcv-viewer.x86_64.dmg",
  macAppleSilicon:
    "https://d1uj6qtbmh3dt5.cloudfront.net/nice-dcv-viewer.arm64.dmg",

  ubuntu2204Amd64:
    "https://d1uj6qtbmh3dt5.cloudfront.net/nice-dcv-viewer_amd64.ubuntu2204.deb",
  ubuntu2404Amd64:
    "https://d1uj6qtbmh3dt5.cloudfront.net/nice-dcv-viewer_amd64.ubuntu2404.deb",
  ubuntu2204Arm64:
    "https://d1uj6qtbmh3dt5.cloudfront.net/nice-dcv-viewer_arm64.ubuntu2204.deb",
  ubuntu2404Arm64:
    "https://d1uj6qtbmh3dt5.cloudfront.net/nice-dcv-viewer_arm64.ubuntu2404.deb",

  rhel8Rocky8X64:
    "https://d1uj6qtbmh3dt5.cloudfront.net/nice-dcv-viewer-el8.x86_64.rpm",
  rhel9Rocky9X64:
    "https://d1uj6qtbmh3dt5.cloudfront.net/nice-dcv-viewer-el9.x86_64.rpm",
  sles15X64:
    "https://d1uj6qtbmh3dt5.cloudfront.net/nice-dcv-viewer-sles15.x86_64.rpm",

  latestReleasePage: "https://www.amazondcv.com/latest.html",
} as const;

const DOWNLOAD_GROUPS: DownloadGroupItem[] = [
  {
    title: "Windows",
    icon: <Monitor className="h-4 w-4" />,
    options: [
      {
        label: "Windows Installer",
        meta: "x86_64 • MSI",
        url: DCV_LATEST.windowsInstaller,
      },
      {
        label: "Windows Portable",
        meta: "x86_64 • ZIP",
        url: DCV_LATEST.windowsPortable,
      },
    ],
  },
  {
    title: "macOS",
    icon: <Apple className="h-4 w-4" />,
    options: [
      {
        label: "Apple Silicon Mac",
        meta: "arm64 • DMG",
        url: DCV_LATEST.macAppleSilicon,
      },
      {
        label: "Intel Mac",
        meta: "x86_64 • DMG",
        url: DCV_LATEST.macIntel,
      },
    ],
  },
  {
    title: "Ubuntu",
    icon: <Laptop className="h-4 w-4" />,
    options: [
      {
        label: "Ubuntu 24.04",
        meta: "x86_64 • DEB",
        url: DCV_LATEST.ubuntu2404Amd64,
      },
      {
        label: "Ubuntu 24.04",
        meta: "arm64 • DEB",
        url: DCV_LATEST.ubuntu2404Arm64,
      },
      {
        label: "Ubuntu 22.04",
        meta: "x86_64 • DEB",
        url: DCV_LATEST.ubuntu2204Amd64,
      },
      {
        label: "Ubuntu 22.04",
        meta: "arm64 • DEB",
        url: DCV_LATEST.ubuntu2204Arm64,
      },
    ],
  },
  {
    title: "RHEL / Rocky / SUSE",
    icon: <Server className="h-4 w-4" />,
    options: [
      {
        label: "RHEL / Rocky 9",
        meta: "x86_64 • RPM",
        url: DCV_LATEST.rhel9Rocky9X64,
      },
      {
        label: "RHEL / Rocky 8",
        meta: "x86_64 • RPM",
        url: DCV_LATEST.rhel8Rocky8X64,
      },
      {
        label: "SUSE Linux Enterprise 15",
        meta: "x86_64 • RPM",
        url: DCV_LATEST.sles15X64,
      },
    ],
  },
];

function triggerDirectDownload(url: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.rel = "noopener noreferrer";
  anchor.target = "_self";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function DownloadOptionCard({ label, meta, url }: DownloadOptionItem) {
  return (
    <button
      type="button"
      onClick={() => triggerDirectDownload(url)}
      className="
        group relative w-full overflow-hidden rounded-xl border border-zinc-300/60
        bg-white/70 px-3 py-2.5 text-left text-zinc-900
        cursor-pointer transition-all duration-200 ease-out
        hover:-translate-y-[1px] hover:border-transparent
        hover:bg-[linear-gradient(90deg,#4F46E5_0%,#7C3AED_50%,#C026D3_100%)]
        hover:text-white hover:shadow-[0_10px_30px_-12px_rgba(124,58,237,0.55)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
        focus-visible:ring-offset-2 focus-visible:ring-offset-white
        active:scale-[0.99]
        dark:border-zinc-700/60 dark:bg-zinc-900/60 dark:text-zinc-100
        dark:focus-visible:ring-offset-zinc-950
      "
      aria-label={`${label} - ${meta}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 shrink-0 opacity-80 transition-opacity group-hover:opacity-100" />
            <span className="block text-sm font-medium">{label}</span>
          </div>

          <p className="mt-1 pl-6 text-[11px] text-zinc-600 transition-colors group-hover:text-white/85 dark:text-zinc-300">
            {meta}
          </p>
        </div>

        <ChevronRight className="h-4 w-4 shrink-0 opacity-60 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
    </button>
  );
}

function DownloadGroup({ title, icon, options }: DownloadGroupItem) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
        {icon}
        <span>{title}</span>
      </div>

      <div className="space-y-2">
        {options.map((option) => (
          <DownloadOptionCard key={`${option.label}-${option.meta}`} {...option} />
        ))}
      </div>
    </section>
  );
}

export function GamingModeModal({
  open,
  onOpenChange,
  onDownloadFallback,
}: GamingModeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`
          w-[min(92vw,56rem)]
          max-w-2xl
          max-h-[calc(100vh-2.5rem)]
          gap-0
          overflow-hidden
          rounded-2xl
          p-0
          ${viewerGlassSurfaceClass}
        `}
        style={viewerGlassSurfaceStyle}
      >
        <div className="flex max-h-[calc(100vh-2.5rem)] flex-col overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-zinc-300/50 px-5 pb-4 pt-5 dark:border-zinc-700/50">
            <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <MonitorPlay className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Launching Native Client
            </DialogTitle>

            <DialogDescription className="mt-2 text-zinc-700 dark:text-zinc-200">
              Your browser will request permission to open the NICE DCV app. If nothing happens, the
              native client may not be installed on your system. Choose your operating system and
              architecture below to download the correct client directly.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 overflow-y-auto p-5">
            <div className="space-y-4">
              <div className={`${viewerGlassInnerClass} space-y-4 p-4`}>
                <div>
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Download NICE DCV Client
                  </h4>
                  <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-200">
                    Select the package that matches your computer. Linux users should choose the distro
                    and architecture that exactly matches their system.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {DOWNLOAD_GROUPS.map((group) => (
                    <DownloadGroup
                      key={group.title}
                      title={group.title}
                      icon={group.icon}
                      options={group.options}
                    />
                  ))}
                </div>

                <p className="text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
                  NICE DCV Client is a third-party application provided by Amazon Web Services. SensePC is not
                  responsible for its software maintenance, updates, patches, availability, or security management.
                  Please evaluate and use it in accordance with your internal IT and security requirements.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  className="h-9 w-full cursor-pointer border-zinc-300/60 bg-white/70 text-xs text-zinc-900 transition-all hover:bg-zinc-100 dark:border-zinc-700/60 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  onClick={() =>
                    window.open(DCV_LATEST.latestReleasePage, "_blank", "noopener,noreferrer")
                  }
                >
                  View all latest DCV downloads
                </Button>
              </div>

              <div className="shrink-0 pt-1">
                <p className="mb-2 text-center text-xs text-zinc-700 dark:text-zinc-200">
                  Installed but it didn&apos;t open?
                </p>

                <Button
                  type="button"
                  variant="outline"
                  className="h-8 w-full cursor-pointer border-zinc-300/60 bg-white/70 text-xs text-zinc-900 transition-all hover:bg-zinc-100 dark:border-zinc-700/60 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  onClick={onDownloadFallback}
                >
                  Download Connection File (.dcv)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}