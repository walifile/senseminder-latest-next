"use client";

import type { Schedule } from "@/api/schedule";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  useLazyGetScheduleQuery,
  useSaveScheduleMutation,
  useDeleteScheduleMutation,
} from "@/api/schedule";

import { Logger } from "@/lib/utils/logger";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

import {
  X,
  Clock3,
  Search,
  Trash2,
  Loader2,
  Calendar,
  AlertTriangle,
  CalendarClock,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  instanceId: string;
  onSuccess: () => void;
}

type ScheduleFrequency = "everyday" | "weekdays" | "weekends" | "custom";

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
        "UTC",
        "Asia/Dhaka",
        "Asia/Kolkata",
        "America/New_York",
        "Europe/Berlin",
        "Europe/London",
      ];

export default function ScheduleDialog({
  open,
  onClose,
  instanceId,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [existingSchedule, setExistingSchedule] = useState<Schedule | null>(
    null,
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [selectedTimeZone, setSelectedTimeZone] = useState(detectTimeZone());
  const [scheduleFrequency, setScheduleFrequency] =
    useState<ScheduleFrequency>("everyday");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [autoStartTime, setAutoStartTime] = useState<string | null>(null);
  const [autoStopTime, setAutoStopTime] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);

  const [tzSearch, setTzSearch] = useState("");
  const [loadedZones, setLoadedZones] = useState<
    { value: string; label: string }[]
  >([]);

  const [triggerGetSchedule] = useLazyGetScheduleQuery();
  const [saveSchedule] = useSaveScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();

  const closeDialog = useCallback(() => {
    if (loading) return;
    onClose();
  }, [loading, onClose]);

  useEffect(() => {
    if (!open || !instanceId) return;

    setFetching(true);
    triggerGetSchedule({ instanceId })
      .unwrap()
      .then((res) => {
        const schedule = res?.data ?? null;
        setExistingSchedule(schedule);
        setSelectedTimeZone(schedule?.timeZone || detectTimeZone());
        setScheduleFrequency(
          (schedule?.frequency as ScheduleFrequency) || "everyday",
        );
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
  }, [open, instanceId, triggerGetSchedule]);

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
      .filter(
        (z) =>
          z.value.toLowerCase().includes(term) ||
          z.label.toLowerCase().includes(term),
      )
      .filter((z) => z.value !== selectedTimeZone);
  }, [tzSearch, loadedZones, selectedTimeZone]);

  const summaryText = useMemo(() => {
    const start = autoStartTime || "not set";
    const stop = autoStopTime || "not set";

    const labelMap: Record<ScheduleFrequency, string> = {
      everyday: "Everyday",
      weekdays: "Weekdays",
      weekends: "Weekends",
      custom: "Custom range",
    };

    return `${labelMap[scheduleFrequency]} • Start ${start} • Stop ${stop}`;
  }, [scheduleFrequency, autoStartTime, autoStopTime]);

  const hasAtLeastOneTime = useMemo(
    () =>
      Boolean(
        (autoStartTime && autoStartTime.trim()) ||
          (autoStopTime && autoStopTime.trim()),
      ),
    [autoStartTime, autoStopTime],
  );

  const handleSave = async () => {
    if (!hasAtLeastOneTime) {
      alert("Please set at least an Auto Start time or an Auto Stop time.");
      return;
    }

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
      }).unwrap();

      onSuccess();
      closeDialog();
    } catch (err) {
      Logger.error("Save error", err);
      alert("Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingSchedule) return;

    setLoading(true);
    try {
      await deleteSchedule({ instanceId }).unwrap();
      setConfirmDeleteOpen(false);
      onSuccess();
      closeDialog();
    } catch (err) {
      Logger.error("Delete error", err);
      alert("Failed to delete schedule");
    } finally {
      setLoading(false);
    }
  };

  const hideNativePickerIndicator =
    "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-12 [&::-webkit-calendar-picker-indicator]:cursor-pointer";

  const timeInput = (
    label: string,
    value: string | null,
    setter: (v: string | null) => void,
  ) => (
    <div className="space-y-1.5" key={label}>
      <Label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {label}
      </Label>

      <div className="relative">
        <Input
          type="time"
          value={value ?? ""}
          onChange={(e) => setter(e.target.value || null)}
          className={`h-[46px] w-full pr-20 ${hideNativePickerIndicator}`}
        />

        {value && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-10 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={() => setter(null)}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}

        <Clock3 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );

  const suggestedOption = {
    value: selectedTimeZone,
    label: `${selectedTimeZone} (${getOffset(selectedTimeZone)})`,
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && closeDialog()}>
        <DialogContent className="w-[min(92vw,36rem)] max-w-lg gap-0 overflow-hidden rounded-2xl border-zinc-300/60 p-0 dark:border-zinc-700/60">
          <DialogHeader className="border-b border-zinc-300/50 px-5 pb-4 pt-5 dark:border-zinc-700/50">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(79,70,229,0.12)_0%,rgba(124,58,237,0.18)_100%)] ring-1 ring-inset ring-violet-300/40 dark:ring-violet-500/25">
                <CalendarClock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>

              <div className="min-w-0">
                <DialogTitle className="text-left text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Schedule Your PC
                </DialogTitle>
                <DialogDescription className="mt-1 text-left text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                  Set an automatic start and stop schedule to keep usage
                  predictable.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-5 py-4">
            {fetching ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Loading schedule...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {existingSchedule && (
                  <div className="flex items-center justify-between rounded-xl border border-zinc-300/60 bg-white/70 px-3 py-2.5 dark:border-zinc-700/60 dark:bg-zinc-900/60">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Schedule status
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300">
                        {enabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>

                    <Switch checked={enabled} onCheckedChange={setEnabled} />
                  </div>
                )}

                <div className="rounded-xl border border-zinc-300/60 bg-white/70 p-3 dark:border-zinc-700/60 dark:bg-zinc-900/60">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Schedule summary
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                    {summaryText}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Time Zone
                  </Label>

                  <Select
                    value={selectedTimeZone}
                    onValueChange={setSelectedTimeZone}
                  >
                    <SelectTrigger variant="form" className="h-[46px] px-4">
                      <SelectValue placeholder="Pick time zone" />
                    </SelectTrigger>

                    <SelectContent
                      variant="form"
                      className="max-h-[300px] overflow-y-auto"
                    >
                      <div className="sticky top-0 z-10 bg-input-surface p-2 dark:bg-select-surface-dark">
                        <div className="relative">
                          <Input
                            placeholder="Search time zone..."
                            value={tzSearch}
                            onChange={(e) => setTzSearch(e.target.value)}
                            className="h-10 pl-10 pr-3 text-sm"
                          />
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </div>

                      <SelectGroup>
                        <SelectLabel>Suggested</SelectLabel>
                        <SelectItem value={suggestedOption.value}>
                          {suggestedOption.label}
                        </SelectItem>
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Frequency
                    </Label>

                    <Select
                      value={scheduleFrequency}
                      onValueChange={(val: ScheduleFrequency) =>
                        setScheduleFrequency(val)
                      }
                    >
                      <SelectTrigger variant="form" className="h-[46px] px-4">
                        <SelectValue placeholder="Everyday" />
                      </SelectTrigger>

                      <SelectContent variant="form">
                        <SelectItem value="everyday">Everyday</SelectItem>
                        <SelectItem value="weekdays">Weekdays</SelectItem>
                        <SelectItem value="weekends">Weekends</SelectItem>
                        <SelectItem value="custom">Custom range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Time Zone Offset
                    </Label>
                    <div className="flex h-[46px] items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                      {getOffset(selectedTimeZone)}
                    </div>
                  </div>
                </div>

                {scheduleFrequency === "custom" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Start Date
                      </Label>

                      <div className="relative">
                        <Input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className={`h-[46px] pr-12 ${hideNativePickerIndicator}`}
                        />
                        <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        End Date
                      </Label>

                      <div className="relative">
                        <Input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className={`h-[46px] pr-12 ${hideNativePickerIndicator}`}
                        />
                        <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {timeInput("Auto Start", autoStartTime, setAutoStartTime)}
                  {timeInput("Auto Stop", autoStopTime, setAutoStopTime)}
                </div>

                {!hasAtLeastOneTime && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <p className="text-xs leading-5 text-zinc-700 dark:text-zinc-300">
                        Set at least one time:{" "}
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          Auto Start
                        </span>{" "}
                        or{" "}
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          Auto Stop
                        </span>
                        .
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-zinc-300/50 px-5 py-4 sm:justify-end dark:border-zinc-700/50">
            {existingSchedule && (
              <Button
                variant="outline"
                onClick={() => existingSchedule && setConfirmDeleteOpen(true)}
                disabled={loading || fetching || !existingSchedule}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}

            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={loading || fetching}
              className="border-zinc-300/60 bg-white/75 text-zinc-900 transition-all hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-900/65 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={loading || fetching || !hasAtLeastOneTime}
              className="bg-[linear-gradient(90deg,#4F46E5_0%,#7C3AED_55%,#C026D3_100%)] text-white shadow-[0_10px_30px_-12px_rgba(124,58,237,0.55)] hover:opacity-95"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : existingSchedule ? (
                "Update Schedule"
              ) : (
                "Create Schedule"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmDeleteOpen}
        onOpenChange={(nextOpen) => !loading && setConfirmDeleteOpen(nextOpen)}
      >
        <AlertDialogContent className="w-[min(92vw,30rem)] max-w-md gap-0 overflow-hidden rounded-2xl border-zinc-300/60 p-0 dark:border-zinc-700/60">
          <AlertDialogHeader className="border-b border-zinc-300/50 px-5 pb-4 pt-5 dark:border-zinc-700/50">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(220,38,38,0.12)_0%,rgba(220,38,38,0.18)_100%)] ring-1 ring-inset ring-red-300/40 dark:ring-red-500/25">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>

              <div className="min-w-0">
                <AlertDialogTitle className="text-left text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Delete Schedule
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-1 text-left text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                  This will permanently remove the saved automatic start and stop
                  schedule for this PC.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="px-5 py-4">
            <div className="rounded-xl border border-red-200 bg-red-50/80 p-3 dark:border-red-900/40 dark:bg-red-950/20">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Important
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-700 dark:text-zinc-300">
                After deletion, this PC will no longer start or stop
                automatically until a new schedule is created.
              </p>
            </div>
          </div>

          <AlertDialogFooter className="border-t border-zinc-300/50 px-5 py-4 sm:justify-end dark:border-zinc-700/50">
            <AlertDialogCancel
              disabled={loading}
              className="mt-0 border-zinc-300/60 bg-white/75 text-zinc-900 transition-all hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-900/65 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete Schedule"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}