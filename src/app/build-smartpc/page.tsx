"use client";

import React from "react";
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
import { useForm } from "react-hook-form";
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
import { cpuOptions, locationOptions, osOptions, storageOptions } from "./data";

export default function BuildSmartPCPage() {
  const router = useRouter();
  const { toast } = useToast();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [getEstimate, { data, isLoading, error }] = useGetEstimateMutation();
  const { refetch: refetchRemoteDesktops } = useListRemoteDesktopQuery({
    userId,
  });

  const [
    createVM,
    {
      isLoading: isCreating,
      // isError: hasError,
      // error: apiError,
      // isSuccess: isCreated,
    },
  ] = useCreateVMMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      pcName: "",
      operatingSystem: osOptions[0].value,
      cpu: cpuOptions[0].value,
      storage: storageOptions[0].value,
      region: locationOptions[0].value,
    },
  });

  const handleEstimate = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();

    try {
      await getEstimate({
        operatingSystem: values.operatingSystem,
        machineType: values.cpu,
        region: values.region,
        storageSize: values.storage,
      }).unwrap();
    } catch (err) {
      console.error("Estimate error:", err);
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
        description: "Please sign in to create your SmartPC.",
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
      }).unwrap();

      while (true) {
        const fetchResult = await refetchRemoteDesktops();
        if (fetchResult.status === "fulfilled") break;
        await new Promise((res) => setTimeout(res, 2000));
      }

      form.reset();
      router.push(routes?.dashboard);
    } catch (err) {
      console.error("Failed to create VM:", err);
      toast({
        title: "Failed to Create SmartPC",
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
            {/* Header */}
            <div className="text-center mb-12">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold mb-4"
              >
                Build Your <span className="gradient-text">SmartPC</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-muted-foreground"
              >
                Configure your perfect smart PC in minutes
              </motion.p>
            </div>

            {/* Configuration Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid gap-8"
            >
              <Form {...form}>
                <form
                  className="grid gap-8"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  {/* Basic Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>
                        Name your SmartPC and choose an operating system
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
                      <FormField
                        control={form.control}
                        name="operatingSystem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Operating System</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {osOptions.map((os) => (
                                  <SelectItem key={os.value} value={os.value}>
                                    <div className="flex items-center gap-2">
                                      <MonitorPlay className="h-4 w-4 mr-2" />
                                      {os.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Hardware Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Hardware Configuration</CardTitle>
                      <CardDescription>
                        Choose your computing resources
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          name: "cpu",
                          label: "CPU",
                          options: cpuOptions,
                          icon: Cpu,
                        },
                        // {
                        //   name: "memory",
                        //   label: "Memory",
                        //   options: memoryOptions,
                        //   icon: MemoryStick,
                        // },
                        {
                          name: "storage",
                          label: "Storage",
                          options: storageOptions,
                          icon: HardDrive,
                        },
                      ].map(({ name, label, options, icon: Icon }) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name as keyof FormValues}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{label}</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {options.map((opt) => (
                                    <SelectItem
                                      key={opt.value}
                                      value={opt.value}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4 mr-2" />
                                        {opt.label}{" "}
                                        {opt.pricePerHour
                                          ? `($${opt.pricePerHour}/hr)`
                                          : ""}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </CardContent>
                  </Card>

                  {/* Location */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {locationOptions.map((region) => (
                                  <SelectItem
                                    key={region.value}
                                    value={region.value}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Globe className="h-4 w-4 mr-2" />
                                      {region.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Cost Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Summary</CardTitle>
                      <CardDescription>
                        Estimated costs for your SmartPC
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
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
                      </div>

                      <Button
                        type="button"
                        onClick={handleEstimate}
                        disabled={isLoading || isCreating}
                        className="w-full"
                      >
                        {isLoading ? "Estimating..." : "Get Estimate"}
                      </Button>
                      <Button
                        type="submit"
                        variant="secondary"
                        className="w-full"
                        disabled={isCreating || isLoading}
                      >
                        Create SmartPC
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
