// import React, { useEffect, useState } from "react";
// import { useForm, Controller, useWatch } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Button } from "@/components/ui/button";
// import { AlertCircle } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { cn } from "@/lib/utils";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { formSchema, FormValues } from "../schema";
// import {
//   cpuOptions,
//   locationOptions,
//   osOptions,
//   storageOptions,
// } from "../data";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "@/redux/store";
// import {
//   useGetEstimateMutation,
//   useListRemoteDesktopQuery,
// } from "@/api/fileManagerAPI";
// import { useCreateVMMutation } from "@/api/vmManagement";
// import { clearSmartPcConfig } from "@/redux/slices/build-pc/smart-pc-config-slice";

// import { getPaymentMethods } from "@/api/billing";
// import { useRouter } from "next/navigation";
// import { useState } from "react"; // If not already imported

// const SmartPCConfigDialog = ({
//   showNewPCDialog,
//   setShowNewPCDialog,
// }: {
//   showNewPCDialog: boolean;
//   setShowNewPCDialog: (value: boolean) => void;
// }) => {
//   const dispatch = useDispatch();
//   const { toast } = useToast();
//   const router = useRouter();
//   const [showBillingWarning, setShowBillingWarning] = useState(false);

//   const userId = useSelector((state: RootState) => state.auth.user?.id);
//   const config = useSelector((state: RootState) => state.smartPcConfig);

//   const [getEstimate, { data, isLoading }] = useGetEstimateMutation();
//   const { refetch: refetchRemoteDesktops } = useListRemoteDesktopQuery({
//     userId,
//   });
//   const [createVM, { isLoading: isCreating }] = useCreateVMMutation();

//   const {
//     control,
//     handleSubmit,
//     reset,
//     trigger,
//     getValues,
//     setValue,
//     formState: { errors },
//   } = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     mode: "onChange",
//     defaultValues: {
//       pcName: "",
//       operatingSystem: config.operatingSystem || osOptions[0].value,
//       cpu: config.cpu || cpuOptions[config.operatingSystem]?.[0]?.value || "",
//       storage: config.storage || storageOptions[0].value,
//       region: config.region || locationOptions[0].value,
//       billingPlan: "hourly",
//     },
//   });

//   const selectedOS = useWatch({ control, name: "operatingSystem" });
//   const cpuOptionsForOS = cpuOptions[selectedOS] || [];
//   useEffect(() => {
//     const currentCpu = getValues("cpu");
//     const defaultCpu = cpuOptions[selectedOS]?.[0]?.value;

//     if (!currentCpu && defaultCpu) {
//       setValue("cpu", defaultCpu);
//     }
//   }, [selectedOS, cpuOptions, getValues, setValue]);

//   const billingPlan = useWatch({ control, name: "billingPlan" });
// const cpu = useWatch({ control, name: "cpu" });
// const region = useWatch({ control, name: "region" });
// const storage = useWatch({ control, name: "storage" });
// const [showConfirmation, setShowConfirmation] = useState(false);
// const [deleteConfirmed, setDeleteConfirmed] = useState(false);
// const [confirmationAccepted, setConfirmationAccepted] = useState(false);

// const getFormattedTotalPrice = () => {
//   if (isLoading || !data?.total) return "...";

//   const price =
//     billingPlan === "hourly"
//       ? data.total.pricePerHour?.toFixed(3)
//       : billingPlan === "daily"
//       ? data.total.pricePerDay?.toFixed(2)
//       : data.total.pricePerMonth?.toFixed(2);

//   const suffix =
//     billingPlan === "hourly"
//       ? "/hour"
//       : billingPlan === "daily"
//       ? "/day"
//       : "/month";

//   return `$${price} ${suffix}`;
// };

// useEffect(() => {
//   if (!cpu || !storage || !region) return;

//   const timeout = setTimeout(() => {
//     getEstimate({
//       configId: cpu,
//       storageSize: storage,
//       region,
//     }).unwrap().catch((err) => {
//       console.error("Auto estimate error:", err);
//     });
//   }, 300); // Debounce slightly to avoid rapid re-renders

//   return () => clearTimeout(timeout);
// }, [cpu, storage, region, billingPlan]);

// // useEffect(() => {
// //   if (data) {
// //     console.log("🧪 Estimate API response:", data);
// //   }
// // }, [data]);

//   // useEffect(() => {
//   //   if (cpuOptionsForOS.length > 0) {
//   //     setValue("cpu", cpuOptionsForOS[0].value);
//   //   }
//   // }, [selectedOS]);

//   useEffect(() => {
//     if (config.cpu && cpuOptionsForOS.some((cpu) => cpu.value === config.cpu)) {
//       setValue("cpu", config.cpu);
//     } else if (cpuOptionsForOS.length > 0) {
//       setValue("cpu", cpuOptionsForOS[0].value);
//     }
//   }, [config.cpu, cpuOptionsForOS, setValue]);

//   useEffect(() => {
//     const fetchInitialEstimate = async () => {
//       const values = getValues();

//       if (!values.cpu || !values.storage || !values.region) return;

//       console.log({ values });
//       try {
//         await getEstimate({
//           configId: values.cpu,
//           storageSize: values.storage,
//           region: values.region,
//         }).unwrap();
//       } catch (error) {
//         console.error("Initial estimate error:", error);
//       }
//     };

//     fetchInitialEstimate();
//   }, [config.cpu, cpuOptionsForOS, setValue]);

//   const handleEstimate = async () => {
//     const isValid = await trigger();
//     if (!isValid) return;

//     const values = getValues();

//     try {
//       await getEstimate({
//         configId: values.cpu,
//         storageSize: values.storage,
//         region: values.region,
//       }).unwrap();
//     } catch (err) {
//       console.error("Estimate error:", err);
//       toast({
//         title: "Error",
//         description: "Failed to fetch estimate",
//         variant: "destructive",
//       });
//     }
//   };

//   const onSubmit = async (data: FormValues) => {
//     if (!deleteConfirmed) return;

//     try {
//         const paymentCheck = await getPaymentMethods();
//         const hasCard = paymentCheck.paymentMethods?.length > 0;

//         if (!hasCard) {
//           setShowNewPCDialog(false);
//           setShowBillingWarning(true); // Show popup
//           return;
//         }
//       await createVM({
//         action: "create",
//         configId: data.cpu,
//         systemName: data.pcName,
//         region: data.region || "us-east-1",
//         storageSize: parseInt(data.storage, 10),
//         billingPlan: data.billingPlan,
//       }).unwrap();

//       while (true) {
//         const fetchResult = await refetchRemoteDesktops();
//         if (fetchResult.status === "fulfilled") break;
//         await new Promise((res) => setTimeout(res, 2000));
//       }

//       toast({
//         title: "Sense PC Created",
//         description: `${data.pcName} has been successfully created.`,
//         variant: "default",
//       });

//       reset();
//       setShowNewPCDialog(false);
//       setShowConfirmation(false);   // ✅ Always hide modal
//       setDeleteConfirmed(false);    // ✅ Reset checkbox
//       return true;
//     } catch (err) {
//       const errorData = (err as { data?: any })?.data;
//       const errorMsg =
//         errorData?.message ??
//         "Something went wrong. Please try again or contact support.";

//       const requiredMin = errorData?.requiredMinimum;
//       const description = requiredMin
//         ? `${errorMsg} Minimum required: $${parseFloat(requiredMin).toFixed(2)}`
//         : errorMsg;

//       toast({
//         title: "Failed to Create Computer",
//         description,
//         variant: "destructive",
//       });

//       setShowConfirmation(false);  // ✅ Hide on error
//       setDeleteConfirmed(false);   // ✅ Reset checkbox
//       return false;
//     }
//   };

//   return (
//     <Dialog
//       open={showNewPCDialog}
//       onOpenChange={(isOpen) => {
//         setShowNewPCDialog(isOpen);
//         if (!isOpen) {
//           dispatch(clearSmartPcConfig());
//         }
//       }}
//     >
//       <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Choose Your Computer Configurations</DialogTitle>
//           <DialogDescription>Customize your Computer</DialogDescription>
//         </DialogHeader>

//         <form
//           onSubmit={handleSubmit(onSubmit)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") e.preventDefault();
//           }}
//         >
//           <div className="space-y-2">
//             <Label>Select Operating System (OS)</Label>
//             <Controller
//               control={control}
//               name="operatingSystem"
//               render={({ field }) => (
//                 <Select value={field.value} onValueChange={field.onChange}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select Operating System" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {osOptions.map((os) => (
//                       <SelectItem key={os.value} value={os.value}>
//                         {os.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               )}
//             />
//             {errors.operatingSystem && (
//               <p className="text-red-500 text-sm">
//                 {errors.operatingSystem.message}
//               </p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label>Name of the computer</Label>
//             <Controller
//               control={control}
//               name="pcName"
//               rules={{
//                 required: "Computer name is required",
//                 pattern: {
//                   value: /^[a-zA-Z0-9-_ ]{1,30}$/,
//                   message: "Only letters, numbers, spaces, dash and underscore allowed (max 30)",
//                 },
//               }}
//               render={({ field }) => (
//                 <Input
//                   className={cn(errors.pcName && "border-red-500")}
//                   placeholder="Enter a name for your computer"
//                   {...field}
//                 />
//               )}
//             />
//             {errors.pcName && (
//               <div className="flex items-center gap-2 mt-1.5">
//                 <AlertCircle className="h-4 w-4 text-yellow-600" />
//                 <p className="text-sm text-yellow-600">
//                   {errors.pcName.message}
//                 </p>
//               </div>
//             )}
//           </div>

//           <div className="space-y-4">
//             <h3 className="text-sm font-medium">Select Configuration</h3>

//             <div className="space-y-2">
//               <Label>CPU (Core)</Label>
//               <Controller
//                 control={control}
//                 name="cpu"
//                 render={({ field }) => (
//                   <Select value={field.value} onValueChange={field.onChange}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select CPU size" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {cpuOptionsForOS.map((cpu) => (
//                         <SelectItem key={cpu.value} value={cpu.value}>
//                           {cpu.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 )}
//               />
//               {errors.cpu && (
//                 <p className="text-red-500 text-sm">{errors.cpu.message}</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label>Storage</Label>
//               <Controller
//                 control={control}
//                 name="storage"
//                 render={({ field }) => (
//                   <Select value={field.value} onValueChange={field.onChange}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select storage size" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {storageOptions.map((storage) => (
//                         <SelectItem key={storage.value} value={storage.value}>
//                           {storage.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 )}
//               />
//               {errors.storage && (
//                 <p className="text-red-500 text-sm">{errors.storage.message}</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label>Location</Label>
//               <Controller
//                 control={control}
//                 name="region"
//                 render={({ field }) => (
//                   <Select value={field.value} onValueChange={field.onChange}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select nearest datacenter" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {locationOptions.map((location) => (
//                         <SelectItem key={location.value} value={location.value}>
//                           {location.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 )}
//               />
//               {errors.region && (
//                 <p className="text-red-500 text-sm">{errors.region.message}</p>
//               )}
//             </div>
//           </div>
//           <div className="space-y-2">
//             <Label>Billing Plan</Label>
//             <Controller
//               control={control}
//               name="billingPlan"
//               render={({ field }) => (
//                 <Select value={field.value} onValueChange={field.onChange}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Choose billing plan" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="hourly">Hourly</SelectItem>
//                     <SelectItem value="daily">Daily</SelectItem>
//                     <SelectItem value="monthly">Monthly</SelectItem>
//                   </SelectContent>
//                 </Select>
//               )}
//             />
//           </div>
//           <div className="rounded-md px-4 py-3 mt-2 bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-400">
//             <p className="text-sm font-semibold mb-2">Estimated Cost Breakdown:</p>

//             <div className="space-y-1 text-sm">
//               <div>
//                 CPU:{" "}
//                 {isLoading
//                   ? "..."
//                   : billingPlan === "hourly"
//                   ? `$${data?.instance?.pricePerHour?.toFixed(3) ?? "-"}`
//                   : billingPlan === "daily"
//                   ? `$${data?.instance?.pricePerDay?.toFixed(2) ?? "-"}`
//                   : `$${data?.instance?.pricePerMonth?.toFixed(2) ?? "-"}`}
//               </div>

//               <div>
//                 Storage (SSD):{" "}
//                 {isLoading
//                   ? "..."
//                   : billingPlan === "hourly"
//                   ? `$${data?.storage?.pricePerHour?.toFixed(3) ?? "-"}`
//                   : billingPlan === "daily"
//                   ? `$${data?.storage?.pricePerDay?.toFixed(2) ?? "-"}`
//                   : `$${data?.storage?.pricePerMonth?.toFixed(2) ?? "-"}`}
//               </div>

//               <div className="font-semibold mt-1">
//                 Total:{" "}
//                 {isLoading
//                   ? "..."
//                   : billingPlan === "hourly"
//                   ? `$${data?.total?.pricePerHour?.toFixed(3) ?? "-"}`
//                   : billingPlan === "daily"
//                   ? `$${data?.total?.pricePerDay?.toFixed(2) ?? "-"}`
//                   : `$${data?.total?.pricePerMonth?.toFixed(2) ?? "-"}`}
//               </div>
//             </div>
//           </div>

//           {/* Spacer */}
//           <div className="mt-6" />

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowNewPCDialog(false)}>
//               Cancel
//             </Button>
//             <Button
//               type="button"
//               onClick={handleEstimate}
//               disabled={isLoading || isCreating}
//             >
//               {isLoading ? "Estimating..." : "Estimate"}
//             </Button>
//             <Button
//               type="button"
//               disabled={isCreating || isLoading}
//               onClick={async () => {
//                 const isValid = await trigger();
//                 if (!isValid) return;
//                 setShowConfirmation(true);
//                 setConfirmationAccepted(false); // reset on every open
//               }}
//             >
//               Build PC
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//       <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Confirm Your Purchase</DialogTitle>
//             <DialogDescription>
//               You are about to be charged upfront for this Computer based on your selected plan.
//               <br />
//               <span className="mt-2 inline-block text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md">
//                 Estimated total: {getFormattedTotalPrice()}
//               </span>
//             </DialogDescription>
//           </DialogHeader>

//           <div className="mt-4 flex items-start gap-2">
//             <input
//               type="checkbox"
//               id="purchase-confirm-check"
//               checked={deleteConfirmed}
//               onChange={(e) => setDeleteConfirmed(e.target.checked)}
//               className="mt-1 h-4 w-4 border rounded"
//             />
//             <label
//               htmlFor="purchase-confirm-check"
//               className="text-sm text-muted-foreground leading-snug"
//             >
//               I acknowledge and accept the above statement.
//             </label>
//           </div>

//           <DialogFooter className="mt-4">
//             <Button variant="outline" onClick={() => setShowConfirmation(false)}>
//               Cancel
//             </Button>
//             <Button
//               type="button"
//               disabled={isCreating || !deleteConfirmed}
//               onClick={handleSubmit(async (formData) => {
//                 if (!deleteConfirmed) return;

//                 const success = await onSubmit(formData);

//                 setShowConfirmation(false);
//                 setDeleteConfirmed(false);
//                 setConfirmationAccepted(false);
//               })}
//             >
//               {isCreating ? "Processing..." : "Confirm & Pay"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </Dialog>
//     <Dialog open={showBillingWarning} onOpenChange={setShowBillingWarning}>
//   <DialogContent className="max-w-md text-center space-y-6">
//     <div className="flex flex-col items-center space-y-3">
//       <div className="bg-red-100 text-red-600 rounded-full p-3">
//         <AlertCircle className="w-6 h-6" />
//       </div>
//       <div>
//         <h2 className="text-lg font-semibold text-red-600">Payment Method Required</h2>
//         <p className="text-sm text-muted-foreground mt-2">
//           To continue, please add a card and recharge your wallet. This helps prevent failed provisioning.
//         </p>
//       </div>
//     </div>
//     <div className="flex justify-center gap-4 pt-2">
//       <Button variant="outline" onClick={() => setShowBillingWarning(false)}>
//         Cancel
//       </Button>
//       <Button
//         onClick={() => {
//           router.push("/dashboard/billing");
//           setShowBillingWarning(false);
//         }}
//       >
//         Go to Billing Page
//       </Button>
//     </div>
//   </DialogContent>
// </Dialog>

//   </>

//   );
// };

// export default SmartPCConfigDialog;

import React, { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formSchema, FormValues } from "../schema";
import {
  cpuCategories,
  cpuOptions,
  locationOptions,
  osOptions,
  storageOptions,
} from "../data";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetEstimateMutation,
  useListRemoteDesktopQuery,
} from "@/api/fileManagerAPI";
import { useCreateVMMutation } from "@/api/vmManagement";
import { clearSmartPcConfig } from "@/redux/slices/build-pc/smart-pc-config-slice";

const SmartPCConfigDialog = ({
  showNewPCDialog,
  setShowNewPCDialog,
}: {
  showNewPCDialog: boolean;
  setShowNewPCDialog: (value: boolean) => void;
}) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const config = useSelector((state: RootState) => state.smartPcConfig);

  const [getEstimate, { data, isLoading }] = useGetEstimateMutation();
  const { refetch: refetchRemoteDesktops } = useListRemoteDesktopQuery({
    userId,
  });
  const [createVM, { isLoading: isCreating }] = useCreateVMMutation();

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      pcName: "",
      operatingSystem: config.operatingSystem || osOptions[0].value,
      cpu: config.cpu || cpuOptions[config.operatingSystem]?.[0]?.value || "",
      storage: config.storage || storageOptions[0].value,
      region: config.region || locationOptions[0].value,
      billingPlan: "hourly",
      linuxCategory: "Ubuntu_24.04_LTS_X64",
    },
  });

  const selectedOS = useWatch({ control, name: "operatingSystem" });
  const isLinuxOS = selectedOS === "Linux";
  const selectedLinuxCategory = useWatch({ control, name: "linuxCategory" });
  const linuxCategoryCpuOptions =
    cpuCategories.Linux[`${selectedLinuxCategory}`] || [];

  const cpuOptionsForOS = isLinuxOS
    ? linuxCategoryCpuOptions
    : cpuOptions[selectedOS] || [];

  useEffect(() => {
    const currentCpu = getValues("cpu");
    const defaultCpu = cpuOptions[selectedOS]?.[0]?.value;

    if (!currentCpu && defaultCpu) {
      setValue("cpu", defaultCpu);
    }
  }, [selectedOS, cpuOptions, getValues, setValue]);

  const billingPlan = useWatch({ control, name: "billingPlan" });
  const cpu = useWatch({ control, name: "cpu" });
  const region = useWatch({ control, name: "region" });
  const storage = useWatch({ control, name: "storage" });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [confirmationAccepted, setConfirmationAccepted] = useState(false);

  const getFormattedTotalPrice = () => {
    if (isLoading || !data?.total) return "...";

    const price =
      billingPlan === "hourly"
        ? data.total.pricePerHour?.toFixed(3)
        : billingPlan === "daily"
        ? data.total.pricePerDay?.toFixed(2)
        : data.total.pricePerMonth?.toFixed(2);

    const suffix =
      billingPlan === "hourly"
        ? "/hour"
        : billingPlan === "daily"
        ? "/day"
        : "/month";

    return `$${price} ${suffix}`;
  };

  useEffect(() => {
    if (!cpu || !storage || !region) return;

    const timeout = setTimeout(() => {
      getEstimate({
        configId: cpu,
        storageSize: storage,
        region,
      })
        .unwrap()
        .catch((err) => {
          console.error("Auto estimate error:", err);
        });
    }, 300); // Debounce slightly to avoid rapid re-renders

    return () => clearTimeout(timeout);
  }, [cpu, storage, region, billingPlan]);

  // useEffect(() => {
  //   if (data) {
  //     console.log("🧪 Estimate API response:", data);
  //   }
  // }, [data]);

  // useEffect(() => {
  //   if (cpuOptionsForOS.length > 0) {
  //     setValue("cpu", cpuOptionsForOS[0].value);
  //   }
  // }, [selectedOS]);

  useEffect(() => {
    if (config.cpu && cpuOptionsForOS.some((cpu) => cpu.value === config.cpu)) {
      setValue("cpu", config.cpu);
    } else if (cpuOptionsForOS.length > 0) {
      setValue("cpu", cpuOptionsForOS[0].value);
    }
  }, [config.cpu, cpuOptionsForOS, setValue]);

  useEffect(() => {
    const fetchInitialEstimate = async () => {
      const values = getValues();

      if (!values.cpu || !values.storage || !values.region) return;

      console.log({ values });
      try {
        await getEstimate({
          configId: values.cpu,
          storageSize: values.storage,
          region: values.region,
        }).unwrap();
      } catch (error) {
        console.error("Initial estimate error:", error);
      }
    };

    fetchInitialEstimate();
  }, [config.cpu, cpuOptionsForOS, setValue]);

  const handleEstimate = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    const values = getValues();

    try {
      await getEstimate({
        configId: values.cpu,
        storageSize: values.storage,
        region: values.region,
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
    if (!deleteConfirmed) return;

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

      toast({
        title: "Sense PC Created",
        description: `${data.pcName} has been successfully created.`,
        variant: "default",
      });

      reset();
      setShowNewPCDialog(false);
      setShowConfirmation(false); // ✅ Always hide modal
      setDeleteConfirmed(false); // ✅ Reset checkbox
      return true;
    } catch (err) {
      const errorData = (err as { data?: any })?.data;
      const errorMsg =
        errorData?.message ??
        "Something went wrong. Please try again or contact support.";

      const requiredMin = errorData?.requiredMinimum;
      const description = requiredMin
        ? `${errorMsg} Minimum required: $${parseFloat(requiredMin).toFixed(2)}`
        : errorMsg;

      toast({
        title: "Failed to Create Computer",
        description,
        variant: "destructive",
      });

      setShowConfirmation(false); // ✅ Hide on error
      setDeleteConfirmed(false); // ✅ Reset checkbox
      return false;
    }
  };

  return (
    <Dialog
      open={showNewPCDialog}
      onOpenChange={(isOpen) => {
        setShowNewPCDialog(isOpen);
        if (!isOpen) {
          dispatch(clearSmartPcConfig());
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Your Computer Configurations</DialogTitle>
          <DialogDescription>Customize your Computer</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <div className="space-y-2">
            <Label>Select Operating System (OS)</Label>
            <Controller
              control={control}
              name="operatingSystem"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Operating System" />
                  </SelectTrigger>
                  <SelectContent>
                    {osOptions.map((os) => (
                      <SelectItem key={os.value} value={os.value}>
                        {os.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.operatingSystem && (
              <p className="text-red-500 text-sm">
                {errors.operatingSystem.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Name of the computer</Label>
            <Controller
              control={control}
              name="pcName"
              rules={{
                required: "Computer name is required",
                pattern: {
                  value: /^[a-zA-Z0-9-_ ]{1,30}$/,
                  message:
                    "Only letters, numbers, spaces, dash and underscore allowed (max 30)",
                },
              }}
              render={({ field }) => (
                <Input
                  className={cn(errors.pcName && "border-red-500")}
                  placeholder="Enter a name for your computer"
                  {...field}
                />
              )}
            />
            {errors.pcName && (
              <div className="flex items-center gap-2 mt-1.5">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-600">
                  {errors.pcName.message}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Select Configuration</h3>

            {isLinuxOS && (
              <div className="space-y-2">
                <Label>Category</Label>
                <Controller
                  control={control}
                  name="linuxCategory"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Linux category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(cpuCategories.Linux).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.cpu && (
                  <p className="text-red-500 text-sm">{errors.cpu.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>CPU (Core)</Label>
              <Controller
                control={control}
                name="cpu"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select CPU size" />
                    </SelectTrigger>
                    <SelectContent>
                      {cpuOptionsForOS.map((cpu) => (
                        <SelectItem key={cpu.value} value={cpu.value}>
                          {cpu.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.cpu && (
                <p className="text-red-500 text-sm">{errors.cpu.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Storage</Label>
              <Controller
                control={control}
                name="storage"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage size" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageOptions.map((storage) => (
                        <SelectItem key={storage.value} value={storage.value}>
                          {storage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.storage && (
                <p className="text-red-500 text-sm">{errors.storage.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Controller
                control={control}
                name="region"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select nearest datacenter" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.region && (
                <p className="text-red-500 text-sm">{errors.region.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Billing Plan</Label>
            <Controller
              control={control}
              name="billingPlan"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose billing plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="rounded-md px-4 py-3 mt-2 bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-400">
            <p className="text-sm font-semibold mb-2">
              Estimated Cost Breakdown:
            </p>

            <div className="space-y-1 text-sm">
              <div>
                CPU:{" "}
                {isLoading
                  ? "..."
                  : billingPlan === "hourly"
                  ? `$${data?.instance?.pricePerHour?.toFixed(3) ?? "-"}`
                  : billingPlan === "daily"
                  ? `$${data?.instance?.pricePerDay?.toFixed(2) ?? "-"}`
                  : `$${data?.instance?.pricePerMonth?.toFixed(2) ?? "-"}`}
              </div>

              <div>
                Storage (SSD):{" "}
                {isLoading
                  ? "..."
                  : billingPlan === "hourly"
                  ? `$${data?.storage?.pricePerHour?.toFixed(3) ?? "-"}`
                  : billingPlan === "daily"
                  ? `$${data?.storage?.pricePerDay?.toFixed(2) ?? "-"}`
                  : `$${data?.storage?.pricePerMonth?.toFixed(2) ?? "-"}`}
              </div>

              <div className="font-semibold mt-1">
                Total:{" "}
                {isLoading
                  ? "..."
                  : billingPlan === "hourly"
                  ? `$${data?.total?.pricePerHour?.toFixed(3) ?? "-"}`
                  : billingPlan === "daily"
                  ? `$${data?.total?.pricePerDay?.toFixed(2) ?? "-"}`
                  : `$${data?.total?.pricePerMonth?.toFixed(2) ?? "-"}`}
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="mt-6" />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPCDialog(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleEstimate}
              disabled={isLoading || isCreating}
            >
              {isLoading ? "Estimating..." : "Estimate"}
            </Button>
            <Button
              type="button"
              disabled={isCreating || isLoading}
              onClick={async () => {
                const isValid = await trigger();
                if (!isValid) return;
                setShowConfirmation(true);
                setConfirmationAccepted(false); // reset on every open
              }}
            >
              Build PC
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Your Purchase</DialogTitle>
            <DialogDescription>
              You are about to be charged upfront for this Computer based on
              your selected plan.
              <br />
              <span className="mt-2 inline-block text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                Estimated total: {getFormattedTotalPrice()}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex items-start gap-2">
            <input
              type="checkbox"
              id="purchase-confirm-check"
              checked={deleteConfirmed}
              onChange={(e) => setDeleteConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 border rounded"
            />
            <label
              htmlFor="purchase-confirm-check"
              className="text-sm text-muted-foreground leading-snug"
            >
              I acknowledge and accept the above statement.
            </label>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isCreating || !deleteConfirmed}
              onClick={handleSubmit(async (formData) => {
                if (!deleteConfirmed) return;

                const success = await onSubmit(formData);

                setShowConfirmation(false);
                setDeleteConfirmed(false);
                setConfirmationAccepted(false);
              })}
            >
              {isCreating ? "Processing..." : "Confirm & Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default SmartPCConfigDialog;
