"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  cpuCategories,
  cpuOptions,
  locationOptions,
  osOptions,
  storageOptions,
} from "@/app/build-smartpc/data";
import {
  useGetEstimateMutation,
  useListRemoteDesktopQuery,
} from "@/api/fileManagerAPI";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import { useToast } from "@/hooks/use-toast";
import {
  baseFormSchema,
  BaseFormValues,
  formSchema,
  FormValues,
} from "@/app/build-smartpc/schema";
import { setSmartPcConfig } from "@/redux/slices/build-pc/smart-pc-config-slice";
import { Field, Form } from "@/components/shared/hook-form";

const CostCalculator = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const [getEstimate, { data: estimateData, isLoading }] =
    useGetEstimateMutation();

  const methods = useForm<FormValues>({
    resolver: zodResolver(baseFormSchema),
    defaultValues: {
      operatingSystem: "",
      cpu: "",
      storage: "",
      region: "",
      linuxCategory: "Ubuntu_24.04_LTS_X64",
    },
  });

  const {
    setValue,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = methods;

  const values = watch();

  const onSubmit = async (data: BaseFormValues) => {
    console.log("Submitted Config:", data);

    dispatch(
      setSmartPcConfig({
        operatingSystem: data.operatingSystem,
        cpu: data.cpu,
        region: data.region,
        storage: data.storage,
        show: true,
      })
    );

    if (!isAuthenticated) {
      router.push("/auth/sign-in");
      return;
    }
    router.push(routes.dashboard);
  };

  const handleGetEstimate = async () => {
    const configId = watch("cpu");
    const storageSize = watch("storage");
    const region = watch("region");

    if (!configId || !storageSize || !region) return;

    try {
      const result = await getEstimate({
        configId,
        storageSize,
        region,
      }).unwrap();
      console.log("Estimated result:", result);
    } catch (err) {
      console.error("Error fetching estimate:", err);
    }
  };

  const selectedOS = watch("operatingSystem");
  const selectedLinuxCategory = watch("linuxCategory");

  const isLinuxOS = selectedOS === "Linux";
  const linuxCategoryCpuOptions =
    cpuCategories.Linux[`${selectedLinuxCategory}`] || [];

  const cpuOptionsForOS = isLinuxOS
    ? linuxCategoryCpuOptions
    : cpuOptions[selectedOS] || [];

  useEffect(() => {
    setValue("cpu", "");
  }, [selectedOS, selectedLinuxCategory, setValue]);

  const selectedOSOption = osOptions.find(
    (opt) => opt.value === values.operatingSystem
  );

  const selectedLocation = locationOptions.find(
    (opt) => opt.value === values.region
  );

  const selectedStorage = storageOptions.find(
    (opt) => opt.value === values.storage
  );

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <section className="py-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center bg-primary/10 dark:bg-primary/20 rounded-full mb-4 px-4 py-1.5"
            >
              <span className="text-sm font-medium text-primary">
                Cost Calculator
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-3xl font-bold mb-4"
            >
              Check Your <span className="gradient-text">Sense PC Cost</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground"
            >
              Configure your perfect Sense PC and get instant pricing
            </motion.p>
          </div>
          {/* Sticky & Animated Sense PC Pricing Models */}
          <div className="sticky top-0 z-20 bg-white/90 dark:bg-background/80 backdrop-blur-md border-b border-border/20">
            <div className="max-w-5xl mx-auto px-4">
              <div className="overflow-x-auto hide-scrollbar py-3">
                <div className="flex gap-4">
                  {[
                    {
                      label: "Hourly Plan",
                      emoji: "⏱",
                      color: "text-primary",
                      description:
                        "Pay-as-you-go. Billed per hour. SSD billed continuously.",
                      tag: "Default",
                    },
                    {
                      label: "Daily Plan",
                      emoji: "📅",
                      color: "text-blue-600",
                      description:
                        "Flat daily rate. Billed every 24 hrs regardless of usage.",
                    },
                    {
                      label: "Monthly Plan",
                      emoji: "📆",
                      color: "text-emerald-600",
                      description:
                        "Fixed fee. Auto-renews. Great for always-on PCs.",
                    },
                    {
                      label: "SmartStorage",
                      emoji: "💾",
                      color: "text-orange-500",
                      description:
                        "First 20GB free. Charges by peak usage tier monthly.",
                    },
                    {
                      label: "Billing Units",
                      emoji: "💳",
                      color: "text-gray-700 dark:text-gray-200",
                      description:
                        "Costs deducted from wallet at each billing cycle.",
                    },
                  ].map((plan, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="min-w-[220px] flex-shrink-0 rounded-xl border border-border bg-white/80 dark:bg-background/50 backdrop-blur-md p-4 shadow-sm hover:shadow-md transition"
                    >
                      <div>
                        <h4
                          className={`text-sm font-semibold flex items-center gap-1 mb-1 ${plan.color}`}
                        >
                          {plan.emoji} {plan.label}
                          {plan.tag && (
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-1">
                              {plan.tag}
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-snug">
                          {plan.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Configuration Options */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="space-y-8"
              >
                <div className="glass-card p-6 rounded-xl space-y-6 dark:bg-gray-900/30 dark:border-gray-800/30">
                  <h3 className="text-xl font-semibold mb-2">
                    Choose Configurations
                  </h3>

                  {/* Operating System */}
                  <Field.Select
                    name="operatingSystem"
                    label="Operating System"
                    description="Choose your preferred operating system"
                    tooltipText={
                      selectedOSOption
                        ? `Selected: ${selectedOSOption.label}`
                        : "No operating system selected"
                    }
                    options={osOptions}
                    placeholder="Select Operating System"
                    className="gap-4"
                  />

                  {/* Linux Category */}
                  {isLinuxOS && (
                    <Field.Select
                      name="linuxCategory"
                      label="Category"
                      description="Select Linux category"
                      {...(values.linuxCategory
                        ? { tooltipText: values.linuxCategory }
                        : {})}
                      options={Object.keys(cpuCategories.Linux)}
                      className="gap-4"
                    />
                  )}

                  {/* CPU */}
                  <Field.Select
                    name="cpu"
                    label="CPU & Memory"
                    description="Select processing power and memory"
                    {...(values.cpu ? { tooltipText: values.cpu } : {})}
                    options={cpuOptionsForOS}
                    placeholder={
                      selectedOS ? "Select CPU & Memory" : "Select OS first"
                    }
                    className="gap-4"
                  />

                  {/* Location */}
                  <Field.Select
                    name="region"
                    label="Region"
                    description="Pick your server Region"
                    tooltipText={
                      selectedLocation
                        ? selectedLocation.label
                        : "No location selected"
                    }
                    options={locationOptions}
                    className="gap-4"
                  />

                  {/* Storage */}
                  <Field.Select
                    name="storage"
                    label="Storage"
                    description="Choose storage capacity"
                    tooltipText={
                      selectedStorage
                        ? `${selectedStorage.label} selected`
                        : "No storage selected"
                    }
                    options={storageOptions}
                    className="gap-4"
                  />

                  {/* Note about pricing */}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      * All prices are in USD and billed by the hour. Monthly
                      estimates are based on 24/7 usage.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Configuration Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="lg:sticky lg:top-24 space-y-6"
              >
                <div className="glass-card p-6 rounded-xl dark:bg-gray-900/30 dark:border-gray-800/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold">
                      Your Configuration
                    </h3>
                  </div>

                  <div className="grid gap-2 mb-3">
                    {/* OS */}
                    <div className="rounded-lg border bg-card dark:bg-gray-800/50 p-2.5 transition-colors hover:bg-accent/5 dark:hover:bg-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Operating System
                          </div>
                          <div className="font-medium text-sm mt-0.5">
                            {osOptions.find(
                              (os) => os.value === watch("operatingSystem")
                            )?.label || (
                              <span className="text-muted-foreground">
                                Not selected
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CPU */}
                    <div className="rounded-lg border bg-card dark:bg-gray-800/50 p-2.5 transition-colors hover:bg-accent/5 dark:hover:bg-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            CPU & Memory
                          </div>
                          <div className="font-medium text-sm mt-0.5">
                            {cpuOptions[watch("operatingSystem")]?.find(
                              (cpu) => cpu.value === watch("cpu")
                            )?.label || (
                              <span className="text-muted-foreground">
                                Not selected
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Region */}
                    <div className="rounded-lg border bg-card dark:bg-gray-800/50 p-2.5 transition-colors hover:bg-accent/5 dark:hover:bg-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Region
                          </div>
                          <div className="font-medium text-sm mt-0.5">
                            {locationOptions.find(
                              (loc) => loc.value === watch("region")
                            )?.label || (
                              <span className="text-muted-foreground">
                                Not selected
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Storage */}
                    <div className="rounded-lg border bg-card dark:bg-gray-800/50 p-2.5 transition-colors hover:bg-accent/5 dark:hover:bg-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Storage
                          </div>
                          <div className="font-medium text-sm mt-0.5">
                            {storageOptions.find(
                              (s) => s.value === watch("storage")
                            )?.label || (
                              <span className="text-muted-foreground">
                                Not selected
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Cost */}
                  {/* Total Cost */}
                  <div className="rounded-lg border bg-primary/5 dark:bg-primary/10 p-2.5 mb-3">
                    <div className="flex items-center justify-between space-x-6 py-3 ">
                      <div className="flex-1 text-center">
                        <div className="text-xs text-muted-foreground">
                          Est. Monthly*
                        </div>
                        <div className="text-sm font-medium mt-1">
                          {estimateData?.total?.pricePerMonth !== undefined
                            ? `$${estimateData?.total?.pricePerMonth}/month`
                            : "-"}
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-xs text-muted-foreground">
                          Est. Daily*
                        </div>
                        <div className="text-sm font-medium mt-1">
                          {estimateData?.total?.pricePerDay !== undefined
                            ? `$${estimateData?.total.pricePerDay}/day`
                            : "-"}
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-xs text-muted-foreground">
                          Est. Hourly*
                        </div>
                        <div className="text-sm font-medium mt-1">
                          {estimateData?.total?.pricePerHour !== undefined
                            ? `$${estimateData?.total.pricePerHour}/hr`
                            : "-"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mb-3">
                    <Button
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90"
                      disabled={
                        !watch("operatingSystem") ||
                        !watch("cpu") ||
                        !watch("region") ||
                        !watch("storage") ||
                        isLoading
                      }
                      onClick={handleGetEstimate}
                    >
                      {isLoading ? "Calculating..." : "View Estimate"}
                    </Button>
                    <Button className="flex-1" type="submit">
                      Build PC <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </div>

                  {/* Included Features */}
                  <div className="border-t pt-2">
                    <h4 className="text-xs font-medium mb-1.5">
                      Included with every plan:
                    </h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        "Free data transfer",
                        "Automated backups",
                        "99.9% uptime SLA",
                        "24/7 support",
                        "Security monitoring",
                      ].map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center text-xs text-muted-foreground"
                        >
                          <Check className="h-2.5 w-2.5 mr-1 text-primary" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile Included Features */}
                <div className="glass-card p-6 rounded-xl lg:hidden dark:bg-gray-900/30 dark:border-gray-800/30">
                  <h4 className="font-medium mb-3">
                    Included with every plan:
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Free data transfer",
                      "Automated backups",
                      "99.9% uptime SLA",
                      "24/7 technical support",
                      "Security monitoring",
                    ].map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 mr-2 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Form>
  );
};

export default CostCalculator;
