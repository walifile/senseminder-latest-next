import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";

type ScheduleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTimeZone: string;
  setSelectedTimeZone: (tz: string) => void;
  scheduleFrequency: string;
  setScheduleFrequency: (freq: string) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
  autoStartTime: string;
  setAutoStartTime: (time: string) => void;
  autoStopTime: string;
  setAutoStopTime: (time: string) => void;
  onSave: () => void;
};

const ScheduleDialog: React.FC<ScheduleDialogProps> = ({
  open,
  onOpenChange,
  selectedTimeZone,
  setSelectedTimeZone,
  scheduleFrequency,
  setScheduleFrequency,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  autoStartTime,
  setAutoStartTime,
  autoStopTime,
  setAutoStopTime,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Schedule Your SmartPC</DialogTitle>
          <DialogDescription>
            Schedule your PC to auto start/stop to increase efficiency and save
            costs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Time Zone</Label>
            <Select
              value={selectedTimeZone}
              onValueChange={setSelectedTimeZone}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                <SelectItem value="CST">Central Time (CST)</SelectItem>
                <SelectItem value="PST">Pacific Time (PST)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Schedule Frequency</Label>
            <Select
              value={scheduleFrequency}
              onValueChange={setScheduleFrequency}
            >
              <SelectTrigger>
                <SelectValue placeholder="Everyday" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyday">Everyday</SelectItem>
                <SelectItem value="weekdays">Weekdays</SelectItem>
                <SelectItem value="weekends">Weekends</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {scheduleFrequency === "custom" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Custom Date Range</Label>
                <div className="grid gap-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="mm/dd/yyyy"
                      className="w-full pl-3 pr-10"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      onClick={(e) => {
                        const input = e.target as HTMLInputElement;
                        input.type = "date";
                        input.showPicker();
                      }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="mm/dd/yyyy"
                      className="w-full pl-3 pr-10"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      onClick={(e) => {
                        const input = e.target as HTMLInputElement;
                        input.type = "date";
                        input.showPicker();
                      }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Auto Start Time (Optional)</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="--:--"
                className="w-full pl-3 pr-10"
                value={autoStartTime}
                onChange={(e) => setAutoStartTime(e.target.value)}
                onClick={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.type = "time";
                  input.showPicker();
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Auto Stop Time (Optional)</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="--:--"
                className="w-full pl-3 pr-10"
                value={autoStopTime}
                onChange={(e) => setAutoStopTime(e.target.value)}
                onClick={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.type = "time";
                  input.showPicker();
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button className="w-full" onClick={onSave}>
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleDialog;
