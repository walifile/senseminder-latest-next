import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  cpuOptions,
  locationOptions,
  osOptions,
  storageOptions,
} from "../data";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetEstimateMutation,
  useListRemoteDesktopQuery,
} from "@/api/fileManagerAPI";
import { useCreateVMMutation } from "@/api/vmManagement";

const SmartPCConfigDialog = ({
  showNewPCDialog,
  setShowNewPCDialog,
}: {
  showNewPCDialog: boolean;
  setShowNewPCDialog: (value: boolean) => void;
}) => {
  const { toast } = useToast();
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const [getEstimate, { data, isLoading }] = useGetEstimateMutation();
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

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pcName: "",
      operatingSystem: osOptions[0].value,
      cpu: cpuOptions[0].value,
      storage: storageOptions[0].value,
      region: locationOptions[0].value,
    },
  });

  const handleEstimate = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    const values = getValues();

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
      toast({
        title: "SmartPC Created",
        description: `${data.pcName} has been successfully created.`,
        variant: "default",
      });

      reset();
      setShowNewPCDialog(false);
    } catch (err) {
      setShowNewPCDialog(false);
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
    <Dialog open={showNewPCDialog} onOpenChange={setShowNewPCDialog}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choose Your SmartPC Configurations</DialogTitle>
          <DialogDescription>Configure your custom cloud PC</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Select Operating System (OS)</Label>
            <Controller
              control={control}
              name="operatingSystem"
              render={({ field }) => (
                <Select {...field}>
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
              render={({ field }) => (
                <Input
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

            <div className="space-y-2">
              <Label>CPU (Core)</Label>
              <Controller
                control={control}
                name="cpu"
                render={({ field }) => (
                  <Select {...field}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select CPU size" />
                    </SelectTrigger>
                    <SelectContent>
                      {cpuOptions.map((cpu) => (
                        <SelectItem key={cpu.value} value={cpu.value}>
                          {cpu.label} (${cpu.pricePerHour}/hour)
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
                  <Select {...field}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage size" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageOptions.map((storage) => (
                        <SelectItem key={storage.value} value={storage.value}>
                          {storage.label} (${storage.pricePerHour}/hour)
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
                  <Select {...field}>
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

          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Hourly Cost</span>
              <span className="text-2xl font-bold">
                ${data ? `${data.hourlyCost}/hour` : "0/hour"}
              </span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Monthly Estimate</span>
              <span>
                ${data ? (data.hourlyCost * 24 * 30).toFixed(2) : "0.00"}
                /month
              </span>
            </div>
          </div>

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
            <Button type="submit" disabled={isCreating || isLoading}>
              Build
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SmartPCConfigDialog;
