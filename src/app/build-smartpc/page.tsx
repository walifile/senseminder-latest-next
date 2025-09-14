"use client";

import type { RootState } from "@/redux/store";

import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import React, { useMemo, useEffect } from "react";
import { useCreateVMMutation } from "@/api/vmManagement";
import {
  useGetEstimateMutation,
  useListRemoteDesktopQuery,
} from "@/api/fileManagerAPI";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { useSelector } from "react-redux";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { motion } from "framer-motion";
import { Cpu, Globe, HardDrive, MonitorPlay } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { Field } from "@/components/shared/hook-form";
import Navbar from "@/components/shared/layout/navbar";

import { formSchema } from "./schema";
import { fetchEstimate } from "./api/fetch-estimate";
import {
  osOptions,
  cpuOptions,
  cpuCategories,
  storageOptions,
  locationOptions,
} from "./data";

import type { FormValues } from "./schema";

export default function BuildSmartPCPage() {
  const router = useRouter();
  const { toast } = useToast();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const config = useSelector((state: RootState) => state.smartPcConfig);

  const [getEstimate, { data, isLoading, error }] = useGetEstimateMutation();
  const { refetch: refetchRemoteDesktops } = useListRemoteDesktopQuery({
    userId,
  });
  const [createVM, { isLoading: isCreating }] = useCreateVMMutation();

  const defaultValues: Partial<FormValues> = useMemo(
    () => ({
      pcName: "",
      operatingSystem: config.operatingSystem || osOptions[0].value || "",
      cpu: config.cpu || cpuOptions[osOptions[0].value][0].value || "",
      storage: config.storage || storageOptions[0].value || "",
      region: config.region || locationOptions[0].value || "",
      billingPlan: "hourly",
      linuxCategory: "",
    }),
    [config]
  );

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues,
  });

  const { control, reset, watch, setValue, handleSubmit } = methods;

  const values = watch();

  const {
    operatingSystem: selectedOS,
    linuxCategory: selectedLinuxCategory,
    cpu,
    region,
    storage,
  } = values;

  const isLinuxOS = selectedOS === "Linux";
  const linuxCategoryCpuOptions =
    cpuCategories.Linux[`${selectedLinuxCategory}`] || [];

  const cpuOptionsForOS = isLinuxOS
    ? linuxCategoryCpuOptions
    : cpuOptions[selectedOS] || [];

  useEffect(() => {
    if (selectedOS) {
      if (isLinuxOS) {
        setValue("linuxCategory", "Ubuntu_24.04_LTS_X64", {
          shouldValidate: true,
        });
      }
      setValue("cpu", cpuOptions[selectedOS][0].value, {
        shouldValidate: true,
      });
    }
  }, [selectedOS, isLinuxOS, setValue]);

  // estimate
  useEffect(() => {
    fetchEstimate({
      methods,
      getEstimate,
      toast,
      showError: false,
    });
  }, [cpu, storage, region]);

  // onSubmit
  // const handleEstimate = async () =>
  //   await fetchEstimate({
  //     methods,
  //     getEstimate,
  //     toast,
  //     showError: true,
  //   });

  const onSubmit = handleSubmit(async (data: FormValues) => {
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
      reset();
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
  });

  const getPlanLabel = (plan: "hourly" | "daily" | "monthly") => {
    if (isLoading) return "(...)";

    const planKey =
      plan === "hourly"
        ? "pricePerHour"
        : plan === "daily"
        ? "pricePerDay"
        : "pricePerMonth";

    const decimals = plan === "hourly" ? 3 : 2;
    const price = data?.total?.[planKey];

    return price != null ? `(est. $${price.toFixed(decimals)})` : "";
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
              <Form {...methods} control={control}>
                <form className="grid gap-8" onSubmit={onSubmit}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>
                        Name your Sense PC and choose an operating system
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={control}
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
                            label: `Hourly ${getPlanLabel("hourly")}`,
                          },
                          {
                            value: "daily",
                            label: `Daily ${getPlanLabel("daily")}`,
                          },
                          {
                            value: "monthly",
                            label: `Monthly ${getPlanLabel("monthly")}`,
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
