import type { Category } from "../types";

export const CATEGORIES: Category[] = [
  {
    title: "What is SensePC?",
    items: [
      {
        q: "What is a SensePC?",
        a: (
          <>
            SensePC is your personal computer in the cloud—high‑performance
            virtual desktops that live in secure data centers and stream to your
            devices. Create, start, stop, or resize in minutes and work from
            anywhere.
          </>
        ),
      },
      {
        q: "How is SensePC different from other cloud computing services?",
        a: (
          <>
            SensePC focuses on responsiveness, security, and simplicity. We
            combine GPU‑ready streaming, adaptive bitrate, and enterprise‑grade
            controls so it feels like a local PC—without the hardware hassle.
          </>
        ),
      },
      {
        q: "Who is SensePC for?",
        a: (
          <>
            Creators, developers, students, gamers (via native app), small
            teams, and enterprises who need secure, high‑performance desktops
            accessible from anywhere.
          </>
        ),
      },
    ],
  },
  {
    title: "Getting Started",
    items: [
      {
        q: "How do I sign up?",
        a: (
          <>
            Create an account (no plan required), verify your email, and launch
            your first SensePC from the dashboard. You can pick or upgrade a
            plan later. First‑time guides walk you through each step.
          </>
        ),
      },
      {
        q: "How fast can I be up and running?",
        a: (
          <>
            Typically within minutes. Provisioning, OS setup, and secure access
            are automated.
          </>
        ),
      },
      {
        q: "Do I need special hardware?",
        a: (
          <>
            No. Any modern device with a browser works. For gaming/low‑latency
            use, install our native app.
          </>
        ),
      },
      {
        q: "How do I verify my email and secure my account?",
        a: (
          <>
            During sign‑up we send a one‑time passcode (OTP) to your email.
            Enter that OTP to verify your account (you can request a resend if
            needed). After your first login, enable MFA (Authenticator or Email)
            in <em>Settings → Security</em>.
          </>
        ),
      },
    ],
  },
  {
    title: "Performance & Internet",
    items: [
      {
        q: "What internet speed do I need?",
        a: (
          <>
            We recommend <strong>15 Mbps down / 5 Mbps up</strong>. Adaptive
            streaming helps on slower links; lower latency improves
            responsiveness.
          </>
        ),
      },
      {
        q: "Can I use SensePC on Wi‑Fi?",
        a: (
          <>Yes. For the best experience, use 5 GHz Wi‑Fi or wired Ethernet.</>
        ),
      },
      {
        q: "Does SensePC support gaming?",
        a: (
          <>
            Yes—via the native app for the best frame rates and latency. The web
            client is great for productivity apps.
          </>
        ),
      },
    ],
  },
  {
    title: "Apps, Licenses & Data",
    items: [
      {
        q: "Can I install my own software?",
        a: (
          <>
            Yes. Treat it like a regular PC. Install IDEs, creative tools,
            enterprise apps—whatever your workflow needs.
          </>
        ),
      },
      {
        q: "Can I bring my own OS licenses?",
        a: (
          <>
            Yes. BYOL is supported for Windows and Linux. Ensure your license
            terms permit cloud use.
          </>
        ),
      },
      {
        q: "Where do files live?",
        a: (
          <>
            Your data lives on encrypted SSD system/storage (EBS) volumes
            attached to your SensePC and in <strong>SenseStorage</strong>, our
            cloud drive (similar to iCloud). SenseStorage is built on Amazon S3
            with server‑side encryption for data at rest.
          </>
        ),
      },
      {
        q: "Can I map cloud drives like Google Drive/Dropbox etc.?",
        a: (
          <>
            No. It’s in our future development roadmap. You can still access
            Google Drive, Dropbox, and similar services the same way you do on a
            normal computer—via their web apps in the browser or by installing
            their official desktop clients inside your SensePC (where
            supported).
          </>
        ),
      },
    ],
  },
  {
    title: "Connecting & Viewer",
    items: [
      {
        q: "What’s the best way to connect?",
        a: (
          <>
            For productivity, the web client in a modern browser works great.
            For gaming or graphics‑intensive work, install the native SensePC
            app for optimal latency and input.
          </>
        ),
      },
      {
        q: "Do I need to open firewall ports?",
        a: <>Typically no, for outbound client connections.</>,
      },
      {
        q: "Can multiple monitors and USB devices pass through?",
        a: (
          <>
            Multi‑monitor and basic USB peripherals are supported; advanced
            passthrough varies by client platform.
          </>
        ),
      },
      {
        q: "Can I estimate costs before creating a PC?",
        a: (
          <>
            Yes. Use the <strong>SensePC Calculator</strong> on the landing
            page—no sign‑up required.
          </>
        ),
      },
      {
        q: "Can I open multiple viewer sessions?",
        a: (
          <>
            Yes. SensePC supports multiple simultaneous viewer sessions in the
            browser viewer page (e.g., separate windows/tabs), subject to your
            account’s policy limits.
          </>
        ),
      },
      {
        q: "Do you support full‑screen mode?",
        a: (
          <>
            Yes. Use the <strong>Full Screen</strong> toggle in the viewer.
            Full‑screen is supported in both the web client and the native app.
          </>
        ),
      },
    ],
  },
  {
    title: "Creating & Managing PCs",
    items: [
      {
        q: "How do I create my first SensePC?",
        a: (
          <>
            Click <strong>Build PC</strong>, choose a configuration (OS,
            CPU/GPU/RAM and storage), pick a region, name it, and launch. It
            appears in your dashboard with status and actions.
          </>
        ),
      },
      {
        q: "What OS options are available?",
        a: (
          <>
            Windows and Linux today, with SenseOS options planned. You can
            install additional tooling as needed.
          </>
        ),
      },
      {
        q: "Can I resize my SensePC later?",
        a: (
          <>
            Only the <strong>Hourly</strong> plan supports PC resize.
            Daily/Monthly plans do not support resize; wait until the cycle ends
            and the PC falls back to Hourly.
          </>
        ),
      },
      {
        q: "Do I need the PC running or stopped for changes?",
        a: (
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Resize compute configuration:</strong> PC must be{" "}
              <em>Stopped</em>.
            </li>
            <li>
              <strong>Increase storage volume (SSD):</strong> PC must be{" "}
              <em>Running</em>. You can increase capacity; decreasing is not
              supported.
            </li>
            <li>
              <strong>Assign/deassign a PC to a user:</strong> PC must be{" "}
              <em>Stopped</em>.
            </li>
          </ul>
        ),
      },
      {
        q: "Can I add storage on Daily/Monthly?",
        a: (
          <>
            No. Adding storage is supported only on <strong>Hourly</strong>. For
            Daily/Monthly, wait for the plan to end, revert to Hourly, then add.
          </>
        ),
      },
      {
        q: "Can I schedule my PC?",
        a: (
          <>
            Yes. Set <strong>auto start/stop schedules</strong> and configure{" "}
            <strong>idle auto‑stop</strong> to save cost when inactive.
          </>
        ),
      },
    ],
  },
  {
    title: "SenseStorage (Billing & Behavior)",
    items: [
      {
        q: "How is SenseStorage billed?",
        a: (
          <>
            Intelligent tier‑based billing: you’re charged on the maximum usage
            observed in the month. No fixed plans to select.
          </>
        ),
      },
      {
        q: "Can I use SenseStorage without adding a card?",
        a: (
          <>
            New users can leverage promotional balance (when available) to
            create a PC and store files without adding a card. Once promo funds
            are used, you’ll need to recharge your Wallet to continue.
          </>
        ),
      },
      {
        q: "What affects upload/download speeds?",
        a: (
          <>
            Throughput depends primarily on latency between you and the data
            center and your local network. For consistency, use wired or 5 GHz
            Wi‑Fi and pick the nearest region.
          </>
        ),
      },
      {
        q: "Can I preview media?",
        a: (
          <>
            Yes. SenseStorage supports in‑browser previews for images, music,
            and music videos where supported by your browser.
          </>
        ),
      },
    ],
  },
  {
    title: "Plans & Billing (Wallet, Hourly/Daily/Monthly)",
    items: [
      {
        q: "Do I need to pick a plan to sign up?",
        a: (
          <>
            No. Sign up first. SensePC offers <strong>Hourly (default)</strong>,{" "}
            <strong>Daily</strong>, and <strong>Monthly</strong> plans you can
            choose or upgrade to later.
          </>
        ),
      },
      {
        q: "How do the plans differ?",
        a: (
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Hourly (default):</strong> Billed in 60‑minute units while
              running (compute + SSD). When <em>stopped</em>, only provisioned
              storage is billed in hourly cadence; CPU/RAM are not billed.
            </li>
            <li>
              <strong>Daily:</strong> Prepaid once per day for compute + SSD
              regardless of state.
            </li>
            <li>
              <strong>Monthly:</strong> Prepaid every 30 days for compute + SSD
              regardless of state. If you terminate mid‑month, the plan
              continues for the purchased period.
            </li>
          </ul>
        ),
      },
      {
        q: "Can I upgrade/downgrade plans?",
        a: (
          <>
            You can upgrade Hourly → Daily/Monthly or Daily → Monthly. You
            cannot move Monthly → Daily. Plan changes take effect after the
            current billing cycle completes. If a Daily/Monthly plan is not set
            to renew, it automatically falls back to Hourly when the cycle ends.
          </>
        ),
      },
      {
        q: "Can a PC have no plan attached?",
        a: (
          <>
            No. Every PC must have a plan attached. <strong>Hourly</strong> is
            the enforced default if no other or recurring plan is selected.
          </>
        ),
      },
      {
        q: "What happens if I delete a PC mid‑cycle?",
        a: (
          <>
            Daily/Monthly charges already collected are non‑refundable. Deleting
            the PC ends further usage, but the current cycle’s prepaid fees
            remain.
          </>
        ),
      },
      {
        q: "How are charges collected?",
        a: (
          <>
            Charges deduct upfront in this order:{" "}
            <strong>Promo balance → Cashback balance → Main Wallet</strong>. If
            the combined balances are insufficient, your PC stops until you
            recharge. Promo and Cashback have no cash value, are not refundable,
            and are usable only for Sense PC and Sense Cloud charges.
          </>
        ),
      },
      {
        q: "How do I recharge my Wallet?",
        a: (
          <>
            Add a credit/debit card and top up. You can add or delete cards at
            any time from <em>Billing → Payment Methods</em>. You can also
            enable <strong>Auto‑recharge</strong> by ticking the checkbox on the
            Billing page or during the recharge flow. We do not store card
            details—payments are processed securely by Stripe.
          </>
        ),
      },
      {
        q: "Can I set auto‑renew?",
        a: (
          <>
            Yes. Toggle <strong>Auto‑renew</strong> for Daily/Monthly. If you
            untick it, your plan runs to the end of the cycle and then reverts
            to <strong>Hourly</strong>.
          </>
        ),
      },
      {
        q: "Where can I see invoices and recharge history?",
        a: (
          <>
            In <em>Billing → History</em>, view historic usage, recharges, and
            download invoices/CSVs/PDFs.
          </>
        ),
      },
    ],
  },
  {
    title: "Regions, Networking & Enterprise Integrations",
    items: [
      {
        q: "Which regions can I choose?",
        a: (
          <>
            Select regions closest to your users for the best latency. Region
            availability may vary by configuration.{" "}
            <strong>
              Currently we only support North Virginia (USA) region.
            </strong>
          </>
        ),
      },
      { q: "Do you support private connectivity?", a: <>No.</> },
      {
        q: "Will my public IP be exposed?",
        a: (
          <>
            By default, you connect securely without exposing your PC’s private
            IP.
          </>
        ),
      },
    ],
  },
  {
    title: "Security, Compliance & Audit",
    items: [
      {
        q: "How are sessions secured?",
        a: (
          <>
            Short‑lived session tokens, TLS encryption, and per‑user auth guard
            every connection. No static passwords required for access tokens.
          </>
        ),
      },
      {
        q: "What about compliance?",
        a: (
          <>
            We align with industry standards and can support SOC
            2/GDPR/HIPAA‑oriented controls. Request our security overview for
            details.
          </>
        ),
      },
      {
        q: "Do you provide audit logs?",
        a: (
          <>
            Admin plans include immutable audit logs for key actions
            (create/stop/resize, billing events, policy changes).
          </>
        ),
      },
    ],
  },
  {
    title: "Admin & Team Controls",
    items: [
      {
        q: "What roles are available and what can they do?",
        a: (
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Owner:</strong> Full access; can invite/remove Admins &
              Members; can remove Admins or members; manage billing and
              policies.
            </li>
            <li>
              <strong>Admin:</strong> Full account access (except removing
              Owner); can invite/remove Admins & Members.
            </li>
            <li>
              <strong>Member:</strong> Access only to PCs assigned to them;
              cannot create or delete PCs; cannot invite/remove users. Members
              are able to use SenseStorage.
            </li>
          </ul>
        ),
      },
      {
        q: "Who can invite or remove users?",
        a: <>Owner and Admins can invite/remove users. Members cannot.</>,
      },
      {
        q: "Who can assign PCs to Members?",
        a: (
          <>
            Owner/Admin can assign or deassign PCs to Members. PC must be
            Stopped to change assignment.
          </>
        ),
      },
    ],
  },
  {
    title: "Troubleshooting",
    items: [
      {
        q: "My stream feels laggy—what can I try?",
        a: (
          <>
            Switch to the native app, close bandwidth‑heavy tabs, use wired
            Ethernet or 5 GHz Wi‑Fi, pick a nearer region, or lower
            resolution/bitrate in client settings.
          </>
        ),
      },
      {
        q: "I can’t connect—what now?",
        a: (
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Check internet reachability</strong> (try loading a few
              sites, run a quick speed test).
            </li>
            <li>
              <strong>
                Confirm your instance is <em>Running</em>
              </strong>{" "}
              in the dashboard.
            </li>
            <li>
              <strong>Allow pop‑ups</strong> for the SensePC site in your
              browser (the viewer may open in a new tab/window).
            </li>
            <li>
              <strong>Verify you’re using the latest client</strong> (web or
              native app) and that extensions/firewalls aren’t blocking it.
            </li>
            <li>If issues persist, try a different browser/network.</li>
          </ul>
        ),
      },
      {
        q: "A game/app won’t start.",
        a: (
          <>
            Ensure GPU drivers are current, install dependencies, and run via
            the native app. Some anti‑cheat systems may not be supported in
            virtualized environments.
          </>
        ),
      },
      {
        q: "I don’t see CPU/Memory usage.",
        a: (
          <>
            Open the <strong>Computer Metrics</strong> panel in the dashboard
            for live CPU and memory metrics. If it’s empty, refresh or ensure
            the instance is running.
          </>
        ),
      },
    ],
  },
  {
    title: "Data Management & Privacy",
    items: [
      {
        q: "How do I export my data?",
        a: <>Download from your PC to local or upload to SenseStorage.</>,
      },
      {
        q: "Can I request data deletion?",
        a: (
          <>
            Yes. Terminate instances and request account erasure from{" "}
            <em>Privacy → Data Requests</em>. We’ll guide you through the
            process.
          </>
        ),
      },
    ],
  },
  {
    title: "Hardware & Accessories",
    items: [
      {
        q: "Do you sell hardware?",
        a: (
          <>
            We’re developing <strong>SPC</strong>, an ultra‑light thin‑client
            optimized for SensePC streaming and storage access. In the meantime,
            any modern device works great.
          </>
        ),
      },
      {
        q: "Do you support gamepads, drawing tablets, or 3D mice?",
        a: (
          <>
            Many common peripherals work; advanced passthrough varies by
            OS/client.
          </>
        ),
      },
    ],
  },
  {
    title: "Policies & Legal",
    items: [
      {
        q: "Refunds and cancellations?",
        a: (
          <>
            Hourly usage is pay‑as‑you‑go. Daily/Monthly plans are prepaid for
            their term. See our Refund Policy for details.
          </>
        ),
      },
      {
        q: "Content & acceptable use?",
        a: (
          <>
            Illegal content or activity is prohibited. See our Acceptable Use
            Policy (AUP).
          </>
        ),
      },
      {
        q: "Software licensing responsibility?",
        a: (
          <>
            You must comply with your software vendor’s license terms when
            installing apps on SensePC.
          </>
        ),
      },
    ],
  },
  {
    title: "Roadmap Highlights",
    items: [
      {
        q: "What’s coming next?",
        a: (
          <>
            Team workspaces, deeper enterprise networking, AI‑assisted
            troubleshooting, an ultra‑light <strong>SPC</strong> thin‑client
            device, and <strong>SenseOS</strong> — a Linux‑based desktop OS with
            a new GUI, on‑device AI, and enhanced security.
          </>
        ),
      },
    ],
  },
];
