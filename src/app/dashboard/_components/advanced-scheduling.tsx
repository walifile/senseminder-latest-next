import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Plus, Trash2, AlarmClock, Power, PowerOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ScheduleItem = {
  id: string;
  name: string;
  type: "start" | "stop";
  time: string;
  days: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  active: boolean;
};

const defaultSchedule: ScheduleItem[] = [
  {
    id: "1",
    name: "Workday Start",
    type: "start",
    time: "08:00",
    days: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    active: true,
  },
  {
    id: "2",
    name: "Workday End",
    type: "stop",
    time: "18:00",
    days: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    active: true,
  },
];

const AdvancedScheduling = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(defaultSchedule);
  const [editItem, setEditItem] = useState<ScheduleItem | null>(null);
  const { toast } = useToast();

  const handleAddSchedule = () => {
    const newSchedule: ScheduleItem = {
      id: Date.now().toString(),
      name: "New Schedule",
      type: "start",
      time: "09:00",
      days: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      active: true,
    };

    setSchedules([...schedules, newSchedule]);
    setEditItem(newSchedule);

    toast({
      title: "Schedule Created",
      description: "New schedule has been added.",
    });
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id));
    if (editItem?.id === id) {
      setEditItem(null);
    }

    toast({
      title: "Schedule Deleted",
      description: "The schedule has been removed.",
    });
  };

  const handleToggleActive = (id: string) => {
    setSchedules(
      schedules.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );

    const schedule = schedules.find((s) => s.id === id);
    toast({
      title: schedule?.active ? "Schedule Deactivated" : "Schedule Activated",
      description: `"${schedule?.name}" has been ${
        schedule?.active ? "deactivated" : "activated"
      }.`,
    });
  };

  const handleUpdateName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editItem) return;
    setEditItem({ ...editItem, name: e.target.value });
  };

  const handleUpdateTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editItem) return;
    setEditItem({ ...editItem, time: e.target.value });
  };

  const handleUpdateType = (type: "start" | "stop") => {
    if (!editItem) return;
    setEditItem({ ...editItem, type });
  };

  const handleUpdateDay = (day: keyof ScheduleItem["days"]) => {
    if (!editItem) return;
    setEditItem({
      ...editItem,
      days: {
        ...editItem.days,
        [day]: !editItem.days[day],
      },
    });
  };

  const handleSaveChanges = () => {
    if (!editItem) return;
    setSchedules(schedules.map((s) => (s.id === editItem.id ? editItem : s)));

    toast({
      title: "Schedule Updated",
      description: `"${editItem.name}" has been updated.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Advanced Scheduling</CardTitle>
        <CardDescription>
          Set up recurring start and stop times for your PC
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="schedules" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="schedules">Active Schedules</TabsTrigger>
            <TabsTrigger value="edit">Edit Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="schedules">
            <div className="space-y-3 mt-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`p-3 rounded-md border flex items-center justify-between ${
                    schedule.active
                      ? "border-primary/50 bg-primary/5"
                      : "border-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {schedule.type === "start" ? (
                      <Power
                        className={`h-4 w-4 ${
                          schedule.active
                            ? "text-green-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    ) : (
                      <PowerOff
                        className={`h-4 w-4 ${
                          schedule.active
                            ? "text-red-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    )}
                    <div>
                      <p className="font-medium">{schedule.name}</p>
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{schedule.time}</span>
                        <span>|</span>
                        <span>
                          {Object.entries(schedule.days)
                            .filter(([key, value]) => {
                              console.log(key);
                              return value;
                            })
                            .map(([day]) => day.substring(0, 3))
                            .join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditItem(schedule)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant={schedule.active ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleActive(schedule.id)}
                    >
                      {schedule.active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={handleAddSchedule}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="edit">
            {editItem ? (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Schedule Name</Label>
                    <Input value={editItem.name} onChange={handleUpdateName} />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={editItem.time}
                      onChange={handleUpdateTime}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="action-start"
                        checked={editItem.type === "start"}
                        onCheckedChange={() => handleUpdateType("start")}
                      />
                      <Label
                        htmlFor="action-start"
                        className="flex items-center gap-1"
                      >
                        <Power className="h-4 w-4 text-green-500" />
                        Start PC
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="action-stop"
                        checked={editItem.type === "stop"}
                        onCheckedChange={() => handleUpdateType("stop")}
                      />
                      <Label
                        htmlFor="action-stop"
                        className="flex items-center gap-1"
                      >
                        <PowerOff className="h-4 w-4 text-red-500" />
                        Stop PC
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Repeat on days</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {Object.entries(editItem.days).map(([day, checked]) => (
                      <div
                        key={day}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <Label htmlFor={`day-${day}`} className="text-xs">
                          {day.substring(0, 3)}
                        </Label>
                        <Checkbox
                          id={`day-${day}`}
                          checked={checked}
                          onCheckedChange={() =>
                            handleUpdateDay(day as keyof ScheduleItem["days"])
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditItem(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveChanges}>Save Changes</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <AlarmClock className="h-8 w-8 mb-2" />
                <p>Select a schedule to edit or create a new one</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleAddSchedule}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Schedule
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedScheduling;
