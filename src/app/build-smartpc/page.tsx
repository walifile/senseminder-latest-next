"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cpu, HardDrive, MonitorPlay, Globe } from "lucide-react";
import Navbar from "@/components/shared/layout/navbar";
import { routes } from "@/constants/routes";
import { useForm, useWatch } from "react-hook-form";
import {
  useGetEstimateMutation,
  useListRemoteDesktopQuery,
} from "@/api/fileManagerAPI";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateVMMutation } from "@/api/vmManagement";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { formSchema, FormValues } from "./schema";
import {
  cpuCategories,
  cpuOptions,
  locationOptions,
  osOptions,
  storageOptions,
} from "./data";
import { Field } from "@/components/shared/hook-form";

export default function BuildSmartPCPage() {
  const router = useRouter();
  const { toast } = useToast();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [getEstimate, { data, isLoading, error }] = useGetEstimateMutation();
  const { refetch: refetchRemoteDesktops } = useListRemoteDesktopQuery({
    userId,
  });
  const [createVM, { isLoading: isCreating }] = useCreateVMMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      pcName: "",
      operatingSystem: osOptions[0].value,
      cpu: cpuOptions[osOptions[0].value][0].value,
      storage: storageOptions[0].value,
      region: locationOptions[0].value,
      billingPlan: "hourly",
      linuxCategory: "Ubuntu_24.04_LTS_X64",
    },
  });

  const { control } = form;

  const selectedCpu = useWatch({ control: form.control, name: "cpu" });
  const selectedStorage = useWatch({ control: form.control, name: "storage" });
  const selectedRegion = useWatch({ control: form.control, name: "region" });
  const selectedOS = useWatch({
    control: form.control,
    name: "operatingSystem",
  });
  const selectedLinuxCategory = useWatch({
    control: form.control,
    name: "linuxCategory",
  });

  const isLinuxOS = selectedOS === "Linux";
  const linuxCategoryCpuOptions =
    cpuCategories.Linux[`${selectedLinuxCategory}`] || [];

  const cpuOptionsForOS = isLinuxOS
    ? linuxCategoryCpuOptions
    : cpuOptions[selectedOS] || [];

  useEffect(() => {
    if (isLinuxOS && selectedLinuxCategory) {
      form.setValue("cpu", linuxCategoryCpuOptions[0].value);
    }
  }, [isLinuxOS, selectedLinuxCategory, linuxCategoryCpuOptions, form]);

  useEffect(() => {
    if (cpuOptions[selectedOS] && cpuOptions[selectedOS].length > 0) {
      form.setValue("cpu", cpuOptions[selectedOS][0].value);
      form.setValue("linuxCategory", "Ubuntu_24.04_LTS_X64");
    }
  }, [selectedOS, form]);

  useEffect(() => {
    const fetchAutoEstimate = async () => {
      if (!selectedCpu || !selectedStorage || !selectedRegion) return;

      try {
        await getEstimate({
          configId: selectedCpu,
          storageSize: selectedStorage,
          region: selectedRegion,
        }).unwrap();
      } catch (error) {
        console.error("Auto estimate error:", error);
      }
    };

    fetchAutoEstimate();
  }, [selectedCpu, selectedStorage, selectedRegion]);

  const handleEstimate = async () => {
    const isValid = await form.trigger();

    if (!isValid) return;
    const values = form.getValues();
    try {
      await getEstimate({
        configId: values.cpu,
        storageSize: values.storage,
        region: values.region,
      }).unwrap();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch estimate",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create your Sense PC.",
        variant: "destructive",
      });
      router.push(routes.signIn);
      return;
    }
    try {
      await createVM({
        action: "create",
        configId: data.cpu,
        systemName: data.pcName,
        region: data.region || "us-east-1",
        storageSize: parseInt(data.storage, 10),
        billingPlan: data.billingPlan,
      }).unwrap();
      while (true) {
        const fetchResult = await refetchRemoteDesktops();
        if (fetchResult.status === "fulfilled") break;
        await new Promise((res) => setTimeout(res, 2000));
      }
      form.reset();
      router.push(routes.dashboard);
    } catch (err) {
      toast({
        title: "Failed to Create Sense PC",
        description:
          (err as { data?: { message?: string } })?.data?.message ??
          "Something went wrong. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A1B]">
      <Navbar />
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold mb-4"
              >
                Build Your <span className="gradient-text">Sense PC</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-muted-foreground"
              >
                Configure your perfect Sense PC in minutes
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid gap-8"
            >
              <Form {...form} control={control}>
                <form
                  className="grid gap-8"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>
                        Name your Sense PC and choose an operating system
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="pcName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PC Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter PC name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Field.Select
                        name="operatingSystem"
                        label="Operating System"
                        options={osOptions}
                        icon={MonitorPlay}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Hardware Configuration</CardTitle>
                      <CardDescription>
                        Choose your computing resources
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isLinuxOS && (
                        <Field.Select
                          name="linuxCategory"
                          label="Category"
                          options={Object.keys(cpuCategories.Linux)}
                        />
                      )}

                      <Field.Select
                        name="cpu"
                        label="CPU"
                        options={cpuOptionsForOS}
                        icon={Cpu}
                      />

                      <Field.Select
                        name="storage"
                        label="Storage"
                        options={storageOptions.map((opt) => ({
                          value: opt.value,
                          label: `${opt.label} ${
                            opt.pricePerHour ? `($${opt.pricePerHour}/hr)` : ""
                          }`,
                        }))}
                        icon={HardDrive}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Field.Select
                        name="region"
                        label="Region"
                        options={locationOptions}
                        icon={Globe}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Billing Plan</CardTitle>
                      <CardDescription>
                        Select how you want to be billed
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Field.Select
                        name="billingPlan"
                        label="Billing Plan"
                        placeholder="Choose billing plan"
                        options={[
                          {
                            value: "hourly",
                            label: `Hourly ${
                              isLoading
                                ? "(...)"
                                : data?.total?.pricePerHour !== undefined
                                ? `(est. $${data.total.pricePerHour.toFixed(
                                    3
                                  )})`
                                : ""
                            }`,
                          },
                          {
                            value: "daily",
                            label: `Daily ${
                              isLoading
                                ? "(...)"
                                : data?.total?.pricePerDay !== undefined
                                ? `(est. $${data.total.pricePerDay.toFixed(2)})`
                                : ""
                            }`,
                          },
                          {
                            value: "monthly",
                            label: `Monthly ${
                              isLoading
                                ? "(...)"
                                : data?.total?.pricePerMonth !== undefined
                                ? `(est. $${data.total.pricePerMonth.toFixed(
                                    2
                                  )})`
                                : ""
                            }`,
                          },
                        ]}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      {/* <CardTitle>Cost Summary</CardTitle>
                      <CardDescription>
                        Estimated costs for your Sense PC
                      </CardDescription> */}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* <div className="flex justify-between">
                        <span className="font-medium">Hourly Cost</span>
                        <span className="text-2xl font-bold">
                          ${data ? `${data.hourlyCost}/hour` : "0/hour"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Monthly Estimate</span>
                        <span>
                          $
                          {data
                            ? (data.hourlyCost * 24 * 30).toFixed(2)
                            : "0.00"}
                          /month
                        </span>
                      </div> */}

                      {/* <Button
                        type="button"
                        onClick={handleEstimate}
                        disabled={isLoading || isCreating}
                        className="w-full"
                      >
                        {isLoading ? "Estimating..." : "Get Estimate"}
                      </Button> */}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isCreating || isLoading}
                      >
                        Create Sense PC
                      </Button>
                      {error && (
                        <p className="text-red-500 text-sm">
                          Error getting estimate.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
