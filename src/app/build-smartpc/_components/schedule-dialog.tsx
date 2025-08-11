"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Search, Trash, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Schedule, saveSchedule, getSchedule, deleteSchedule } from "@/api/schedule";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instanceId: string;
  refreshSchedule: () => void;
}

const detectTimeZone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const getOffset = (iana: string): string => {
  try {
    const dt = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: iana,
      timeZoneName: "shortOffset",
    }).formatToParts(dt);
    const value = parts.find((p) => p.type === "timeZoneName")?.value || "";
    return value.replace("GMT", "UTC");
  } catch {
    return "UTC+00:00";
  }
};

const allTimeZones: string[] =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : [
        "UTC", "Asia/Dhaka", "Asia/Kolkata", "America/New_York",
        "Europe/Berlin", "Europe/London",
      ];

export default function ScheduleDialog({
  open,
  onOpenChange,
  instanceId,
  refreshSchedule,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [existingSchedule, setExistingSchedule] = useState<Schedule | null>(null);

  const [selectedTimeZone, setSelectedTimeZone] = useState(detectTimeZone());
  const [scheduleFrequency, setScheduleFrequency] =
    useState<"everyday" | "weekdays" | "weekends" | "custom">("everyday");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [autoStartTime, setAutoStartTime] = useState<string | null>(null);
  const [autoStopTime, setAutoStopTime] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);

  const [tzSearch, setTzSearch] = useState("");
  const [loadedZones, setLoadedZones] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (!open || !instanceId) return;
    setFetching(true);
    getSchedule(instanceId)
      .then((schedule) => {
        setExistingSchedule(schedule);
        setSelectedTimeZone(schedule?.timeZone || detectTimeZone());
        setScheduleFrequency(schedule?.frequency || "everyday");
        setCustomStartDate(schedule?.startDate || "");
        setCustomEndDate(schedule?.endDate || "");
        setAutoStartTime(schedule?.autoStartTime ?? null);
        setAutoStopTime(schedule?.autoStopTime ?? null);
        setEnabled(schedule?.enabled !== false);
      })
      .catch(() => {
        setExistingSchedule(null);
        setSelectedTimeZone(detectTimeZone());
        setScheduleFrequency("everyday");
        setCustomStartDate("");
        setCustomEndDate("");
        setAutoStartTime(null);
        setAutoStopTime(null);
        setEnabled(true);
      })
      .finally(() => setFetching(false));
  }, [open, instanceId]);

  useEffect(() => {
    if (tzSearch.length > 0 && loadedZones.length === 0) {
      const exclude = selectedTimeZone;
      const all = allTimeZones
        .filter((z) => z !== exclude)
        .map((z) => ({ value: z, label: `${z} (${getOffset(z)})` }));
      setLoadedZones(all);
    }
  }, [tzSearch, loadedZones.length, selectedTimeZone]);

  const filteredZones = useMemo(() => {
    const term = tzSearch.toLowerCase();
    return loadedZones
      .filter((z) =>
        z.value.toLowerCase().includes(term) ||
        z.label.toLowerCase().includes(term)
      )
      .filter((z) => z.value !== selectedTimeZone);
  }, [tzSearch, loadedZones, selectedTimeZone]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveSchedule({
        instanceId,
        timeZone: selectedTimeZone,
        frequency: scheduleFrequency,
        startDate: scheduleFrequency === "custom" ? customStartDate : undefined,
        endDate: scheduleFrequency === "custom" ? customEndDate : undefined,
        autoStartTime: autoStartTime || undefined,
        autoStopTime: autoStopTime || undefined,
        enabled,
      });
      refreshSchedule();
      onOpenChange(false);
    } catch (err) {
      console.error("Save error", err);
      alert("Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;
    setLoading(true);
    try {
      await deleteSchedule(instanceId);
      refreshSchedule();
      onOpenChange(false);
    } catch (err) {
      console.error("Delete error", err);
      alert("Failed to delete schedule");
    } finally {
      setLoading(false);
    }
  };

  const timeInput = (label: string, value: string | null, setter: (v: string | null) => void) => (
    <div className="space-y-2" key={label}>
      <Label>
        Auto {label} time <span className="text-xs text-muted-foreground">(optional)</span>
      </Label>
      <div className="relative flex items-center">
        <Input
          type="time"
          value={value ?? ""}
          onChange={(e) => setter(e.target.value || null)}
          className="pl-3 pr-10 w-full"
        />
        {value && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-1"
            onClick={() => setter(null)}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
        <Clock className="absolute right-8 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );

  const suggestedOption = {
    value: selectedTimeZone,
    label: `${selectedTimeZone} (${getOffset(selectedTimeZone)})`,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Schedule Your PC</DialogTitle>
          <DialogDescription>
            Auto start/stop your PC on a calendar to save costs.
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="py-12 text-center text-muted-foreground">Loading schedule…</div>
        ) : (
          <div className="space-y-4">
            {existingSchedule && (
              <div className="flex items-center gap-2">
                <Switch checked={enabled} onCheckedChange={setEnabled} />
                <span className="text-sm">{enabled ? "Enabled" : "Disabled"}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label>Time Zone</Label>
              <Select value={selectedTimeZone} onValueChange={setSelectedTimeZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick time zone" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <div className="sticky top-0 bg-popover p-2 z-10">
                    <Input
                      placeholder="Search by region or UTC offset…"
                      value={tzSearch}
                      onChange={(e) => setTzSearch(e.target.value)}
                      className="pl-8 text-sm"
                    />
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                  <SelectGroup>
                    <SelectLabel>Suggested</SelectLabel>
                    <SelectItem value={suggestedOption.value}>{suggestedOption.label}</SelectItem>
                  </SelectGroup>
                  {tzSearch && (
                    <SelectGroup>
                      <SelectLabel>Matching Results</SelectLabel>
                      {filteredZones.map((z) => (
                        <SelectItem key={z.value} value={z.value}>
                          {z.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={scheduleFrequency} onValueChange={(val: "everyday" | "weekdays" | "weekends" | "custom") => setScheduleFrequency(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Everyday" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyday">Everyday</SelectItem>
                  <SelectItem value="weekdays">Weekdays</SelectItem>
                  <SelectItem value="weekends">Weekends</SelectItem>
                  <SelectItem value="custom">Custom date range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {scheduleFrequency === "custom" && (
              <div className="space-y-2">
                <Label>Custom Date Range</Label>
                <div className="grid gap-3">
                  {["Start", "End"].map((label, idx) => {
                    const val = idx === 0 ? customStartDate : customEndDate;
                    const setter = idx === 0 ? setCustomStartDate : setCustomEndDate;
                    return (
                      <div className="relative" key={label}>
                        <Input
                          type="date"
                          placeholder={label}
                          value={val}
                          onChange={(e) => setter(e.target.value)}
                          className="pl-3 pr-10"
                        />
                        <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {timeInput("Start", autoStartTime, setAutoStartTime)}
            {timeInput("Stop", autoStopTime, setAutoStopTime)}
          </div>
        )}

        <DialogFooter className="flex flex-row gap-2 mt-4">
          <Button onClick={handleSave} disabled={loading || fetching} className="w-full">
            {existingSchedule ? "Update Schedule" : "Create Schedule"}
          </Button>
          {existingSchedule && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading || fetching}
              className="w-full"
            >
              <Trash className="mr-2 h-4 w-4" /> Delete Schedule
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
