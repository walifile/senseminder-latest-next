export function shortEmail(email?: string): string {
  if (!email) return "—";
  return email.split("@")[0];
}

export function getFriendlyOSName(raw?: string | null): string {
  const s = (raw ?? "").trim().toLowerCase();
  if (!s) return "Unknown OS";

  // --- Windows Server first (more specific) ---
  if (s.includes("server")) {
    if (s.includes("2022") || s.includes("win2022"))
      return "Windows Server 2022";
    if (s.includes("2019") || s.includes("win2019"))
      return "Windows Server 2019";
    return "Windows Server";
  }

  // --- Windows desktop (handles: win11, windows_11, windows 11, etc.) ---
  if (
    s.includes("win11") ||
    s.includes("windows 11") ||
    s.includes("windows_11")
  )
    return "Windows 11";
  if (
    s.includes("win10") ||
    s.includes("windows 10") ||
    s.includes("windows_10")
  )
    return "Windows 10";

  // --- Ubuntu versions: Ubuntu_22.04 / Ubuntu-24_10 / ubuntu22.07 / ubuntu 24.04 ---
  const ubuntuMatch = s.match(/ubuntu[\s_-]*?(\d{2})[.\-_](\d{2})/);
  if (ubuntuMatch) {
    const [, major, minor] = ubuntuMatch;
    return `Ubuntu ${major}.${minor}`;
  }
  if (s.includes("ubuntu")) return "Ubuntu";

  // --- Other common distros ---
  if (
    s.includes("amazonlinux") ||
    s.includes("amazon linux") ||
    s.includes("amzn")
  )
    return "Amazon Linux";
  if (s.includes("centos")) return "CentOS";
  if (s.includes("debian")) return "Debian";
  if (s.includes("rocky")) return "Rocky Linux";
  if (s.includes("almalinux") || s.includes("alma")) return "AlmaLinux";
  if (s.includes("rhel") || s.includes("red hat"))
    return "Red Hat Enterprise Linux";
  if (s.includes("macos") || s.includes("mac os")) return "macOS";

  return raw ?? "";
}
