export type FaqAnswer =
  | string
  | {
      paragraphs?: string[];
      bullets?: string[];
      note?: string;
    };

export type FaqContentItem = {
  answer: FaqAnswer;
  category?: string;
  question: string;
};

export function faqAnswerToPlainText(answer: FaqAnswer): string {
  if (typeof answer === "string") return answer;

  return [
    ...(answer.paragraphs ?? []),
    ...(answer.bullets ?? []),
    answer.note ?? "",
  ]
    .join(" ")
    .trim();
}

export const faqItems: FaqContentItem[] = [
  {
    category: "SensePC Basics",
    question: "What is SensePC?",
    answer:
      "SensePC is a cloud desktop service that gives you a full computer experience over the internet. Instead of depending only on the hardware in front of you, your desktop runs in the cloud and can be accessed from supported devices with an internet connection.",
  },
  {
    category: "SensePC Basics",
    question: "How is SensePC different from a traditional local PC?",
    answer:
      "A traditional PC depends on the physical hardware you own and use locally. SensePC runs your desktop in managed cloud infrastructure, so you can access your environment from different devices without being tied to one specific machine.",
  },
  {
    category: "SensePC Basics",
    question: "Is SensePC a full desktop or just a remote app launcher?",
    answer:
      "SensePC provides a full cloud desktop experience, not just a single application window. You connect to a complete desktop environment that is configured for your selected setup.",
  },
  {
    category: "SensePC Basics",
    question: "Who is SensePC built for?",
    answer:
      "SensePC is built for individuals, remote professionals, developers, creators, gamers, small teams, and businesses that want flexible access to cloud desktops without relying on identical local hardware.",
  },
  {
    category: "SensePC Basics",
    question: "Can I use SensePC for both personal and business workflows?",
    answer:
      "Yes. SensePC is designed for both personal and business use cases. Individual users can build and use their own cloud PC, while teams and organizations can manage access, assignments, and shared workflows under the right setup.",
  },
  {
    category: "SensePC Basics",
    question: "What kinds of workloads is SensePC good for?",
    answer:
      "SensePC is suited for everyday computing, remote work, development, gaming, browser-based work, office tasks, and heavier workloads that benefit from stronger cloud resources. The best experience depends on choosing the right configuration for the job.",
  },
  {
    category: "SensePC Basics",
    question: "Can SensePC be used for performance-heavy work?",
    answer:
      "Yes. SensePC is designed to support users who need more compute power than their local device can easily provide. Heavier workloads should be matched with the right CPU, memory, storage, and other available configuration options.",
  },
  {
    category: "SensePC Basics",
    question: "Can I use SensePC for gaming?",
    answer:
      "SensePC is designed to support gamers and other performance-focused users. The experience depends on the configuration you choose, your connection quality, and the current client or access method available for your workflow.",
  },
  {
    category: "SensePC Basics",
    question: "Do I need to buy a powerful computer to use SensePC?",
    answer:
      "No. One of the main benefits of SensePC is that it reduces your dependence on buying and upgrading expensive local hardware. Your desktop resources run in the cloud, while your local device is mainly used to access them.",
  },
  {
    category: "SensePC Basics",
    question: "Does SensePC replace my local computer?",
    answer:
      "SensePC can reduce how much you depend on your local computer, but your local device is still used as the access point. The cloud desktop does the heavy lifting, while your device is used to connect and interact with it.",
  },
  {
    category: "SensePC Basics",
    question: "Do I need to leave my local device turned on for SensePC to keep existing?",
    answer:
      "No. Your SensePC runs in the cloud, so it is not dependent on your local laptop or desktop staying powered on in order to continue existing as a provisioned resource.",
  },
  {
    category: "SensePC Basics",
    question: "Can I access SensePC from different devices?",
    answer:
      "Yes. SensePC is designed so users can access their cloud desktop from supported devices instead of being locked to a single machine.",
  },
  {
    category: "SensePC Basics",
    question: "Can I use SensePC in a browser?",
    answer:
      "Yes. SensePC supports browser-based access, which allows users to connect to their cloud desktop without depending entirely on a heavy local setup.",
  },
  {
    category: "SensePC Basics",
    question: "Do I need to install software on my local device to use SensePC?",
    answer:
      "For standard browser-based workflows, no additional local software may be required beyond a supported browser and a stable internet connection. Some advanced or future client experiences may have their own access methods.",
  },
  {
    category: "SensePC Basics",
    question: "What kind of local device do I need to use SensePC?",
    answer:
      "You generally need a supported device, a modern browser or supported client path, and a stable internet connection. The local device does not need to provide all of the compute power that the cloud desktop itself is using.",
  },
  {
    category: "SensePC Basics",
    question: "Do I need internet access to use SensePC?",
    answer:
      "Yes. SensePC is a cloud desktop service, so an internet connection is required to access and interact with your desktop.",
  },
  {
    category: "SensePC Basics",
    question: "Can I use SensePC while traveling or away from my main computer?",
    answer:
      "Yes. SensePC is designed to make your desktop environment easier to access from different places, which is especially useful when traveling or switching between devices.",
  },
  {
    category: "SensePC Basics",
    question: "Is SensePC tied to one physical location?",
    answer:
      "No. SensePC is designed for remote access. Your cloud desktop is not tied to one physical local machine in the same way a traditional PC is.",
  },
  {
    category: "SensePC Basics",
    question: "What can I choose when setting up a SensePC?",
    answer:
      "Depending on the available product options, users can choose things like operating system, compute profile, storage, location, and billing plan when building a SensePC.",
  },
  {
    category: "SensePC Basics",
    question: "Can I choose Windows or Linux for my SensePC?",
    answer:
      "Yes. SensePC supports operating system choices based on the configurations currently available on the platform.",
  },
  {
    category: "SensePC Basics",
    question: "Can I choose a location for my SensePC?",
    answer:
      "Yes. SensePC setup can include location selection, which helps align the desktop with performance and deployment needs.",
  },
  {
    category: "SensePC Basics",
    question: "Why would I choose SensePC instead of buying a new computer?",
    answer:
      "SensePC can give you access to stronger desktop resources without requiring the same upfront commitment to physical hardware purchases, upgrades, repairs, or device-specific limitations.",
  },
  {
    category: "SensePC Basics",
    question: "Is SensePC the same as renting a raw virtual machine?",
    answer:
      "Not exactly. SensePC is intended to feel like a managed cloud desktop experience rather than a raw infrastructure service. It is built around user access, desktop usability, and workspace management.",
  },
  {
    category: "SensePC Basics",
    question: "Is SensePC only for companies and IT teams?",
    answer:
      "No. SensePC is designed for both individual users and organizations. A solo user can use it for personal or professional work, while businesses can use it for team-based desktop access and management.",
  },
  {
    category: "SensePC Basics",
    question: "Can businesses use SensePC for teams?",
    answer:
      "Yes. SensePC supports business and team-oriented workflows, including managed access and role-based usage depending on the workspace setup.",
  },
  {
    category: "SensePC Basics",
    question: "Can I start with one SensePC and scale later?",
    answer:
      "Yes. SensePC can support starting small and expanding later, which makes it useful for individual users, pilot rollouts, and growing teams.",
  },
  {
    category: "SensePC Basics",
    question: "Does SensePC store my desktop environment in the cloud?",
    answer:
      "Yes. SensePC is built so your desktop environment lives in cloud infrastructure rather than being limited to one local machine.",
  },
  {
    category: "SensePC Basics",
    question: "Are my files and desktop experience tied to the local device I use to connect?",
    answer:
      "No. Your SensePC environment is designed to be associated with the cloud desktop itself, not permanently tied to one local endpoint device.",
  },
  {
    category: "SensePC Basics",
    question: "What is Sense Cloud and how is it related to SensePC?",
    answer:
      "Sense Cloud is the storage side of the broader product experience, while SensePC is the cloud desktop side. They are related but not the same thing: SensePC focuses on desktop computing, and Sense Cloud focuses on cloud-based storage workflows.",
  },
  {
    category: "SensePC Basics",
    question: "Does SensePC include storage options?",
    answer:
      "Yes. Storage is part of the overall SensePC setup experience, and broader storage workflows may also involve Sense Cloud depending on how the account is used.",
  },
  {
    category: "SensePC Basics",
    question: "Do I need advanced technical knowledge to use SensePC?",
    answer:
      "No. SensePC is intended to be straightforward enough for normal users while still being flexible enough for more advanced workflows.",
  },
  {
    category: "SensePC Basics",
    question: "Can SensePC help if my current laptop is too slow or limited?",
    answer:
      "Yes. SensePC is specifically useful for users whose local device does not offer enough power, consistency, or flexibility for the work they need to do.",
  },
  {
    category: "SensePC Basics",
    question: "What is the main benefit of SensePC?",
    answer:
      "The main benefit is that it gives users access to cloud desktop resources without forcing them to depend entirely on the limitations of a single local computer.",
  },
  {
    category: "SensePC Basics",
    question: "Is SensePC meant to make desktop access more flexible?",
    answer:
      "Yes. A core goal of SensePC is to make powerful desktop access more flexible, more portable across devices, and less dependent on local hardware constraints.",
  },
  {
    category: "SensePC Basics",
    question: "Can I use the same SensePC account across multiple workflows?",
    answer:
      "Yes. Depending on your setup, SensePC can support different kinds of workflows under the same broader account experience, including desktop and storage-related usage.",
  },
  {
    category: "SensePC Basics",
    question: "Is SensePC a shared computer?",
    answer:
      "No. SensePC is not a shared computer. Every SensePC has its own dedicated resources and runs as an individual desktop environment.",
  },
  {
    category: "Sense Cloud",
    question: "What is Sense Cloud?",
    answer:
      "Sense Cloud is the storage service in the broader SensePC product experience. It is designed to help users store, organize, preview, and manage files in the cloud alongside their desktop workflows.",
  },
  {
    category: "Sense Cloud",
    question: "How is Sense Cloud different from SensePC?",
    answer:
      "SensePC is the cloud desktop service, while Sense Cloud is the cloud storage service. SensePC focuses on desktop computing, and Sense Cloud focuses on file storage, organization, sharing, and related storage workflows.",
  },
  {
    category: "Sense Cloud",
    question: "Is Sense Cloud included as part of the SensePC experience?",
    answer:
      "Yes. Sense Cloud is part of the broader SensePC experience and is designed to work alongside cloud desktop usage rather than as an unrelated product.",
  },
  {
    category: "Sense Cloud",
    question: "Is Sense Cloud just an attached drive for my SensePC?",
    answer:
      "No. Sense Cloud is positioned as an integrated cloud storage experience, not just a simple attached drive. It is intended to support file organization, management, and access across the account experience.",
  },
  {
    category: "Sense Cloud",
    question: "What can I do with Sense Cloud?",
    answer:
      "Sense Cloud is designed for storing files, organizing folders, previewing supported content, sharing files, and managing storage usage inside your account.",
  },
  {
    category: "Sense Cloud",
    question: "What types of files can I store in Sense Cloud?",
    answer:
      "Sense Cloud is intended to support common personal and work-related file storage needs, including documents, images, audio, video, and other standard file categories.",
  },
  {
    category: "Sense Cloud",
    question: "Does Sense Cloud organize files into categories?",
    answer:
      "Yes. Sense Cloud includes category-based organization such as Documents, Images, Audio, and Video to make file browsing easier.",
  },
  {
    category: "Sense Cloud",
    question: "Does Sense Cloud have Recent, Starred, and Shared views?",
    answer:
      "Yes. Sense Cloud is designed to support views such as Recent, Starred, and Shared so users can quickly find files based on activity and workflow.",
  },
  {
    category: "Sense Cloud",
    question: "Can I upload files and folders to Sense Cloud?",
    answer:
      "Sense Cloud is built to support common cloud storage workflows, including uploading and organizing files. Folder and file management are part of the intended storage experience.",
  },
  {
    category: "Sense Cloud",
    question: "Can I organize my files into folders?",
    answer:
      "Yes. Sense Cloud is intended to support structured file organization so users can manage content in a way that fits their workflow.",
  },
  {
    category: "Sense Cloud",
    question: "Can I preview files in Sense Cloud without downloading them?",
    answer:
      "Yes. Sense Cloud is designed to provide instant preview support for many common file types so users can review content without always downloading it first.",
  },
  {
    category: "Sense Cloud",
    question: "Can I share files from Sense Cloud?",
    answer:
      "Yes. Sense Cloud supports file and folder sharing workflows so users can make content available to others when needed.",
  },
  {
    category: "Sense Cloud",
    question: "Can I share folders as well as individual files?",
    answer:
      "Yes. Sense Cloud is intended to support both file sharing and folder sharing as part of normal collaboration workflows.",
  },
  {
    category: "Sense Cloud",
    question: "Can I star important files in Sense Cloud?",
    answer:
      "Yes. Sense Cloud includes a Starred view so important files can be marked and found more easily later.",
  },
  {
    category: "Sense Cloud",
    question: "Can I quickly find files I recently used?",
    answer:
      "Yes. Sense Cloud includes a Recent view to help users return to files they accessed or worked with recently.",
  },
  {
    category: "Sense Cloud",
    question: "Can multiple users in the same account use Sense Cloud?",
    answer:
      "Yes. In team or shared account environments, users under the same account can use the broader Sense Cloud storage experience based on the workspace setup.",
  },
  {
    category: "Sense Cloud",
    question: "Is Sense Cloud shared across users in the same account?",
    answer:
      "Yes. Users in the same account can share the same broader Sense Cloud storage environment depending on how the workspace is configured.",
  },
  {
    category: "Sense Cloud",
    question: "Can businesses use Sense Cloud for team collaboration?",
    answer:
      "Yes. Sense Cloud supports collaboration-oriented storage workflows that are useful for teams and business environments.",
  },
  {
    category: "Sense Cloud",
    question: "Does Sense Cloud support duplicate detection or cleanup?",
    answer:
      "Yes. Sense Cloud is designed to help users identify and clean up duplicate files so storage can be managed more efficiently.",
  },
  {
    category: "Sense Cloud",
    question: "How is Sense Cloud billed?",
    answer:
      "Sense Cloud storage billing is separate from SensePC compute billing. Storage charges are based on the Sense Cloud billing model rather than the desktop compute plan.",
  },
  {
    category: "Sense Cloud",
    question: "Is Sense Cloud billing separate from SensePC billing?",
    answer:
      "Yes. Sense Cloud storage billing is distinct from SensePC desktop compute billing, even though both services are part of the broader product experience.",
  },
  {
    category: "Sense Cloud",
    question: "How does monthly Sense Cloud storage billing work?",
    answer:
      "Sense Cloud storage billing is based on monthly usage rules. The final storage charge is tied to the highest usage tier reached during the billing period rather than only a single point-in-time snapshot.",
  },
  {
    category: "Sense Cloud",
    question: "Is Sense Cloud billed based on the highest storage usage during the month?",
    answer:
      "Yes. Sense Cloud follows a billing model where monthly charges are based on the highest storage tier reached during the month.",
  },
  {
    category: "Sense Cloud",
    question: "Can I manually choose a separate Sense Cloud billing plan?",
    answer:
      "Sense Cloud storage follows its own billing logic and is not positioned the same way as the Hourly, Daily, and Monthly desktop compute plans used for SensePC.",
  },
  {
    category: "Sense Cloud",
    question: "Does deleting files help reduce future Sense Cloud costs?",
    answer:
      "Managing and reducing stored content can help control future storage usage, but monthly billing is based on the highest usage tier reached during the billing cycle.",
  },
  {
    category: "Sense Cloud",
    question: "Can I use Sense Cloud without depending only on my local device storage?",
    answer:
      "Yes. Sense Cloud is specifically designed to reduce dependence on the storage available on a single local device by keeping files in the cloud.",
  },
  {
    category: "Sense Cloud",
    question: "Can I access my Sense Cloud files from different devices?",
    answer:
      "Yes. Sense Cloud is intended to make stored content easier to access across supported devices instead of tying your files to one local computer.",
  },
  {
    category: "Sense Cloud",
    question: "Is Sense Cloud useful if my laptop does not have much free space?",
    answer:
      "Yes. Sense Cloud can help users who need more flexible storage access without depending only on the available space on their local device.",
  },
  {
    category: "Sense Cloud",
    question: "Can Sense Cloud support both personal and business file storage workflows?",
    answer:
      "Yes. Sense Cloud is designed to be useful for both individual users and teams that need organized cloud storage and sharing workflows.",
  },
  {
    category: "Sense Cloud",
    question: "Does Sense Cloud work alongside my cloud desktop workflow?",
    answer:
      "Yes. Sense Cloud is intended to complement the SensePC desktop experience by giving users cloud-based storage alongside cloud-based computing.",
  },
  {
    category: "Sense Cloud",
    question: "What is the main benefit of Sense Cloud?",
    answer:
      "The main benefit of Sense Cloud is that it gives users a cloud-based storage experience that supports organization, access, previews, and sharing without relying only on one local device.",
  },
  {
    category: "Provisioning",
    question: "How long does SensePC provisioning usually take?",
    answer:
      "Provisioning time depends on factors such as account readiness, wallet or billing setup, selected configuration, location, and whether the request is for an individual user or a team rollout. Some setups are straightforward, while larger or more customized deployments may take longer.",
  },
  {
    category: "Provisioning",
    question: "What does the SensePC provisioning process usually include?",
    answer:
      "Provisioning usually includes account readiness, billing or wallet readiness, desktop configuration selection, location selection, operating system choice, storage selection, and preparation of the cloud desktop environment for the intended workload.",
  },
  {
    category: "Provisioning",
    question: "What do I need before I create a SensePC?",
    answer:
      "Before creating a SensePC, users should be ready with their preferred operating system, compute profile, storage size, location, and billing plan. Team environments should also decide user roles, ownership, and how desktops will be assigned.",
  },
  {
    category: "Provisioning",
    question: "Do I need technical experience to get started?",
    answer:
      "Not necessarily. Individual users can usually start through the standard signup and build flow. Team and business deployments may require more planning around billing, user access, desktop assignment, and rollout structure.",
  },
  {
    category: "Provisioning",
    question: "Can I start with one SensePC and add more later?",
    answer:
      "Yes. SensePC supports starting with a single cloud desktop and expanding later, which is useful for individual users, pilot programs, and growing teams.",
  },
  {
    category: "Provisioning",
    question: "Can teams start with a pilot before a larger rollout?",
    answer:
      "Yes. A pilot is often the best way to validate the selected configuration, user experience, access flow, and billing expectations before scaling to more users.",
  },
  {
    category: "Provisioning",
    question: "Can I choose my desktop configuration during provisioning?",
    answer:
      "Yes. Provisioning is tied to your selected setup, including operating system, compute profile, storage, location, and billing plan based on the options available on the platform.",
  },
  {
    category: "Provisioning",
    question: "Can I choose Windows or Linux while provisioning?",
    answer:
      "Yes. SensePC supports operating system selection during setup based on the configurations currently available on the platform.",
  },
  {
    category: "Provisioning",
    question: "Can I choose a location during provisioning?",
    answer:
      "Yes. Region selection is part of the provisioning flow and helps align the cloud desktop with performance, latency, and deployment preferences.",
  },
  {
    category: "Provisioning",
    question: "Does billing need to be ready before provisioning can complete?",
    answer:
      "Yes. Billing or wallet readiness is an important part of the provisioning flow. Depending on the account state and selected plan, provisioning may depend on funding readiness or a valid payment setup.",
  },
  {
    category: "Provisioning",
    question: "Why is my SensePC still showing as provisioning?",
    answer:
      "A SensePC may remain in provisioning while the system completes account checks, billing readiness, infrastructure preparation, selected configuration setup, or location-specific resource preparation.",
  },
  {
    category: "Provisioning",
    question: "When is provisioning considered complete?",
    answer:
      "Provisioning is considered complete when the cloud desktop has finished preparing and is available for normal account use under the selected setup.",
  },
  {
    category: "Provisioning",
    question: "Can I use my SensePC immediately after creating it?",
    answer:
      "You can use it once provisioning has completed and the desktop is in a ready state. Immediate access depends on the account state, selected setup, and successful completion of the provisioning process.",
  },
  {
    category: "Provisioning",
    question: "Does team provisioning require extra planning?",
    answer:
      "Yes. Team rollouts usually require additional planning for billing ownership, workspace setup, user roles, assignment flow, and the number of desktops needed.",
  },
  {
    category: "Provisioning",
    question: "Do I need to decide roles and access before onboarding a team?",
    answer:
      "Yes. Teams should decide who will be the owner, who will have admin access, and how desktops will be assigned before inviting users into the workspace.",
  },
  {
    category: "Provisioning",
    question: "Can business users set up billing before inviting team members?",
    answer:
      "Yes. For team environments, billing setup is best completed early so desktop provisioning, wallet usage, and future account activity stay centralized for the organization.",
  },
  {
    category: "Provisioning",
    question: "Does provisioning include storage setup too?",
    answer:
      "Yes. Storage selection is part of the broader setup experience, and users should choose the storage size that fits their intended workload and billing expectations.",
  },
  {
    category: "Provisioning",
    question: "Does provisioning differ for individuals and teams?",
    answer:
      "Yes. Individual provisioning is usually simpler, while team provisioning may involve extra decisions around billing, assignments, access control, and rollout planning.",
  },
  {
    category: "Provisioning",
    question: "What should I do if provisioning seems stuck for too long?",
    answer:
      "First review your billing or wallet readiness, selected configuration, and account status. If the desktop does not move to a ready state after a reasonable period, contact support with your account and desktop details.",
  },
  
  {
    category: "Devices",
    question: "What devices can I use to access SensePC?",
    answer:
      "SensePC is designed to be accessed from modern laptops, desktops, and similar devices with a supported browser or supported access method and a reliable internet connection.",
  },
  {
    category: "Devices",
    question: "Do I need a powerful laptop to use SensePC?",
    answer:
      "Usually no. Because the main desktop workload runs in the cloud, your local device typically does not need to provide the same level of compute power as the cloud desktop itself.",
  },
  {
    category: "Devices",
    question: "Can I use SensePC from a low-spec or older computer?",
    answer:
      "In many cases, yes. SensePC is useful for users whose local device is limited, as long as the device can handle the access method, display the session properly, and maintain a stable connection.",
  },
  {
    category: "Devices",
    question: "Can I use SensePC in a browser?",
    answer:
      "Yes. Browser-based access is part of the SensePC experience, which allows many users to connect without depending entirely on high-end local hardware.",
  },
  {
    category: "Devices",
    question: "Does SensePC require software installation on my local device?",
    answer:
      "For standard browser-based workflows, not necessarily. Many users can access SensePC through a modern browser, while some advanced workflows or future client experiences may use additional access methods.",
  },
  {
    category: "Devices",
    question: "Can I access SensePC from different devices?",
    answer:
      "Yes. SensePC is designed so users can access their cloud desktop from more than one supported device instead of being locked to a single local machine.",
  },
  {
    category: "Devices",
    question: "Can I switch between devices and still access the same SensePC?",
    answer:
      "Yes. Your SensePC environment is associated with the cloud desktop, not permanently tied to one physical local device.",
  },
  {
    category: "Devices",
    question: "Can I access SensePC from different locations?",
    answer:
      "Yes. SensePC is intended to support access from different locations as long as you have a supported device, internet connectivity, and the right account access.",
  },
  {
    category: "Devices",
    question: "Do I need to keep my local computer turned on for SensePC to keep existing?",
    answer:
      "No. Your SensePC runs in the cloud, so it does not depend on your local computer staying powered on in order to continue existing as a provisioned resource.",
  },
  {
    category: "Devices",
    question: "Does my local device need a lot of storage to use SensePC?",
    answer:
      "Not necessarily. Since the desktop runs in the cloud, your local device does not need to store everything the way a traditional standalone PC would.",
  },
  {
    category: "Devices",
    question: "What matters most on the local device when using SensePC?",
    answer:
      "The most important factors are a supported access method, a stable internet connection, and a device that can comfortably display and interact with the remote desktop session.",
  },
  {
    category: "Devices",
    question: "Does my local device performance still affect the experience?",
    answer:
      "Yes, but usually less than with a traditional PC. The cloud desktop handles the main workload, while your local device and network still affect things like responsiveness, display smoothness, and session comfort.",
  },
  {
    category: "Devices",
    question: "Can I use SensePC while traveling?",
    answer:
      "Yes. SensePC is designed to make your desktop environment available away from your main computer, which is useful when traveling or switching between locations.",
  },
  {
    category: "Devices",
    question: "Can I use SensePC on both personal and work devices?",
    answer:
      "Yes. As long as the device is supported and your account access is valid, SensePC can be used from different devices that fit your workflow.",
  },
  {
    category: "Devices",
    question: "Do I need identical hardware across my team to use SensePC?",
    answer:
      "No. One of the benefits of SensePC is that teams do not need identical local hardware in order to access a more standardized cloud desktop environment.",
  },
  {
    category: "Devices",
    question: "Can SensePC help if my current laptop is too slow?",
    answer:
      "Yes. SensePC is particularly useful for users who need access to stronger desktop resources without depending entirely on the limitations of their current local device.",
  },
  {
    category: "Devices",
    question: "Can I use SensePC without buying a new computer first?",
    answer:
      "Yes. SensePC is designed to reduce the need for immediate local hardware upgrades by moving the main desktop resources into the cloud.",
  },
  {
    category: "Devices",
    question: "Is SensePC tied to one local device after I first use it?",
    answer:
      "No. SensePC is not designed to be permanently locked to one local endpoint in the way a traditional physical computer is.",
  },
  {
    category: "Devices",
    question: "Do I need the latest hardware to get started with SensePC?",
    answer:
      "No. Many users can get started without the latest hardware, provided their device can support the connection method and maintain a usable session experience.",
  },
  {
    category: "Devices",
    question: "Does SensePC make it easier to work across multiple devices?",
    answer:
      "Yes. A major benefit of SensePC is that your desktop environment lives in the cloud, which makes it easier to access the same environment across supported devices.",
  },
  {
    category: "PC Configuration",
    question: "What can I choose when building a SensePC?",
    answer:
      "Depending on the currently available options, users can choose items such as operating system, compute profile, storage, location, and billing plan when building a SensePC.",
  },
  {
    category: "PC Configuration",
    question: "Can I choose Windows or Linux for my SensePC?",
    answer:
      "Yes. SensePC supports operating system choices based on the configurations currently offered on the platform.",
  },
  {
    category: "PC Configuration",
    question: "Can I choose a location for better performance?",
    answer:
      "Yes. Choosing a location closer to the end user usually helps improve responsiveness, especially for interactive workloads.",
  },
  {
    category: "PC Configuration",
    question: "Does SensePC support higher-performance workloads?",
    answer:
      "Yes, depending on the selected configuration. Workloads with heavier CPU, memory, graphics, or low-latency requirements should be matched to the right desktop profile.",
  },
  {
    category: "PC Configuration",
    question: "Can I choose different compute options when creating a SensePC?",
    answer:
      "Yes. SensePC configuration includes compute-related choices based on the options currently available on the platform.",
  },
  {
    category: "PC Configuration",
    question: "Can I choose storage size when creating a SensePC?",
    answer:
      "Yes. Storage selection is part of the broader SensePC setup experience, and users should choose the size that fits their workload and billing expectations.",
  },
  {
    category: "PC Configuration",
    question: "Does the location I choose affect performance?",
    answer:
      "Yes. The selected location can affect latency and responsiveness, especially for interactive or performance-sensitive workloads.",
  },
  {
    category: "PC Configuration",
    question: "Should I choose my SensePC configuration based on my workload?",
    answer:
      "Yes. The selected configuration should match the workload you expect to run so the desktop has the right level of CPU, memory, storage, and performance characteristics.",
  },
  {
    category: "PC Configuration",
    question: "Can I choose a SensePC setup for light everyday work or heavier workloads?",
    answer:
      "Yes. SensePC configurations are designed to support a range of workloads, from lighter day-to-day tasks to heavier professional or performance-oriented use cases, depending on the available options.",
  },
  {
    category: "PC Configuration",
    question: "Does every SensePC configuration support the same type of workload?",
    answer:
      "No. Different configurations are better suited for different workloads, so users should choose a setup that matches their expected performance and resource needs.",
  },
  {
    category: "PC Configuration",
    question: "Does the operating system choice affect what I can run on my SensePC?",
    answer:
      "Yes. The operating system you choose affects the software environment and should match the tools, applications, and workflow you plan to use.",
  },
  {
    category: "PC Configuration",
    question: "Can I choose a setup based on performance needs instead of just price?",
    answer:
      "Yes. Users should choose a SensePC configuration based on the workload and performance they need, not only on the listed price.",
  },
  {
    category: "Plans & Usage",
    question: "What billing plans does SensePC offer?",
    answer:
      "SensePC offers Hourly, Daily, and Monthly plans. Public pricing is listed by plan across SensePC configurations and locations.",
  },
  {
    category: "Plans & Usage",
    question: "What is the difference between Hourly, Daily, and Monthly plans?",
    answer:
      "Hourly is best for flexible or on-demand usage, has no uptime limit, and is the only plan that supports on-demand CPU and memory resize. Daily is designed for regular day-based usage and supports up to 10 hours of total uptime per day. Monthly is designed for steady long-duration workloads and supports up to 180 hours of total uptime during the monthly cycle.",
  },
  {
    category: "Plans & Usage",
    question: "When am I charged under each plan?",
    answer:
      "All SensePC plan charges are applied upfront at the beginning of the applicable billing cycle or billing unit.",
  },
  {
    category: "Plans & Usage",
    question: "How is SensePC pricing shown publicly?",
    answer:
      "The pricing page lists SensePC prices by PC configuration and location, with separate Hourly, Daily, and Monthly price columns for each listed setup.",
  },
  {
    category: "Plans & Usage",
    question: "Should I rely only on the pricing page for my final charge?",
    answer:
      "No. The pricing page is a public pricing reference. For the most accurate final amount, users should check the live cost calculator, the pricing shown during PC creation, and their billing dashboard usage records.",
  },
  {
    category: "Plans & Usage",
    question: "Can I change my billing plan later?",
    answer:
      "Yes. Plan changes are supported. Upgrades apply immediately, while supported downgrades are scheduled immediately and take effect after the current billing cycle ends.",
  },
  {
    category: "Plans & Usage",
    question: "Can I upgrade from Hourly to Daily or Monthly?",
    answer:
      "Yes. Users can upgrade from Hourly to Daily or Monthly, and the upgrade applies immediately.",
  },
  {
    category: "Plans & Usage",
    question: "Can I upgrade from Daily to Monthly?",
    answer:
      "Yes. Users can upgrade from Daily to Monthly, and the upgrade applies immediately.",
  },
  {
    category: "Plans & Usage",
    question: "Can I downgrade from Monthly to Daily or Hourly?",
    answer:
      "Yes. Users can request a downgrade from Monthly to Daily or Hourly. The downgrade is scheduled immediately, but it takes effect only after the current billing cycle ends.",
  },
  {
    category: "Plans & Usage",
    question: "Can I downgrade from Daily to Hourly?",
    answer:
      "Yes. Users can request a downgrade from Daily to Hourly. The downgrade is scheduled immediately, but it takes effect only after the current billing cycle ends.",
  },
  {
    category: "Plans & Usage",
    question: "When does a plan change take effect?",
    answer:
      "Upgrades apply immediately. Supported downgrades are scheduled immediately and take effect after the current billing cycle ends.",
  },
  {
    category: "Plans & Usage",
    question: "Can I cancel my plan?",
    answer:
      "No. Users cannot cancel a plan directly. If a lower plan is needed, a supported downgrade can be scheduled and will take effect after the current billing cycle ends.",
  },
  {
    category: "Plans & Usage",
    question: "Can I resize my SensePC after it is created?",
    answer:
      "Resize support depends on the active plan. Only the Hourly plan supports on-demand CPU and memory resize after the SensePC is created.",
  },
  {
    category: "Plans & Usage",
    question: "Which plan supports CPU and memory resize?",
    answer:
      "Only the Hourly plan supports increasing or decreasing CPU and memory on demand.",
  },
  {
    category: "Plans & Usage",
    question: "Can I increase or decrease CPU and memory on any plan?",
    answer:
      "No. On-demand CPU and memory resize is supported only on the Hourly plan.",
  },
  {
    category: "Plans & Usage",
    question: "Can I increase disk size after my SensePC is created?",
    answer:
      "Yes. Disk size can be increased after creation where supported by the active workflow.",
  },
  {
    category: "Plans & Usage",
    question: "Can I decrease disk size later?",
    answer:
      "No. Disk size reduction is not supported.",
  },
  {
    category: "Plans & Usage",
    question: "Does the Hourly plan have a usage limit?",
    answer:
      "No. The Hourly plan does not have a total uptime limit.",
  },
  {
    category: "Plans & Usage",
    question: "How much total uptime is included in the Hourly plan?",
    answer:
      "The Hourly plan does not have a maximum total uptime limit.",
  },
  {
    category: "Plans & Usage",
    question: "How much total uptime is included in the Daily plan?",
    answer:
      "The Daily plan supports up to 10 hours of total uptime per day.",
  },
  {
    category: "Plans & Usage",
    question: "How much total uptime is included in the Monthly plan?",
    answer:
      "The Monthly plan supports up to 180 hours of total uptime during the monthly billing cycle.",
  },
  {
    category: "Plans & Usage",
    question: "Does the Daily plan have a usage limit?",
    answer:
      "Yes. The Daily plan supports up to 10 hours of total uptime per day.",
  },
  {
    category: "Plans & Usage",
    question: "Does the Monthly plan have a usage limit?",
    answer:
      "Yes. The Monthly plan supports up to 180 hours of total uptime during the monthly billing cycle.",
  },
  {
    category: "Plans & Usage",
    question: "What happens when I stop my SensePC?",
    answer:
      "Stopping a SensePC ends the active running session, but it does not automatically stop every possible charge. The billing effect depends on the active plan and any storage resources that remain allocated.",
  },
  {
    category: "Plans & Usage",
    question: "What happens if I stop my SensePC on the Hourly plan?",
    answer:
      "If your SensePC is on the Hourly plan, SSD storage charges continue even after stopping the SensePC because the disk remains allocated to preserve your data.",
  },
  {
    category: "Plans & Usage",
    question: "Does SSD billing continue when my SensePC is stopped?",
    answer:
      "Yes. If your SensePC is on the Hourly plan, SSD storage charges continue after the SensePC is stopped because the disk remains allocated to preserve your data.",
  },
  {
    category: "Plans & Usage",
    question: "Do all plans behave the same when the SensePC is stopped?",
    answer:
      "No. Billing behavior depends on the active plan. Stopping a SensePC does not have the same billing effect under every plan.",
  },
  {
    category: "Plans & Usage",
    question: "Does stopping my SensePC delete my files or settings?",
    answer:
      "No. Stopping a SensePC is not the same as deleting it. Your environment, settings, and stored data remain available unless the resource is explicitly deleted or removed according to platform rules.",
  },
  {
    category: "Plans & Usage",
    question: "Does Sense Cloud follow the same plans as SensePC?",
    answer:
      "No. Sense Cloud does not use the same Hourly, Daily, and Monthly desktop plan structure. Sense Cloud is billed monthly based on the storage usage tier reached during the billing period.",
  },
  {
    category: "Plans & Usage",
    question: "Is Create SensePC Template included in the normal plan at no extra cost?",
    answer:
      "No. Creating a SensePC template is a paid feature, and users are charged daily for that template.",
  },
  {
    category: "Plans & Usage",
    question: "Which plan is best for short or variable usage?",
    answer:
      "Hourly is best for short sessions or variable usage and does not have a total uptime limit.",
  },
  {
    category: "Plans & Usage",
    question: "Which plan is best for regular day-based usage?",
    answer:
      "Daily is best for regular day-based usage and supports up to 10 hours of total uptime per day.",
  },
  {
    category: "Plans & Usage",
    question: "Which plan is best for steady long-duration workloads?",
    answer:
      "Monthly is best for steady long-duration workloads and supports up to 180 hours of total uptime during the monthly cycle.",
  },
  {
    category: "Plans & Usage",
    question: "What happens when my Daily plan reaches the 10-hour limit?",
    answer:
      "When your Daily plan reaches the 10-hour usage limit, your SensePC will be stopped. You can start it again after the next daily billing cycle begins.",
  },
  {
    category: "Plans & Usage",
    question: "What happens when my Monthly plan reaches the 180-hour limit?",
    answer:
      "When your Monthly plan reaches the 180-hour usage limit, your SensePC will be stopped. You can start it again after the next monthly billing cycle begins.",
  },
  {
    category: "Plans & Usage",
    question: "Is auto-renew enabled for Daily and Monthly plans?",
    answer:
      "Yes. Auto-renew is enabled by default for Daily and Monthly plans, but you can disable it later at any time.",
  },
  {
    category: "Plans & Usage",
    question: "Can I turn off auto-renew for my SensePC plan?",
    answer:
      "Yes. You can turn off auto-renew for your SensePC plan at any time.",
  },
  {
    category: "Access & Connection",
    question: "How do I access my SensePC after it is created?",
    answer:
      "Once your SensePC is ready and in the correct state, you can launch it from the dashboard using the available PC connect option for your account and workflow.",
  },
  {
    category: "Access & Connection",
    question: "What is Performance Mode in SensePC?",
    answer:
      "Performance Mode is a PC connect option that lets you switch from the browser viewer to the NICE DCV native client for a smoother, lower-latency, and more responsive desktop experience.",
  },
  {
    category: "Access & Connection",
    question: "Where can I find Performance Mode?",
    answer:
      "Once your SensePC session is open in the browser viewer, you can find Performance Mode in the control panel on the right side of the screen.",
  },
  {
    category: "Access & Connection",
    question: "How do I start Performance Mode?",
    answer:
      "First connect to your running SensePC in the browser viewer. Then open the control panel on the right side of the screen, select Performance Mode, review the confirmation dialog, and continue to launch the NICE DCV native client.",
  },
  {
    category: "Access & Connection",
    question: "Do I need to open my SensePC in the browser first before using Performance Mode?",
    answer:
      "Yes. The current handoff flow starts from the active browser viewer session and then switches to the NICE DCV native client.",
  },
  {
    category: "Access & Connection",
    question: "Do I need anything installed to use Performance Mode?",
    answer:
      "Yes. Performance Mode requires the NICE DCV desktop app to be installed on your computer.",
  },
  {
    category: "Access & Connection",
    question: "Can I use Performance Mode directly in the browser?",
    answer:
      "No. Performance Mode switches the session from the browser viewer to the NICE DCV native client, so the desktop app must be installed.",
  },
  {
    category: "Access & Connection",
    question: "What happens when I select Performance Mode?",
    answer:
      "A confirmation dialog appears first. After you confirm, SensePC attempts to open the NICE DCV native client using your current active session. If the handoff appears successful, the browser viewer disconnects. If not, the browser session stays active and fallback options are shown.",
  },
  {
    category: "Access & Connection",
    question: "Why does SensePC show a confirmation dialog before switching to Performance Mode?",
    answer:
      "The confirmation step makes the switch intentional and explains what will happen next, including browser disconnect behavior, fallback safety, and how to reconnect later if the native client closes unexpectedly.",
  },
  {
    category: "Access & Connection",
    question: "Will my browser session disconnect immediately when I choose Performance Mode?",
    answer:
      "No. The browser session is not disconnected first. SensePC keeps the browser session active unless the native handoff appears successful.",
  },
  {
    category: "Access & Connection",
    question: "What happens if the native NICE DCV client does not open?",
    answer:
      "If the native client does not open, the Performance Mode switch does not complete. Your browser session should stay active, and SensePC should show fallback options instead of ending your current browser session.",
  },
  {
    category: "Access & Connection",
    question: "Why does SensePC keep the browser session active if the native client does not open?",
    answer:
      "This is designed to protect fallback safety. The current handoff flow uses the active browser session first, so users do not lose access if the native client is missing or the auto-launch fails.",
  },
  {
    category: "Access & Connection",
    question: "What fallback options are available if Performance Mode does not launch automatically?",
    answer:
      "If auto-launch does not appear to work, SensePC can show fallback options such as NICE DCV download guidance and a .dcv connection file that you can open manually.",
  },
  {
    category: "Access & Connection",
    question: "Can I manually open the native client if automatic launch fails?",
    answer:
      "Yes. SensePC supports a .dcv connection file fallback so you can download the connection file and open it manually in the NICE DCV desktop app.",
  },
  {
    category: "Access & Connection",
    question: "What is the .dcv connection file used for?",
    answer:
      "The .dcv connection file is a fallback option that lets you manually open the current session in the NICE DCV native client if the direct application launch does not succeed.",
  },
  {
    category: "Access & Connection",
    question: "What should I do if my browser asks for permission to open the NICE DCV application?",
    answer:
      "Allow the application launch so the NICE DCV native client can open and complete the handoff.",
  },
  {
    category: "Access & Connection",
    question: "What should I do if NICE DCV is not installed yet?",
    answer:
      "Install the NICE DCV desktop app for your operating system and system type, then return to your SensePC session and try Performance Mode again.",
  },
  {
    category: "Access & Connection",
    question: "Can I close the browser tab after switching to Performance Mode?",
    answer:
      "Yes. After the native client opens successfully and the handoff is completed, you can close the browser tab if you no longer need it.",
  },
  {
    category: "Access & Connection",
    question: "What happens after the native client opens successfully?",
    answer:
      "After the native client opens successfully, your session moves from the browser viewer into the NICE DCV native client and the browser viewer disconnects.",
  },
  {
    category: "Access & Connection",
    question: "Does Performance Mode create a completely new session every time?",
    answer:
      "No. The current handoff uses the existing active session for the browser-to-native switch rather than forcing a brand-new session during this flow.",
  },
  {
    category: "Access & Connection",
    question: "If my native client disconnects or closes unexpectedly, how do I reconnect?",
    answer:
      "Go back to your SensePC dashboard, locate the same running cloud PC, click Connect to reopen the browser session, and then use Performance Mode again to relaunch the NICE DCV native client.",
  },
  {
    category: "Access & Connection",
    question: "Can I get back into my SensePC if the native client is interrupted or closed by mistake?",
    answer:
      "Yes. If the native client is interrupted, closed by mistake, or loses connection, you can return to the dashboard, reconnect in the browser, and launch Performance Mode again.",
  },
  {
    category: "Access & Connection",
    question: "Does Performance Mode work only on one operating system?",
    answer:
      "No. The backend implementation supports both Windows and Linux for this handoff flow.",
  },
  {
    category: "Access & Connection",
    question: "Is NICE DCV Client a SensePC-owned application?",
    answer:
      "No. NICE DCV Client is a third-party application provided by Amazon Web Services.",
  },
  {
    category: "Scheduling & Automation",
    question: "How do auto-start and auto-stop schedules work?",
    answer:
      "Your SensePC can start and stop automatically based on the schedule you set.",
  },
  {
    category: "Scheduling & Automation",
    question: "What is idle timeout and what happens when it is reached?",
    answer:
      "Idle timeout is a setting that automatically stops your SensePC after it has been connected but inactive for the configured amount of time.",
  },
  {
    category: "Access & Connection",
    question: "When can I connect to my SensePC?",
    answer:
      "You can connect once your SensePC has finished provisioning and is in a ready or running state that supports an active session.",
  },
  {
    category: "Access & Connection",
    question: "Why is the Connect button unavailable?",
    answer:
      "The Connect button may be unavailable if the SensePC is still provisioning, stopped, starting, not yet ready, not assigned correctly, or otherwise not in a state that allows an active session.",
  },
  {
    category: "Access & Connection",
    question: "Do I need to allow pop-ups in my browser to connect?",
    answer:
      "Yes. In browser-based workflows, you may need to allow pop-ups or redirects so the remote desktop session can open correctly.",
  },
  {
    category: "Access & Connection",
    question: "What should I do if the remote desktop window does not open?",
    answer:
      "First check whether pop-ups or redirects are blocked, confirm the SensePC is running, refresh the dashboard, and verify that your browser session is still active. If the issue continues, open a support ticket with the SensePC name and account details.",
  },
  {
    category: "Access & Connection",
    question: "What happens if I close my browser during a session?",
    answer:
      "Closing the browser usually ends your local view of the session, but it does not automatically delete, reset, or stop the SensePC. You can usually reconnect if the SensePC is still running and your account still has access.",
  },
  {
    category: "Access & Connection",
    question: "Does closing the browser stop my SensePC?",
    answer:
      "No. Closing the browser does not automatically stop the SensePC. It usually only closes your local view of the session.",
  },
  {
    category: "Access & Connection",
    question: "Can I reconnect if my session is interrupted?",
    answer:
      "Yes. In many cases you can reconnect if the SensePC is still running, your session is still valid, and your account has access to the desktop.",
  },
  {
    category: "Access & Connection",
    question: "Can I access my SensePC from a browser?",
    answer:
      "Yes. SensePC supports browser-based access for supported workflows.",
  },
  {
    category: "Access & Connection",
    question: "Do I need special local software to connect?",
    answer:
      "For standard browser-based access, not necessarily. Many users can connect through a supported browser. However, some PC connect options, such as Performance Mode, require the AWS DCV desktop app.",
  },
  {
    category: "Access & Connection",
    question: "What is Performance Mode?",
    answer:
      "Performance Mode is a PC connect option designed for users who want the best possible remote desktop performance experience.",
  },
  {
    category: "Access & Connection",
    question: "Where can I find Performance Mode?",
    answer:
      "Performance Mode is available from the SensePC control panel on the right side of the screen during a session.",
  },
  {
    category: "Access & Connection",
    question: "Do I need anything extra to use Performance Mode?",
    answer:
      "Yes. Performance Mode requires the AWS DCV desktop app to be installed.",
  },
  {
    category: "Access & Connection",
    question: "Can I use Performance Mode directly in the browser?",
    answer:
      "No. Performance Mode requires the AWS DCV desktop app.",
  },
  {
    category: "Access & Connection",
    question: "Why would I use Performance Mode?",
    answer:
      "Performance Mode is the best PC connect option for users who want lower latency and higher maximum FPS, especially for more interactive or performance-sensitive workloads.",
  },
  {
    category: "Access & Connection",
    question: "Can I access the same SensePC from different devices?",
    answer:
      "Yes. SensePC is designed so users can access the same cloud desktop from supported devices instead of being tied to one local machine.",
  },
  {
    category: "Access & Connection",
    question: "What do I need to connect successfully?",
    answer:
      "You generally need a supported device, a supported browser or PC connect option, a stable internet connection, a ready or running SensePC, and valid account access.",
  },
  {
    category: "Access & Connection",
    question: "What is the difference between disconnecting, stopping, rebooting, and deleting a SensePC?",
    answer:
      "Disconnecting closes your current session but does not turn off the SensePC. Stopping turns off the SensePC until you start it again. Rebooting restarts the SensePC. Deleting permanently removes the SensePC.",
  },
  {
    category: "Access & Connection",
    question: "Which features require the AWS DCV desktop app instead of browser access?",
    answer:
      "For most work, browser access is enough. For the best gaming and performance-focused experience, users should use the AWS DCV desktop app.",
  },
  {
    category: "Access & Connection",
    question: "Is NICE DCV Client a SensePC-owned application?",
    answer:
      "No. NICE DCV Client is a third-party application provided by Amazon Web Services.",
  },
  {
    category: "Access & Connection",
    question: "Does SensePC manage NICE DCV Client updates or patches?",
    answer:
      "No. NICE DCV Client is a third-party application, and SensePC does not manage its software updates, patches, or security lifecycle.",
  },
  {
    category: "Performance",
    question: "What affects SensePC performance the most?",
    answer:
      "SensePC performance is mainly affected by location choice, network quality, connection stability, local device responsiveness, workload type, and the desktop configuration you choose. Interactive workloads are usually more sensitive to latency than basic office tasks.",
  },
  {
    category: "Performance",
    question: "What affects SensePC responsiveness the most?",
    answer:
      "Responsiveness is usually shaped by network quality, distance to the selected location, workload sensitivity, and whether the desktop configuration is a good fit for the applications being used.",
  },
  {
    category: "Performance",
    question: "What latency should users expect by location?",
    answer:
      "Latency depends on how far the user is from the selected location, the quality of the local internet connection, routing conditions, and the type of workload. Users who choose a location closer to them generally experience better responsiveness, especially for interactive tasks.",
  },
  {
    category: "Performance",
    question: "Does choosing the right location improve performance?",
    answer:
      "Yes. Choosing a location closer to the user can help reduce latency and improve responsiveness, especially for interactive workflows such as remote desktop use, development, design work, and performance-sensitive sessions.",
  },
  {
    category: "Performance",
    question: "Will performance be the same for every workload?",
    answer:
      "No. Different workloads place different demands on CPU, memory, graphics, storage, and network responsiveness, so the experience will vary depending on the application and the selected desktop configuration.",
  },
  {
    category: "Performance",
    question: "Can SensePC support heavier professional workloads?",
    answer:
      "Yes, when the selected configuration matches the workload. Heavier applications may require more compute, more memory, stronger graphics capability, or a location with better responsiveness for the user.",
  },
  {
    category: "Performance",
    question: "Can SensePC support performance-heavy or graphics-intensive work?",
    answer:
      "Yes. Performance-heavy and graphics-intensive workloads can be supported when the desktop configuration is chosen appropriately and the user has a stable, low-latency connection.",
  },
  {
    category: "Performance",
    question: "Can I use SensePC for gaming or other latency-sensitive workloads?",
    answer:
      "Yes. SensePC is suitable for users who need strong interactive performance. For the best experience, users should choose the right configuration, select the closest practical location, maintain a stable connection, and use the best PC connect option for their workload.",
  },
  {
    category: "Performance",
    question: "What is Performance Mode?",
    answer:
      "Performance Mode is a PC connect option designed to provide the best performance experience in terms of lower latency and higher maximum FPS.",
  },
  {
    category: "Performance",
    question: "How do I get the best performance from SensePC?",
    answer:
      "For the best performance experience, users should choose the right configuration, select the best location for their use, maintain a stable connection, and use Performance Mode with the AWS DCV desktop app.",
  },
  {
    category: "Performance",
    question: "Does Performance Mode improve latency and FPS?",
    answer:
      "Yes. Performance Mode is designed to provide the best performance in terms of lower latency and higher maximum FPS.",
  },
  {
    category: "Performance",
    question: "Why would I use Performance Mode instead of standard browser access?",
    answer:
      "Users who want the best possible performance, especially for more interactive or performance-sensitive workloads, should use Performance Mode with the AWS DCV desktop app because it is designed for lower latency and higher maximum FPS.",
  },
  {
    category: "Performance",
    question: "Does browser-based access affect performance?",
    answer:
      "Browser-based access can deliver a strong experience for many workflows, but performance still depends on the browser environment, device responsiveness, and network conditions. Users who want the best performance in terms of latency and maximum FPS should use Performance Mode with the AWS DCV desktop app.",
  },
  {
    category: "Performance",
    question: "Why does SensePC performance depend on my internet connection if the desktop runs in the cloud?",
    answer:
      "The cloud desktop does the main computing work, but your local experience still depends on how quickly your device can send input and receive the live desktop stream. That means internet quality and stability still play a major role in perceived performance.",
  },
  {
    category: "Performance",
    question: "Does my local device still affect performance?",
    answer:
      "Yes. Even though the main workload runs in the cloud, your local device still affects the session experience through display handling, browser or app responsiveness, and overall interaction smoothness.",
  },
  {
    category: "Performance",
    question: "Will every user in a team experience the same performance?",
    answer:
      "Not necessarily. Even with the same desktop configuration, user experience can vary based on location, internet quality, local device condition, and workload sensitivity.",
  },
  {
    category: "Performance",
    question: "Why can two users with the same setup experience different responsiveness?",
    answer:
      "Two users can have different experiences because of differences in distance to the selected location, internet stability, local network conditions, local device responsiveness, and the applications they are running.",
  },
  {
    category: "Performance",
    question: "Does the selected desktop configuration matter for performance?",
    answer:
      "Yes. Choosing the right desktop configuration is one of the biggest performance factors. A configuration that is too small for the workload may feel slower even if the network connection is good.",
  },
  {
    category: "Performance",
    question: "Can the wrong configuration make SensePC feel slow?",
    answer:
      "Yes. If the selected CPU, memory, graphics capability, or storage setup does not match the workload, the desktop may feel slower or less responsive than expected.",
  },
  {
    category: "Performance",
    question: "Is SensePC performance only about compute power?",
    answer:
      "No. Strong compute resources help, but overall performance also depends on network quality, location choice, workload sensitivity, graphics needs, and how the session is being accessed from the local device.",
  },
  {
    category: "Performance",
    question: "Does network stability matter as much as network speed?",
    answer:
      "Yes. A stable connection is extremely important for cloud desktop responsiveness. Fast internet is helpful, but instability, packet loss, or frequent connection changes can still hurt the session experience.",
  },
  {
    category: "Performance",
    question: "Can Wi-Fi quality affect SensePC performance?",
    answer:
      "Yes. Local Wi-Fi quality can affect the session experience, especially if the connection is unstable, congested, or inconsistent.",
  },
  {
    category: "Performance",
    question: "What should I do if my SensePC session feels slow?",
    answer:
      "First check your local internet stability, confirm you selected a suitable location, review whether your desktop configuration matches the workload, and close unnecessary local browser tabs or apps. If the issue continues, open a support ticket with the workload details.",
  },
  {
    category: "Performance",
    question: "How do I know if I chose the wrong SensePC configuration?",
    answer:
      "If your applications regularly feel slow, take too long to open, struggle during heavier tasks, or become less responsive under load, the selected configuration may not be the best fit for your workload.",
  },
  {
    category: "Performance",
    question: "What kind of connection is best for better SensePC responsiveness?",
    answer:
      "A stable, low-latency internet connection generally provides the best experience. Consistency is especially important for interactive workloads that are sensitive to input delay or screen update lag.",
  },
  {
    category: "Performance",
    question: "Will performance improve if I move closer to the selected location?",
    answer:
      "In many cases, yes. Being physically closer to the selected location can reduce latency and improve responsiveness for interactive use.",
  },
  {
    category: "Performance",
    question: "Is SensePC good for office and productivity work?",
    answer:
      "Yes. Standard office and productivity workloads are generally less sensitive to latency than highly interactive tasks, so many users can get a strong experience with the right setup.",
  },
  {
    category: "Performance",
    question: "Is SensePC good for development and technical workflows?",
    answer:
      "Yes. SensePC can support development and technical workflows, especially when users choose a configuration that matches their tools, workload size, and responsiveness needs.",
  },
  {
    category: "Performance",
    question: "What should I review first when performance does not match expectations?",
    answer:
      "Start by reviewing the selected location, the cloud desktop configuration, the local device condition, browser or access method, and the quality of the current network connection.",
  },
  {
    category: "Performance",
    question: "Can SensePC performance improve after switching to a closer location or better configuration?",
    answer:
      "Yes. Improving location choice or moving to a better-fitting configuration can significantly improve the user experience when the original setup is not aligned with the workload or location.",
  },
  {
    category: "Performance",
    question: "Why do interactive tasks feel more sensitive than normal office tasks?",
    answer:
      "Interactive tasks depend more heavily on immediate input response and rapid screen updates, so latency and connection stability are more noticeable than they are in lighter, less time-sensitive workflows.",
  },
  {
    category: "Performance",
    question: "What is the biggest mistake users make when judging SensePC performance?",
    answer:
      "A common mistake is assuming performance depends only on cloud compute size. In practice, location choice, connection quality, workload fit, and the local access experience also matter a great deal.",
  },
  {
    category: "Performance",
    question: "What is Performance Mode designed to improve?",
    answer:
      "Performance Mode is designed to improve responsiveness by giving users a smoother experience, lower latency, and higher maximum FPS than standard browser-only use.",
  },
  {
    category: "Performance",
    question: "Why would I use Performance Mode instead of standard browser access?",
    answer:
      "Users who want the best possible performance, especially for more interactive or performance-sensitive workflows, should use Performance Mode because it is designed for lower latency, smoother control, and higher maximum FPS.",
  },
  {
    category: "Performance",
    question: "Does Performance Mode improve latency and FPS?",
    answer:
      "Yes. Performance Mode is designed to provide the best performance experience in terms of lower latency and higher maximum FPS.",
  },
  {
    category: "Performance",
    question: "Who is Performance Mode best for?",
    answer:
      "Performance Mode is especially useful for gamers, developers, designers, engineers, creative professionals, and other power users who want faster input response, smoother motion, and a more desktop-like experience.",
  },
  {
    category: "Performance",
    question: "When should I use Performance Mode?",
    answer:
      "You may want to use Performance Mode when you want better responsiveness for gaming, more fluid interaction for demanding applications, lower-latency control, or a more stable experience during longer sessions.",
  },
  {
    category: "Performance",
    question: "Is Performance Mode a good choice for gaming?",
    answer:
      "Yes. Performance Mode is one of the strongest options for gaming because it is designed to provide lower latency, smoother control, and higher maximum FPS.",
  },
  {
    category: "Performance",
    question: "Is Performance Mode useful for developers and creative professionals?",
    answer:
      "Yes. Performance Mode is beneficial for developers, designers, engineers, creative professionals, and other users who want more responsive control and smoother session behavior.",
  },
  {
    category: "Performance",
    question: "Does browser-based access still work for many workflows?",
    answer:
      "Yes. Browser access can still work well for many workflows, but users who want the best available performance should use Performance Mode with the NICE DCV desktop app.",
  },
  {
    category: "Performance",
    question: "How do I get the best possible SensePC performance?",
    answer:
      "For the best overall experience, choose the right desktop configuration, choose the best location for the user, maintain a stable low-latency connection, and use Performance Mode with the NICE DCV desktop app.",
  },
  {
    category: "Performance",
    question: "Does Performance Mode replace the need for a good internet connection?",
    answer:
      "No. Performance Mode improves the connection experience, but users still need a stable network and a suitable location choice for the best results.",
  },
  {
    category: "Performance",
    question: "Does Performance Mode guarantee success every time?",
    answer:
      "No. Browser-based native app launch detection is best-effort, so SensePC uses fallback logic and keeps the browser session alive if the handoff does not appear to succeed.",
  },
  {
    category: "Performance",
    question: "Is Performance Mode based on a third-party client?",
    answer:
      "Yes. Performance Mode uses the NICE DCV Client, which is a third-party application provided by Amazon Web Services.",
  },
  {
    category: "Wallet & Payments",
    question: "How does SensePC billing work?",
    answer:
      "SensePC billing is based on the selected desktop billing plan. SensePC offers Hourly, Daily, and Monthly plans, while Sense Cloud storage follows its own monthly usage-tier billing model.",
  },
  {
    category: "Wallet & Payments",
    question: "When am I charged for SensePC?",
    answer:
      "All SensePC charges are applied upfront at the beginning of the applicable billing cycle or billing unit.",
  },
  {
    category: "Wallet & Payments",
    question: "Is Sense Cloud billed the same way as SensePC desktop plans?",
    answer:
      "No. Sense Cloud does not use the same Hourly, Daily, and Monthly desktop plan structure. Sense Cloud is billed monthly based on the storage usage tier reached during the billing period.",
  },
  {
    category: "Wallet & Payments",
    question: "What payment methods does SensePC support?",
    answer:
      "SensePC accepts payment from most international credit and debit cards.",
  },
  {
    category: "Wallet & Payments",
    question: "Does SensePC support PayPal?",
    answer:
      "No. PayPal is not supported as a payment method.",
  },
  {
    category: "Wallet & Payments",
    question: "Can I use a gift card to pay for SensePC?",
    answer:
      "No. Gift cards are not supported as a payment method.",
  },
  {
    category: "Wallet & Payments",
    question: "What is the minimum wallet recharge amount?",
    answer:
      "The minimum wallet recharge amount is $20.",
  },
  {
    category: "Wallet & Payments",
    question: "Do I need to recharge my wallet to use SensePC?",
    answer:
      "Users need billing readiness before using paid SensePC services. Wallet funding is part of that process for desktop usage, storage usage, and other paid features.",
  },
  {
    category: "Wallet & Payments",
    question: "Can I recharge my wallet quickly?",
    answer:
      "Yes. SensePC supports quick recharge so users can add funds to their wallet more easily.",
  },
  {
    category: "Wallet & Payments",
    question: "Does SensePC support auto-recharge?",
    answer:
      "Yes. Users can enable or disable auto-recharge for their wallet.",
  },
  {
    category: "Wallet & Payments",
    question: "Can I disable auto-recharge later?",
    answer:
      "Yes. Users can enable or disable auto-recharge from billing and payment settings.",
  },
  {
    category: "Wallet & Payments",
    question: "What happens if auto-recharge fails?",
    answer:
      "If auto-recharge repeatedly fails because a bank declines the payment, auto-recharge may be disabled automatically after multiple failed attempts.",
  },
  {
    category: "Wallet & Payments",
    question: "Can I add more than one payment card?",
    answer:
      "Yes. Users can add multiple cards in Manage Payment Method.",
  },
  {
    category: "Wallet & Payments",
    question: "Can I change my default payment card?",
    answer:
      "Yes. Users can change which saved card is set as the default payment method.",
  },
  {
    category: "Wallet & Payments",
    question: "What happens if I only have one saved card?",
    answer:
      "If only one card is saved on the account, that card remains the default payment method.",
  },
  {
    category: "Wallet & Payments",
    question: "Can I remove my last saved card?",
    answer:
      "No, not if auto plan renew is enabled. When auto plan renew is active, the last saved card must remain on file.",
  },
  {
    category: "Wallet & Payments",
    question: "Why can’t I remove my only saved card?",
    answer:
      "If auto plan renew is enabled, the last saved card must remain on file so renewal-related billing can continue correctly.",
  },
  {
    category: "Wallet & Payments",
    question: "Can teams manage billing from one account?",
    answer:
      "Yes. SensePC supports centralized billing workflows so teams can manage wallet funding, payment methods, and billing activity from one account experience.",
  },
  {
    category: "Wallet & Payments",
    question: "Where can I review my charges and billing activity?",
    answer:
      "Users can review charges in the billing page under Wallet Recharge and Billing History.",
  },
  {
    category: "Wallet & Payments",
    question: "Where can I check wallet recharge history?",
    answer:
      "Wallet recharge history is available in the billing page under Wallet Recharge and Billing History.",
  },
  {
    category: "Wallet & Payments",
    question: "Where can I check billing history for SensePC charges?",
    answer:
      "Billing history is available in the billing page under Wallet Recharge and Billing History.",
  },
  {
    category: "Wallet & Payments",
    question: "Can I review promotions and cashback in the billing page?",
    answer:
      "Yes. Users can review promotion and cashback information in the billing page.",
  },
  {
    category: "Wallet & Payments",
    question: "Can I review my monthly wallet spending?",
    answer:
      "Yes. Users can review wallet monthly spending in the billing page.",
  },
  {
    category: "Wallet & Payments",
    question: "Does SensePC separate desktop billing from storage billing?",
    answer:
      "Yes. SensePC desktop billing and Sense Cloud storage billing follow different charging models, even though both are visible within the broader billing experience.",
  },
  {
    category: "Wallet & Payments",
    question: "How do I pay for SensePC?",
    answer:
      "SensePC uses a wallet-based payment model. Users add funds to their wallet, and charges are applied based on the active SensePC plan, storage usage, and other paid features.",
  },
  {
    category: "Wallet & Payments",
    question: "Do I need to add funds before creating a SensePC?",
    answer:
      "Billing readiness is part of the setup process. Depending on the workflow and account state, users may need wallet funding or a valid payment method before starting paid usage.",
  },
  {
    category: "Wallet & Payments",
    question: "Can I enable auto-recharge for my wallet?",
    answer:
      "Yes. Auto-recharge can be enabled to help prevent service interruption by automatically adding funds when your wallet balance reaches the configured threshold.",
  },
  {
    category: "Wallet & Payments",
    question: "Can auto-recharge turn off automatically?",
    answer:
      "Yes. Auto-recharge may be turned off automatically after multiple failed payment attempts caused by card declines.",
  },
  {
    category: "Wallet & Payments",
    question: "Where can I see my usage and charge history?",
    answer:
      "Users can review charges, wallet recharges, and billing activity in the billing page under Wallet Recharge and Billing History.",
  },
  {
    category: "Wallet & Payments",
    question: "Where can I see my wallet recharge history?",
    answer:
      "Wallet recharge history is available in the billing page under Wallet Recharge and Billing History.",
  },
  {
    category: "Wallet & Payments",
    question: "Where can I review promotions and cashback?",
    answer:
      "Users can review promotion and cashback information in the billing page.",
  },
  {
    category: "Wallet & Payments",
    question: "Can teams manage wallet funding and payments from one account?",
    answer:
      "Yes. SensePC supports centralized billing workflows so teams can manage wallet funding, payment methods, and billing visibility from one broader account experience.",
  },
  {
    category: "Promotions & Billing",
    question: "Can a user receive the signup promo more than once?",
    answer:
      "No. A user can receive the signup promo only once. Creating multiple accounts does not make the user eligible to receive the signup promo again.",
  },
  {
    category: "Promotions & Billing",
    question: "How much is the signup promo balance?",
    answer:
      "The signup promo balance amount may vary. It is intended to cover a limited amount of free SensePC usage.",
  },
  {
    category: "Promotions & Billing",
    question: "Can promo balance or cashback balance be withdrawn or redeemed as real money?",
    answer:
      "No. Promo balance and cashback balance cannot be withdrawn, transferred, or redeemed as real money.",
  },
  {
    category: "Promotions & Billing",
    question: "Can promo balance or cashback balance be refunded?",
    answer:
      "No. Promo balance and cashback balance are not eligible for refund.",
  },
  {
    category: "Promotions & Billing",
    question: "How are promo balance and cashback balance used?",
    answer:
      "Promo balance and cashback balance are automatically applied toward eligible SensePC and Sense Cloud usage.",
  },
  {
    category: "Promotions & Billing",
    question: "What is cashback balance?",
    answer:
      "Cashback balance is a promotional service credit earned from qualifying activity. It can only be used for eligible service usage and cannot be withdrawn or redeemed as real money.",
  },
  {
    category: "Promotions & Billing",
    question: "What is included in promotional balances?",
    answer:
      "Promotional balances include any signup promo credits, promotional credits, and cashback credits that have been added to the account.",
  },
  {
    category: "Refunds",
    question: "Does SensePC offer refunds?",
    answer:
      "Refunds are only considered in limited cases after investigation. A refund may be reviewed only if the issue was caused by improper billing by SensePC, a SensePC billing or platform error, or infrastructure downtime caused by the cloud resource provider.",
  },
  {
    category: "Refunds",
    question: "When am I eligible for a refund?",
    answer:
      "A refund may be considered only if the issue was caused by improper billing by SensePC, a SensePC billing or platform error, or infrastructure downtime caused by the cloud resource provider.",
  },
  {
    category: "Refunds",
    question: "How do I request a refund?",
    answer:
      "To request a refund, submit a support ticket with the relevant billing and account details. The billing team will investigate the request before any refund decision is made.",
  },
  {
    category: "Refunds",
    question: "Are refunds automatic?",
    answer:
      "No. Refunds are not automatic. Every refund request is reviewed through a support ticket and investigated by the billing team.",
  },
  {
    category: "Refunds",
    question: "Who reviews refund requests?",
    answer:
      "Refund requests are reviewed by the billing team after the user opens a support ticket.",
  },
  {
    category: "Refunds",
    question: "Can any charge be refunded?",
    answer:
      "No. Charges are not refundable in general. A refund is only considered in limited cases where the issue is caused by improper billing by SensePC, a SensePC error, or infrastructure downtime caused by the cloud resource provider.",
  },
  {
    category: "Refunds",
    question: "What should I do if I believe I was billed incorrectly?",
    answer:
      "Open a support ticket with your account details, the charge in question, the billing plan involved, and the approximate date of the charge so the billing team can investigate.",
  },
  {
    category: "Refunds",
    question: "Will plan changes or other account actions automatically create a refund?",
    answer:
      "No. Plan changes or other account actions do not automatically create a refund. Refunds are only considered in limited cases after billing team investigation.",
  },
  {
    category: "Refunds",
    question: "Can the refunded amount be different from the original charge?",
    answer:
      "Yes. If a refund is approved, a transaction charge may be deducted from the refund amount, so the final refunded amount may be lower than the original charge.",
  },
  {
    category: "Refunds",
    question: "Does opening a support ticket guarantee a refund?",
    answer:
      "No. Opening a support ticket starts the review process, but refund approval depends on the billing team’s investigation and findings.",
  },
  {
    category: "Refunds",
    question: "Can support approve refunds immediately?",
    answer:
      "Support can help collect the request and billing details, but refund approval depends on billing team investigation rather than immediate automatic approval.",
  },
  {
    category: "Refunds",
    question: "What details should I include in a refund request?",
    answer:
      "Include your account details, the charge you are questioning, the billing plan involved, the approximate date of the charge, and a short explanation of the issue so the billing team can investigate properly.",
  },
  {
    category: "Security & Privacy",
    question: "How does SensePC protect user traffic and data in transit?",
    answer:
      "Traffic between users and SensePC or Sense Cloud is encrypted in transit to help protect desktop access, storage activity, and account interactions.",
  },
  {
    category: "Security & Privacy",
    question: "Is traffic between the user and SensePC encrypted?",
    answer:
      "Yes. Traffic between the user and SensePC is encrypted in transit.",
  },
  {
    category: "Security & Privacy",
    question: "Is traffic between the user and Sense Cloud encrypted?",
    answer:
      "Yes. Traffic between the user and Sense Cloud is encrypted in transit.",
  },
  {
    category: "Security & Privacy",
    question: "Does each SensePC run in an isolated environment?",
    answer:
      "Yes. Each SensePC runs in its own isolated environment to help separate one user's desktop from another.",
  },
  {
    category: "Security & Privacy",
    question: "Can one SensePC communicate directly with another user's SensePC?",
    answer:
      "No. SensePC desktops are designed to run in isolated environments so one PC cannot directly talk to another user's PC as part of normal platform operation.",
  },
  {
    category: "Security & Privacy",
    question: "How does SensePC approach platform security?",
    answer:
      "SensePC takes both user security and infrastructure security seriously. The platform is designed with security-focused controls around encrypted traffic, desktop isolation, account protection, and payment handling.",
  },
  {
    category: "Security & Privacy",
    question: "How does SensePC handle security and customer data?",
    answer:
      "SensePC applies security-focused controls around account access, encrypted traffic, isolated desktop environments, and infrastructure protection. Payment data is handled through Stripe rather than being stored directly in SensePC systems.",
  },
  {
    category: "Security & Privacy",
    question: "Does SensePC store my full card information?",
    answer:
      "No. SensePC does not store full user card information in its own infrastructure.",
  },
  {
    category: "Security & Privacy",
    question: "Who handles SensePC payment processing?",
    answer:
      "Payment method handling and transaction processing are managed by Stripe.",
  },
  {
    category: "Security & Privacy",
    question: "Does my payment card ever touch SensePC infrastructure?",
    answer:
      "No. Payment card handling is managed by Stripe, so full card details do not pass through or stay stored in SensePC infrastructure.",
  },
  {
    category: "Security & Privacy",
    question: "How are SensePC payments secured?",
    answer:
      "Payments are handled through Stripe, which processes transactions using strong encryption. SensePC does not store full card information directly in its own systems.",
  },
  {
    category: "Security & Privacy",
    question: "Does SensePC collect browser or device information for security?",
    answer:
      "Yes. SensePC may collect browser and related session information for security hardening and platform protection purposes.",
  },
  {
    category: "Security & Privacy",
    question: "Does SensePC collect IP address or location information?",
    answer:
      "Yes. SensePC may collect information such as IP address and location-related browser data to support security hardening, account protection, and infrastructure security monitoring.",
  },
  {
    category: "Security & Privacy",
    question: "Why does SensePC collect browser, IP, or location-related information?",
    answer:
      "SensePC collects browser and related connection information to strengthen platform security, help detect suspicious activity, and improve account and infrastructure protection.",
  },
  {
    category: "Security & Privacy",
    question: "Where can I review SensePC security practices?",
    answer:
      "Users should review the public Security page, Privacy Policy, and Terms of Service for the latest platform security, privacy, and usage information.",
  },
  {
    category: "Security & Privacy",
    question: "Does SensePC support team access control?",
    answer:
      "Yes. SensePC supports role-based team workflows so organizations can manage access more deliberately across owners, admins, and other users based on the workspace setup.",
  },
  {
    category: "Security & Privacy",
    question: "How should businesses evaluate SensePC for compliance-sensitive work?",
    answer:
      "Organizations with stricter compliance or governance requirements should review the Security page, Privacy Policy, Terms of Service, and their own internal review standards before rollout.",
  },
  {
    category: "Security & Privacy",
    question: "Where can I review SensePC Terms of Service?",
    answer:
      "Users should review the Terms of Service on the SensePC website for the current rules, account terms, service usage conditions, and related policies.",
  },
  {
    category: "Security & Privacy",
    question: "Where can I review the Privacy Policy?",
    answer:
      "Users should review the Privacy Policy on the SensePC website for details about what information is collected, how it is used, and how privacy-related practices are handled.",
  },
  {
    category: "Security & Privacy",
    question: "Does SensePC store payment card information?",
    answer:
      "No. SensePC does not store full payment card information in its own systems. Payment information is handled through Stripe.",
  },
  {
    category: "Security & Privacy",
    question: "What information does SensePC collect for security purposes?",
    answer:
      "SensePC may collect browser information, IP address, and location-related session data to strengthen security, protect accounts, and support platform hardening.",
  },
  {
    category: "Security & Privacy",
    question: "Why does SensePC collect IP and browser information?",
    answer:
      "This information helps improve security, detect suspicious activity, strengthen infrastructure protection, and support safer account access.",
  },
  {
    category: "Security & Privacy",
    question: "Who processes transactions for SensePC?",
    answer:
      "Transactions are processed through Stripe.",
  },
  {
    category: "Security & Privacy",
    question: "Are SensePC transactions encrypted?",
    answer:
      "Yes. Transactions handled through Stripe are protected with strong encryption as part of the payment processing flow.",
  },
  {
    category: "Security & Privacy",
    question: "Does SensePC support MFA for login?",
    answer:
      "Yes. SensePC supports MFA for login. Users can enable MFA using an authenticator app or email verification.",
  },
  {
    category: "Security & Privacy",
    question: "Is NICE DCV Client managed by SensePC?",
    answer:
      "No. NICE DCV Client is a third-party application provided by Amazon Web Services. SensePC does not manage its updates, patches, or security lifecycle, so users should use it according to their own IT and security requirements.",
  },
  {
    category: "Troubleshooting",
    question: "What should I check first if SensePC feels slow?",
    answer:
      "Start by checking your internet stability, local Wi-Fi or network quality, selected location, and whether your current desktop configuration matches the workload. Interactive workloads are especially sensitive to latency and connection stability.",
  },
  {
    category: "Troubleshooting",
    question: "What should I check first if access feels slow?",
    answer:
      "Check your network stability, selected location, browser or access method, and whether the workload is heavier than your current SensePC configuration is designed to handle.",
  },
  {
    category: "Troubleshooting",
    question: "Why does my SensePC feel slow even though it runs in the cloud?",
    answer:
      "Even though the desktop runs in the cloud, your session experience still depends on internet stability, distance to the selected location, local device responsiveness, and workload sensitivity.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if I cannot access my desktop?",
    answer:
      "First confirm that your account is signed in correctly, the desktop is in a ready or running state, your browser or device is supported, and your internet connection is stable. If access still fails, open a support ticket with the relevant account and desktop details.",
  },
  {
    category: "Troubleshooting",
    question: "Why is the Connect button unavailable?",
    answer:
      "The Connect button may be unavailable if the desktop is still provisioning, stopped, starting, not yet ready, or otherwise not in a state that allows an active session.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if the Connect button does not work?",
    answer:
      "Refresh the dashboard, confirm the desktop is in the correct state, make sure your browser session is still active, and verify that pop-ups or redirects are not being blocked.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if the remote desktop window does not open?",
    answer:
      "Check whether your browser is blocking pop-ups or redirects, confirm the desktop is running, and try launching the session again from the dashboard.",
  },
  {
    category: "Troubleshooting",
    question: "Do blocked pop-ups cause connection problems?",
    answer:
      "Yes. Browser-based remote desktop access may require pop-ups or redirects to open correctly, so blocked pop-ups can prevent the session window from opening.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if my SensePC is stuck in provisioning?",
    answer:
      "Review your billing or wallet readiness, selected configuration, and account state first. If the desktop remains stuck in provisioning after a reasonable period, contact support with your desktop and account details.",
  },
  {
    category: "Troubleshooting",
    question: "Why is my SensePC still showing as provisioning?",
    answer:
      "A desktop can remain in provisioning while the system completes account checks, billing readiness, location preparation, configuration setup, and desktop environment preparation.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if my SensePC will not start?",
    answer:
      "Check your billing or wallet readiness, confirm the desktop is not still provisioning, refresh the dashboard, and verify that the selected plan and account state are valid for continued use.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if my desktop was stopped and I expected it to stay available?",
    answer:
      "Review the current billing plan, any usage limits, and whether the desktop was stopped manually, by policy, or after reaching a plan-related condition. Then check the dashboard for the current state before trying again.",
  },
  {
    category: "Troubleshooting",
    question: "Why does performance feel worse from one location than another?",
    answer:
      "Performance can vary by location because distance to the selected location, local network quality, and connection routing conditions all affect responsiveness.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if I selected the wrong location?",
    answer:
      "If performance is not meeting expectations and the selected location is far from the user, review whether a closer location would provide better responsiveness for the workload.",
  },
  {
    category: "Troubleshooting",
    question: "What should I check if my workload feels too heavy for the desktop?",
    answer:
      "Review whether the selected configuration has enough compute, memory, storage, and other resources for the applications you are using. A mismatch between workload and desktop profile is a common cause of poor performance.",
  },
  {
    category: "Troubleshooting",
    question: "Can my local Wi-Fi cause SensePC issues?",
    answer:
      "Yes. Unstable or congested Wi-Fi can reduce responsiveness, interrupt the session experience, or make remote desktop access feel inconsistent.",
  },
  {
    category: "Troubleshooting",
    question: "Can my local browser or device cause session issues?",
    answer:
      "Yes. Even though the desktop runs in the cloud, the local browser, device responsiveness, and session environment still affect the overall access experience.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if my billing or wallet setup is blocking usage?",
    answer:
      "Review your billing page, wallet balance, payment method setup, and whether auto-recharge or card status needs attention. Billing readiness can affect provisioning and continued usage.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if auto-recharge fails?",
    answer:
      "Check whether the saved card was declined by the bank, review your default payment method, and confirm that a valid card remains available for future billing activity.",
  },
  {
    category: "Troubleshooting",
    question: "Why can’t I remove my last saved card?",
    answer:
      "If auto plan renew is enabled, the last saved card must remain on file so renewal-related billing can continue correctly.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if I think I was billed incorrectly?",
    answer:
      "Open a support ticket with your account details, the charge in question, the billing plan involved, and the approximate date of the charge so the billing team can investigate.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if I think a refund should be reviewed?",
    answer:
      "Submit a support ticket with the relevant billing details. Refunds are reviewed by the billing team and are only considered in limited cases such as improper billing, a SensePC error, or infrastructure downtime caused by the cloud resource provider.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if I cannot find the answer in the knowledge base?",
    answer:
      "If the knowledge base does not resolve your issue, open a support ticket so the team can review your account, desktop state, billing context, and any related session details.",
  },
  {
    category: "Troubleshooting",
    question: "Where should I go if I still need help after reading the FAQ?",
    answer:
      "If the FAQ does not solve the issue, use the support flow to open a ticket so the team can investigate with the appropriate account, billing, and desktop details.",
  },
  {
    category: "Troubleshooting",
    question: "What information should I include when opening a support ticket?",
    answer:
      "Include your account email, desktop name, selected location, billing plan, a short description of the issue, when it happened, and any screenshots or error messages that can help the team investigate faster.",
  },
  {
    category: "Troubleshooting",
    question: "Can I attach screenshots or files to a support ticket?",
    answer:
      "Yes. The support workflow is designed to allow attachments so users can include screenshots or other relevant files when reporting an issue.",
  },
  {
    category: "Troubleshooting",
    question: "What should I check first if my session feels laggy?",
    answer:
      "Check your internet stability, confirm you selected the best location for your location, close unnecessary local browser tabs or apps, and review whether your workload needs a stronger cloud PC configuration.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if my SensePC is stuck while starting?",
    answer:
      "Refresh the dashboard, wait for the status to update, and confirm your account and billing state are valid. If the status does not change, contact support with the PC details.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if Performance Mode does not open the NICE DCV native client?",
    answer:
      "Check whether NICE DCV is installed, make sure your browser did not block the application launch, allow the launch prompt if it appears, and try Performance Mode again.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if Performance Mode fails but my browser session is still open?",
    answer:
      "That is expected fallback behavior. Keep using the browser session, verify that NICE DCV is installed, check whether the browser blocked the app launch, and try again or use the .dcv connection file if available.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if automatic Performance Mode launch is blocked?",
    answer:
      "Use the available fallback flow, including the .dcv connection file download, and open the NICE DCV native client manually.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if Performance Mode worked before but the native client later disconnected?",
    answer:
      "Return to the SensePC dashboard, reconnect to the same running SensePC in the browser, and then start Performance Mode again.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if I clicked Disconnect in the browser?",
    answer:
      "The current Disconnect action is a full session stop, not just a browser-only leave action. It ends the backend session and disconnects the browser viewer.",
  },
  {
    category: "Troubleshooting",
    question: "Can the browser Disconnect action affect another attached client?",
    answer:
      "Potentially yes. The current Disconnect flow stops the backend session, so if another DCV client is attached to the same session, that action can affect it.",
  },
  {
    category: "Troubleshooting",
    question: "Why does SensePC not disconnect the browser first during Performance Mode?",
    answer:
      "SensePC keeps the browser session alive first because disconnecting early creates a poor fallback experience if the native client is missing or the launch fails.",
  },
  {
    category: "Troubleshooting",
    question: "Does Performance Mode use a force-new-session handoff right now?",
    answer:
      "No. Although backend support exists for future force-new-session workflows, the current frontend Performance Mode handoff intentionally does not use that path during this feature.",
  },
  {
    category: "Roles & Team Management",
    question: "Can I invite team members to my SensePC workspace?",
    answer:
      "Yes. Business users can invite team members into the workspace and manage access based on the account structure and assigned role.",
  },
  {
    category: "Roles & Team Management",
    question: "What user roles are available for team accounts?",
    answer:
      "SensePC team environments support role-based access with Owner, Admin, and Member users. Each role has a different level of access and management permission.",
  },
  {
    category: "Roles & Team Management",
    question: "Can every team member create or manage SensePCs?",
    answer:
      "No. SensePC management permissions depend on the assigned user role. Owners and Admins have broader access, while Members have limited access.",
  },
  {
    category: "Roles & Team Management",
    question: "Can I assign a SensePC to a specific user?",
    answer:
      "Yes. Owners and Admins can assign a SensePC to a specific user so access is clearer and easier to manage.",
  },
  {
    category: "Roles & Team Management",
    question: "Who can access any SensePC in the account?",
    answer:
      "Owners and Admin users can access any SensePC in the account.",
  },
  {
    category: "Roles & Team Management",
    question: "Can a Member user access every SensePC in the account?",
    answer:
      "No. A Member user can access only the SensePC that has been assigned to them by an Owner or Admin.",
  },
  {
    category: "Roles & Team Management",
    question: "Can a Member user access a SensePC that is not assigned to them?",
    answer:
      "No. Member users can use only the SensePC assigned to them.",
  },
  {
    category: "Roles & Team Management",
    question: "Who can assign a SensePC to a user?",
    answer:
      "Only the Account Owner or an Admin user can assign a SensePC to a user.",
  },
  {
    category: "Roles & Team Management",
    question: "Who can deassign a SensePC from a user?",
    answer:
      "Only the Account Owner or an Admin user can deassign a SensePC from a user.",
  },
  {
    category: "Roles & Team Management",
    question: "Can a Member user assign a SensePC to themselves or someone else?",
    answer:
      "No. Member users do not have permission to assign SensePCs.",
  },
  {
    category: "Roles & Team Management",
    question: "Can a Member user deassign a SensePC?",
    answer:
      "No. Member users do not have permission to deassign SensePCs.",
  },
  {
    category: "Roles & Team Management",
    question: "Can a Member user create a SensePC?",
    answer:
      "No. Member users do not have permission to create SensePCs.",
  },
  {
    category: "Roles & Team Management",
    question: "Can a Member user delete a SensePC?",
    answer:
      "No. Member users do not have permission to delete SensePCs.",
  },
  {
    category: "Roles & Team Management",
    question: "What can a Member user do in SensePC?",
    answer:
      "A Member user can use only the SensePC assigned to them. They do not have permission to create, assign, deassign, or delete SensePCs.",
  },
  {
    category: "Roles & Team Management",
    question: "Do Owners and Admins have the same SensePC access scope?",
    answer:
      "For SensePC access and assignment management, both Owners and Admin users can access any SensePC in the account and manage assignments.",
  },
  {
    category: "Roles & Team Management",
    question: "Can an Admin user access a SensePC assigned to another user?",
    answer:
      "Yes. Admin users can access any SensePC in the account, including SensePCs assigned to other users.",
  },
  {
    category: "Roles & Team Management",
    question: "Can the Account Owner access a SensePC assigned to another user?",
    answer:
      "Yes. The Account Owner can access any SensePC in the account, including SensePCs assigned to other users.",
  },
  {
    category: "Roles & Team Management",
    question: "Can a Member user manage SensePC assignments?",
    answer:
      "No. SensePC assignment management is limited to the Account Owner and Admin users.",
  },
  {
    category: "Roles & Team Management",
    question: "Who should use the Member role?",
    answer:
      "The Member role is best for users who only need access to an assigned SensePC and do not need management permissions such as creating, assigning, deassigning, or deleting desktops.",
  },
  {
    category: "Roles & Team Management",
    question: "Who should use the Admin role?",
    answer:
      "The Admin role is best for trusted users who need broader workspace access and management capabilities, including access to any SensePC and assignment control.",
  },
  {
    category: "Roles & Team Management",
    question: "Who should be the Account Owner?",
    answer:
      "The Account Owner should be the primary workspace owner responsible for overall account control and full SensePC access across the account.",
  },
  {
    category: "Roles & Team Management",
    question: "Can SensePC be used for remote teams?",
    answer:
      "Yes. SensePC is well suited for remote teams that want more consistent cloud desktop access without depending on identical local hardware across every user.",
  },
  {
    category: "Roles & Team Management",
    question: "Can I invite other users into a business setup?",
    answer:
      "Yes. Business workspaces support inviting users and assigning roles based on the account structure, billing setup, and rollout plan.",
  },
  {
    category: "Roles & Team Management",
    question: "Is SensePC suitable for onboarding new hires?",
    answer:
      "Yes. SensePC can help teams onboard new hires faster by giving them access to a more repeatable cloud desktop environment instead of preparing every local workstation separately.",
  },
  {
    category: "Roles & Team Management",
    question: "Can teams manage access by role?",
    answer:
      "Yes. SensePC supports role-based access so organizations can manage who owns the workspace, who has administrative control, and how users are assigned to desktops.",
  },
  {
    category: "Roles & Team Management",
    question: "Can teams standardize desktop access with SensePC?",
    answer:
      "Yes. SensePC helps teams create a more standardized desktop experience across users even when the team does not use identical local hardware.",
  },
  {
    category: "Roles & Team Management",
    question: "Can a business manage desktops and billing from one account?",
    answer:
      "Yes. SensePC supports centralized business workflows for user access, desktop assignment, wallet funding, and billing visibility from the broader account experience.",
  },
  {
    category: "Support",
    question: "How do I get support if I have a problem?",
    answer:
      "If you need help with a SensePC issue, sign in to your account and use the support feature to open a support ticket. The support feature is available to signed-in users.",
  },
  {
    category: "Support",
    question: "Do I need an account to use SensePC support?",
    answer:
      "Yes. You need to sign up and sign in to use the support feature and open a support ticket.",
  },
  {
    category: "Support",
    question: "Is the Contact page the same as the Support feature?",
    answer:
      "No. The Contact page is public, but the support feature is available only to signed-in users.",
  },
  {
    category: "Support",
    question: "When should I use the Support feature instead of the Contact page?",
    answer:
      "Use the Support feature when you need help with a SensePC account, desktop, billing, provisioning, access, or connection issue. The Contact page is public, but the support feature is designed for signed-in users who need account-specific help.",
  },
  {
    category: "Support",
    question: "What details should I include when contacting support?",
    answer:
      "Include the SensePC name, account email, location, billing plan, a short description of the issue, when it happened, and any screenshots or error messages. This helps the support team investigate faster.",
  },
  {
    category: "Support",
    question: "Can I contact support for billing issues?",
    answer:
      "Yes. Signed-in users can use the support feature for billing-related issues, including charge reviews, payment concerns, and refund requests that need billing team investigation.",
  },
  {
    category: "Support",
    question: "Can I contact support for access or connection problems?",
    answer:
      "Yes. If you cannot access your SensePC, cannot open the remote desktop session, or see unexpected connection issues, sign in and open a support ticket with the relevant details.",
  },
  {
    category: "Support",
    question: "Can I attach screenshots or files to a support ticket?",
    answer:
      "Yes. The support workflow supports attachments, so signed-in users can include screenshots or other relevant files to help explain the issue.",
  },
  {
    category: "Support",
    question: "Can I review my support ticket history later?",
    answer:
      "Yes. The support experience is ticket-based, so signed-in users can review their ticket history and related replies.",
  },
  {
    category: "Support",
    question: "Will I see replies from the support team in the platform?",
    answer:
      "Yes. Support replies are handled through the ticket-based support experience, and signed-in users can review updates there.",
  },
  {
    category: "Support",
    question: "What issues should I report through support?",
    answer:
      "Use support for issues such as desktop access problems, billing concerns, refund review requests, provisioning delays, connection issues, and other account-related problems that need investigation.",
  },
  {
    category: "Support",
    question: "What is the fastest way to help support investigate my issue?",
    answer:
      "Provide the SensePC name, account email, location, billing plan, time of the issue, a clear description of what happened, and any screenshots or error messages you have.",
  },
];
