// "use client";
// import AssignUserDialog from "../_components/assign-user-dialog";
// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Play,
//   Plus,
//   ExternalLink,
//   Trash2,
//   Shield,
//   Clock,
//   CalendarClock,
//   Moon,
//   LayoutGrid,
//   List,
//   MoreVertical,
//   StopCircle,
//   AlertCircle,
//   Search,
//   Loader2,
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import SmartPCConfigDialog from "@/app/build-smartpc/_components/smart-pc-config-dialog";
// // import AssignUserDialog from "@/app/build-smartpc/_components/assign-user-dialog";
// import { useRouter } from "next/navigation";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "@/redux/store";
// import {
//   useLaunchVMMutation,
//   useListRemoteDesktopQuery,
//   useStartVMMutation,
//   useStopVMMutation,
// } from "@/api/fileManagerAPI";
// import { useDeleteVMMutation } from "@/api/vmManagement";
// import { DesktopInstance, PC } from "@/app/build-smartpc/types";
// import { mockUsers, stableStates } from "@/app/build-smartpc/data";
// import {
//   getStatusIcon,
//   getStatusText,
//   isBusy,
// } from "@/app/build-smartpc/utils";
// // import SelectedPc from "@/app/build-smartpc/_components/selected-pc";
// import SmartPCEmptyState from "@/app/build-smartpc/_components/smart-pc-empty-state";
// import ScheduleDialog from "@/app/build-smartpc/_components/schedule-dialog";
// import IdleSettingsDialog from "@/app/build-smartpc/_components/idle-settings-dialog";
// import { ConfirmDeleteModal } from "@/app/build-smartpc/_components/confirm-delete-pc-diolog";
// import { setLaunchVMResponse } from "@/redux/slices/dcv/dcv-slice";
// import { routes } from "@/constants/routes";
// import { Checkbox } from "@/components/ui/checkbox";
// import SelectedPc from "@/app/build-smartpc/_components/selected-pc";

// const CloudPCPage = () => {

//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { toast } = useToast();

//   const userId = useSelector((state: RootState) => state.auth.user?.id);
//   const { user } = useSelector((state: RootState) => state.auth);
//   const isMember = user?.role === "member";
//   // console.log("member:", isMember);

//   // console.log({ userId });

//   const [shouldPoll, setShouldPoll] = useState(true);
//   const [currentModal, setCurrentModal] = useState<
//     "schedule" | "delete" | "idle" | null
//   >(null);
//   const [stoppingInstances, setStoppingInstances] = useState<string[]>([]);
//   const [startingInstances, setStartingInstances] = useState<string[]>([]);
//   const [launchingInstances, setLaunchingInstances] = useState<string[]>([]);
//   const [selectedInstance, setSelectedInstance] = useState<{
//     id: string;
//     name: string;
//   } | null>(null);

//   const [selectedPCs, setSelectedPCs] = useState<number[]>([]);
//   const [showDetails, setShowDetails] = useState(true);

//   // const [showCreationModal, setShowCreationModal] = useState(false);

//   const {
//     isError,
//     error,
//     data,
//     isLoading,
//     refetch: refetchRemoteDesktops,
//   } = useListRemoteDesktopQuery(
//     { userId },
//     {
//       skip: !userId,
//       pollingInterval: shouldPoll ? 5000 : 0,
//       refetchOnMountOrArgChange: true,
//       refetchOnReconnect: true,
//       refetchOnFocus: true,
//     }
//   );

//   const [stopVM, { isLoading: isStopping }] = useStopVMMutation();
//   const [startVM] = useStartVMMutation();
//   const [launchVM] = useLaunchVMMutation();
//   const [deleteVM, { isLoading: isDeleting }] = useDeleteVMMutation();

//   // cdfdff

//   const [cloudPCs, setCloudPCs] = useState<PC[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showNewPCDialog, setShowNewPCDialog] = useState(false);
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

//   const [showScheduleDialog, setShowScheduleDialog] = useState(false);
//   const [showIdleDialog, setShowIdleDialog] = useState(false);
//   // const [showAssignUserDialog, setShowAssignUserDialog] = useState(false);
//   // const [selectedPCForUsers, setSelectedPCForUsers] = useState<PC | null>(null);
//   const [showAssignUserDialog, setShowAssignUserDialog] = useState(false);
//   const [selectedPCForAssign, setSelectedPCForAssign] = useState<PC | null>(null);
//   // const [editingPC, setEditingPC] = useState<PC | null>(null);

//   const [selectedIdleTimeout, setSelectedIdleTimeout] = useState<string>("30");
//   const [selectedTimeZone, setSelectedTimeZone] = useState("UTC");
//   const [scheduleFrequency, setScheduleFrequency] = useState("everyday");
//   const [autoStartTime, setAutoStartTime] = useState("");
//   const [autoStopTime, setAutoStopTime] = useState("");
//   const [customStartDate, setCustomStartDate] = useState("");
//   const [customEndDate, setCustomEndDate] = useState("");

//   useEffect(() => {
//     if (isError) {
//       setShouldPoll(false);
//       return;
//     }

//     if (!data || data.length === 0) {
//       setShouldPoll(false);
//       return;
//     }

//     const allStable = data.every(
//       (instance: DesktopInstance) =>
//         instance.state !== undefined && stableStates.includes(instance.state)
//     );

//     setShouldPoll(!allStable);
//   }, [data, isError, error]);

//   useEffect(() => {
//     if (isError || !data) return;

//     const enriched = data.map((pc: PC, index: number) => ({
//       ...pc,
//       assignedUsers: mockUsers.slice(0, (index % mockUsers.length) + 1),
//     }));

//     setCloudPCs(enriched);
//   }, [data]);

//   const handleStop = async (instanceId: string) => {
//     setStoppingInstances(prev => [...prev, instanceId]);
//     try {
//       await stopVM(instanceId).unwrap();
//       toast({
//         title: "SmartPC Stopped",
//         description: "The instance was stopped successfully.",
//       });
//     } catch (error) {
//       console.log(error);
//       toast({
//         title: "Failed to Stop Instance",
//         description: "Something went wrong while stopping the SmartPC.",
//         variant: "destructive",
//       });
//     } finally {
//       setStoppingInstances(prev => prev.filter(id => id !== instanceId));
//     }
//   };

//   const handleStart = async (instanceId: string) => {
//     setStartingInstances(prev => [...prev, instanceId]);
//     try {
//       await startVM(instanceId).unwrap();
//       toast({
//         title: "SmartPC Started",
//         description: "The instance was started successfully.",
//       });
//     } catch (error) {
//       console.log(error);
//       toast({
//         title: "Failed to Start Instance",
//         description:
//           "Unable to start the SmartPC. Please wait a few moments and try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setStartingInstances(prev => prev.filter(id => id !== instanceId));
//     }
//   };

//   const handleLaunch = async (instanceId: string) => {
//     setLaunchingInstances(prev => [...prev, instanceId]);
//     try {
//       const response = await launchVM({
//         instanceId: instanceId,
//         userId: userId,
//       }).unwrap();
//       console.log({ response });
//       dispatch(setLaunchVMResponse({ ...response, instanceId }));
//       router.push(routes?.pcViewer);
//       toast({
//         title: "SmartPC Launched",
//         description: "The instance has been launched successfully.",
//       });
//     } catch (error) {
//       console.log(error);
//       toast({
//         title: "Launch Failed",
//         description: "Failed to start instance. Launch aborted.",
//         variant: "destructive",
//       });
//     } finally {
//       setLaunchingInstances(prev => prev.filter(id => id !== instanceId));
//     }
//   };

//   const handleConfirmDelete = async () => {
//     if (!selectedInstance) return;

//     try {
//       const { id: instanceId, name: instanceName } = selectedInstance;

//       const instance = data?.find(
//         (item: DesktopInstance) => item.instanceId === instanceId
//       );

//       if (instance?.state === "running") {
//         await stopVM(instanceId).unwrap();
//       }

//       if (!instance?.region) {
//         console.warn("Region is missing from instance metadata:", instance);
//         throw new Error("Missing region for selected instance");
//       }

//       await deleteVM({ instanceId, region: instance.region }).unwrap();
//       await refetchRemoteDesktops();

//       toast({
//         title: "SmartPC Deleted",
//         description: `SmartPC "${instanceName}" has been deleted successfully.`,
//       });
//     } catch (error) {
//       console.log("Delete Error:", error);
//       toast({
//         title: "Deletion Failed",
//         description: `Failed to delete SmartPC". Please try again.`,
//         variant: "destructive",
//       });
//     } finally {
//       setSelectedInstance(null);
//     }
//   };

//   const filteredPCs = Array.isArray(data)
//     ? data.filter((pc: PC) => {
//         const query = searchQuery.toLowerCase();
//         return (
//           pc.systemName?.toLowerCase().includes(query) ||
//           pc.description?.toLowerCase().includes(query) ||
//           pc.region?.toLowerCase().includes(query)
//         );
//       })
//     : [];

//   const handlePCSelection = (index: number) => {
//     setSelectedPCs(prev =>
//       prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
//     );
//   };

//   const handleSelectAll = () => {
//     if (selectedPCs.length === filteredPCs.length) {
//       setSelectedPCs([]);
//     } else {
//       setSelectedPCs(filteredPCs.map((_, index) => index));
//     }
//   };

//   const handleScheduleSettings = (pc: PC) => {
//     console.log(pc);
//     // setEditingPC(pc);
//     setSelectedTimeZone(pc.schedule?.timeZone || "UTC");
//     setScheduleFrequency(pc.schedule?.frequency || "everyday");
//     setAutoStartTime(pc.schedule?.start || "");
//     setAutoStopTime(pc.schedule?.end || "");
//     setCustomStartDate("");
//     setCustomEndDate("");
//     setShowScheduleDialog(true);
//   };

//   const handleIdleSettings = (pc: PC) => {
//     // setEditingPC(pc);
//     setSelectedIdleTimeout(String(pc.idleTimeout || "30"));
//     setShowIdleDialog(true);
//   };

//   // const handleAssignUser = (pc: PC) => {
//   //   console.log(pc);

//   //   setSelectedPCForUsers(pc);
//   //   setShowAssignUserDialog(true);
//   // };

//   const handleAssignUser = (pc: PC) => {
//     setSelectedPCForAssign(pc);
//     setShowAssignUserDialog(true);
//   };

//   const handleSaveIdleSettings = () => {

//     setShowIdleDialog(false);

//   };

//   const handleSaveSchedule = () => {

//     setShowScheduleDialog(false);

//   };

//   return (
//     <div className="flex flex-col h-full">
//       <div className="flex flex-col gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-bold">SmartPCs</h1>
//           <p className="text-muted-foreground">Manage your virtual machines</p>
//         </div>
//         <div className="flex items-center gap-4">
//           <div className="relative flex-1">
//             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search PCs by name, description, or region..."
//               className="pl-8"
//               value={searchQuery}
//               onChange={e => setSearchQuery(e.target.value)}
//             />
//           </div>
//           <div className="flex items-center border rounded-lg">
//             <Button
//               variant={viewMode === "grid" ? "secondary" : "ghost"}
//               size="sm"
//               className="rounded-r-none"
//               onClick={() => setViewMode("grid")}
//             >
//               <LayoutGrid className="h-4 w-4" />
//             </Button>
//             <Button
//               variant={viewMode === "list" ? "secondary" : "ghost"}
//               size="sm"
//               className="rounded-l-none"
//               onClick={() => setViewMode("list")}
//             >
//               <List className="h-4 w-4" />
//             </Button>
//           </div>
//           {/* <Button onClick={() => setShowNewPCDialog(true)}>
//             <Plus className="h-4 w-4 mr-2" />
//             Build SmartPC
//           </Button> */}

//           {!isMember && (
//             <Button onClick={() => setShowNewPCDialog(true)}>
//               <Plus className="h-4 w-4 mr-2" />
//               Build SmartPC
//             </Button>
//           )}

//         </div>
//       </div>

//       <div className="flex-1 flex flex-col">
//         {isLoading && (
//           <div className="flex flex-1 items-center justify-center py-20">
//             <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
//           </div>
//         )}

//         {/* Empty State */}
//         {!isLoading &&
//           (!filteredPCs || filteredPCs.length === 0 || isError) && (
//             <SmartPCEmptyState
//               searchQuery={searchQuery}
//               setShowNewPCDialog={setShowNewPCDialog}
//               isError={isError}
//             />
//           )}

//         {!isError && filteredPCs && filteredPCs.length > 0 && (
//           <>
//             {viewMode === "list" ? (
//               <div className="bg-card rounded-lg border border-border">
//                 <div className="p-4">
//                   <div className="flex items-center gap-4 mb-4">
//                     <Checkbox
//                       checked={selectedPCs.length === filteredPCs.length}
//                       onCheckedChange={handleSelectAll}
//                     />
//                     <span className="text-sm text-muted-foreground">
//                       {selectedPCs.length} selected
//                     </span>
//                   </div>

//                   <div className="space-y-1">
//                     {(filteredPCs as PC[]).map((pc, index) => (
//                       <div
//                         key={pc.id}
//                         className={`p-3 rounded-lg border cursor-pointer ${
//                           selectedPCs.includes(index)
//                             ? "border-primary bg-primary/5"
//                             : "border-border"
//                         }`}
//                         onClick={() => handlePCSelection(index)}
//                       >
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-3">
//                             <Checkbox
//                               checked={selectedPCs.includes(index)}
//                               onCheckedChange={() => handlePCSelection(index)}
//                             />
//                             <div>
//                               <div className="flex items-center gap-3">
//                                 <span className="font-medium">
//                                   {pc?.systemName}
//                                 </span>
//                                 <div
//                                   className={`px-2 py-0.5 rounded-md flex items-center gap-1.5 ${
//                                     pc.state === "running"
//                                       ? "bg-green-500/10 text-green-500"
//                                       : pc.state === "stopped"
//                                       ? "bg-red-500/10 text-red-500"
//                                       : pc.state === "initializing"
//                                       ? "bg-yellow-500/10 text-yellow-500"
//                                       : pc.state === "initialization"
//                                       ? "bg-yellow-500/10 text-yellow-500"
//                                       : pc.state === "pending"
//                                       ? "bg-yellow-500/10 text-yellow-500"
//                                       : pc.state === "stopping"
//                                       ? "bg-orange-500/10 text-orange-500"
//                                       : pc.state === "idle"
//                                       ? "bg-blue-500/10 text-blue-500"
//                                       : "bg-gray-500/10 text-gray-500"
//                                   }`}
//                                 >
//                                   {getStatusIcon(pc.state)}
//                                   <span className="text-xs font-medium">
//                                     {getStatusText(pc.state)}
//                                   </span>
//                                 </div>
//                               </div>
//                               <span className="text-xs text-muted-foreground">
//                                 {pc?.description ||
//                                   "High-performance compute instanc"}
//                               </span>
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Button
//                               size="sm"
//                               variant="default"
//                               onClick={() => handleLaunch(pc.instanceId)}
//                               disabled={
//                                 isBusy(pc.state) || pc.state !== "running"
//                               }
//                               className="h-8"
//                             >
//                               <ExternalLink className="h-4 w-4 mr-1.5" />
//                               {launchingInstances.includes(pc.instanceId)
//                                 ? "Launching..."
//                                 : "Launch"}
//                             </Button>
//                             {pc.state === "running" ? (
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => handleStop(pc.instanceId)}
//                                 className="h-8"
//                                 disabled={
//                                   isBusy(pc.state) ||
//                                   stoppingInstances.includes(pc.instanceId)
//                                 }
//                               >
//                                 <StopCircle className="h-4 w-4 mr-1.5" />
//                                 Stop
//                               </Button>
//                             ) : (
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => handleStart(pc.instanceId)}
//                                 className="h-8"
//                                 disabled={
//                                   isBusy(pc.state) ||
//                                   startingInstances.includes(pc.instanceId)
//                                 }
//                               >
//                                 <Play className="h-4 w-4 mr-1.5" />
//                                 Start
//                               </Button>
//                             )}
//                             <DropdownMenu>
//                               <DropdownMenuTrigger
//                                 asChild
//                                 onClick={e => e.stopPropagation()}
//                               >
//                                 <Button variant="ghost" size="icon">
//                                   <MoreVertical className="h-4 w-4" />
//                                 </Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent align="end">
//                                 <DropdownMenuItem
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     handleScheduleSettings(pc);
//                                   }}
//                                 >
//                                   <CalendarClock className="h-4 w-4 mr-2" />
//                                   Schedule
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     handleIdleSettings(pc);
//                                   }}
//                                 >
//                                   <Moon className="h-4 w-4 mr-2" />
//                                   Idle Settings
//                                 </DropdownMenuItem>
//                                 {!isMember && (
//                                 <DropdownMenuItem
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     handleAssignUser(pc);
//                                   }}
//                                 >
//                                   <Plus className="h-4 w-4 mr-2" />
//                                   Assign User
//                                 </DropdownMenuItem>
//                               )}
//                                 <DropdownMenuSeparator />
//                                 {!isMember && (
//                                   <DropdownMenuItem
//                                     className="text-destructive"
//                                     onClick={() => {
//                                       setSelectedInstance({
//                                         id: pc.instanceId,
//                                         name: pc.systemName,
//                                       });
//                                       setCurrentModal("delete");
//                                     }}
//                                   >
//                                     <Trash2 className="h-4 w-4 mr-2" />
//                                     Delete
//                                   </DropdownMenuItem>

//                                 )}
//                                 {/* <DropdownMenuItem
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     handleAssignUser(pc);
//                                   }}
//                                 >
//                                   <Plus className="h-4 w-4 mr-2" />
//                                   Assign User
//                                 </DropdownMenuItem> */}

//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {(filteredPCs as PC[]).map((pc, index) => (
//                   <Card
//                     key={pc.id}
//                     // className={`relative`}
//                     className={`relative ${
//                       selectedPCs.includes(index) ? "border-primary" : ""
//                     }`}
//                     onClick={() => handlePCSelection(index)}
//                   >
//                     <CardHeader>
//                       <div className="flex items-start justify-between">
//                         <div className="flex items-start gap-3">
//                           <Checkbox
//                             checked={selectedPCs.includes(index)}
//                             onCheckedChange={() => handlePCSelection(index)}
//                             className="mt-1"
//                           />
//                           <div>
//                             <CardTitle className="mb-2">
//                               {pc?.systemName}
//                             </CardTitle>
//                             <div
//                               className={`px-2 py-1 rounded-md inline-flex items-center gap-2 ${
//                                 pc.state === "running"
//                                   ? "bg-green-500/10 text-green-500"
//                                   : pc.state === "stopped"
//                                   ? "bg-red-500/10 text-red-500"
//                                   : pc.state === "initializing"
//                                   ? "bg-yellow-500/10 text-yellow-500"
//                                   : pc.state === "initialization"
//                                   ? "bg-yellow-500/10 text-yellow-500"
//                                   : pc.state === "pending"
//                                   ? "bg-yellow-500/10 text-yellow-500"
//                                   : pc.state === "stopping"
//                                   ? "bg-orange-500/10 text-orange-500"
//                                   : pc.state === "idle"
//                                   ? "bg-blue-500/10 text-blue-500"
//                                   : "bg-gray-500/10 text-gray-500"
//                               }`}
//                             >
//                               {getStatusIcon(pc.state)}
//                               <span className="text-sm font-medium">
//                                 {getStatusText(pc.state)}
//                               </span>
//                             </div>
//                             <CardDescription className="mt-2">
//                               {pc?.description ||
//                                 "High-performance compute instanc"}
//                             </CardDescription>
//                           </div>
//                         </div>
//                         <DropdownMenu>
//                           <DropdownMenuTrigger
//                             asChild
//                             onClick={e => e.stopPropagation()}
//                           >
//                             <Button variant="ghost" size="icon">
//                               <MoreVertical className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem
//                               onClick={e => {
//                                 e.stopPropagation();
//                                 handleScheduleSettings(pc);
//                               }}
//                             >
//                               <CalendarClock className="h-4 w-4 mr-2" />
//                               Schedule
//                             </DropdownMenuItem>
//                             <DropdownMenuItem
//                               onClick={e => {
//                                 e.stopPropagation();
//                                 handleIdleSettings(pc);
//                               }}
//                             >
//                               <Moon className="h-4 w-4 mr-2" />
//                               Idle Settings
//                             </DropdownMenuItem>
//                             {!isMember && (
//                             <DropdownMenuItem
//                               onClick={e => {
//                                 e.stopPropagation();
//                                 handleAssignUser(pc);
//                               }}
//                             >
//                               <Plus className="h-4 w-4 mr-2" />
//                               Assign User
//                             </DropdownMenuItem>
//                           )}
//                             <DropdownMenuSeparator />
//                             {!isMember && (
//                             <DropdownMenuItem
//                               className="text-destructive"
//                               onClick={() => {
//                                 setSelectedInstance({
//                                   id: pc.instanceId,
//                                   name: pc.systemName,
//                                 });
//                                 setCurrentModal("delete");
//                               }}
//                             >
//                               <Trash2 className="h-4 w-4 mr-2" />
//                               Delete
//                             </DropdownMenuItem>
//                           )}
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-4">
//                         <div className="grid grid-cols-2 gap-4 text-sm">
//                           <div className="flex items-center gap-2">
//                             <Clock className="h-4 w-4 text-muted-foreground" />
//                             <span>2h 36m uptime</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Shield className="h-4 w-4 text-muted-foreground" />
//                             <span>us-east-1</span>
//                           </div>
//                           <div className="flex items-center gap-2 text-muted-foreground">
//                             <CalendarClock className="h-4 w-4" />
//                             <span>09:00 - 17:00</span>
//                           </div>
//                           <div className="flex items-center gap-2 text-muted-foreground">
//                             <Clock className="h-4 w-4" />
//                             <span>Idle: 15m</span>
//                           </div>
//                         </div>
//                         <div className="flex items-center justify-between border-t pt-4 mt-2">
//                           <div className="flex items-center gap-2">
//                             <AlertCircle className="h-4 w-4 text-muted-foreground" />
//                             <span className="text-sm">$42.99 this month</span>
//                           </div>
//                           <div className="flex items-center gap-4">
//                             <Button
//                               size="sm"
//                               variant="default"
//                               onClick={() => handleLaunch(pc.instanceId)}
//                               disabled={
//                                 isBusy(pc.state) || pc.state !== "running"
//                               }
//                               className="h-8"
//                             >
//                               <ExternalLink className="h-4 w-4 mr-1.5" />
//                               {launchingInstances.includes(pc.instanceId)
//                                 ? "Launching..."
//                                 : "Launch"}
//                             </Button>
//                             {pc.state === "running" ? (
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => handleStop(pc.instanceId)}
//                                 className="h-8"
//                                 disabled={
//                                   isBusy(pc.state) ||
//                                   stoppingInstances.includes(pc.instanceId)
//                                 }
//                               >
//                                 <StopCircle className="h-4 w-4 mr-1.5" />
//                                 {stoppingInstances.includes(pc.instanceId)
//                                   ? "Stopping..."
//                                   : "Stop"}
//                               </Button>
//                             ) : (
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => handleStart(pc.instanceId)}
//                                 className="h-8"
//                                 disabled={
//                                   isBusy(pc.state) ||
//                                   startingInstances.includes(pc.instanceId)
//                                 }
//                               >
//                                 <Play className="h-4 w-4 mr-1.5" />
//                                 {startingInstances.includes(pc.instanceId)
//                                   ? "Starting..."
//                                   : "Start"}
//                               </Button>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </>
//         )}
//         {/* Details Panel */}
//         <SelectedPc
//           selectedPCs={selectedPCs}
//           showDetails={showDetails}
//           setShowDetails={setShowDetails}
//           cloudPCs={cloudPCs}
//           setCloudPCs={setCloudPCs}
//           handleAssignUser={handleAssignUser}
//         />
//       </div>

//       <SmartPCConfigDialog
//         setShowNewPCDialog={setShowNewPCDialog}
//         showNewPCDialog={showNewPCDialog}
//       />

//       {/* Add Schedule Dialog */}
//       <ScheduleDialog
//         open={showScheduleDialog}
//         onOpenChange={setShowScheduleDialog}
//         selectedTimeZone={selectedTimeZone}
//         setSelectedTimeZone={setSelectedTimeZone}
//         scheduleFrequency={scheduleFrequency}
//         setScheduleFrequency={setScheduleFrequency}
//         customStartDate={customStartDate}
//         setCustomStartDate={setCustomStartDate}
//         customEndDate={customEndDate}
//         setCustomEndDate={setCustomEndDate}
//         autoStartTime={autoStartTime}
//         setAutoStartTime={setAutoStartTime}
//         autoStopTime={autoStopTime}
//         setAutoStopTime={setAutoStopTime}
//         onSave={handleSaveSchedule}
//       />

//       {/* Add Idle Settings Dialog */}
//       <IdleSettingsDialog
//         open={showIdleDialog}
//         onOpenChange={setShowIdleDialog}
//         // editingPC={editingPC}
//         selectedIdleTimeout={selectedIdleTimeout}
//         setSelectedIdleTimeout={setSelectedIdleTimeout}
//         onSave={handleSaveIdleSettings}
//       />

//       {currentModal === "delete" && selectedInstance && (
//         <ConfirmDeleteModal
//           isOpen={true}
//           onClose={() => setCurrentModal(null)}
//           onConfirm={handleConfirmDelete}
//           desktopName={selectedInstance.name}
//           isDeleting={isDeleting || isLoading || isStopping}
//         />
//       )}

//       {/* Assign User Dialog */}
//       {/* <AssignUserDialog
//       open={showAssignUserDialog}
//       onOpenChange={setShowAssignUserDialog}
//       //@ts-ignore
//       pc={selectedPCForUsers}
//       onSuccess={refetchRemoteDesktops} // (or a reload/refresh handler so list is up to date)
//     /> */}
//     <AssignUserDialog
//       open={showAssignUserDialog}
//       onOpenChange={setShowAssignUserDialog}
//       pc={selectedPCForAssign}
//       onSuccess={refetchRemoteDesktops}
//     />

//     </div>
//   );
// };

// export default CloudPCPage;

"use client";
import AssignUserDialog from "../_components/assign-user-dialog";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Plus,
  ExternalLink,
  Trash2,
  Shield,
  Clock,
  CalendarClock,
  Moon,
  LayoutGrid,
  List,
  MoreVertical,
  StopCircle,
  AlertCircle,
  Search,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import SmartPCConfigDialog from "@/app/build-smartpc/_components/smart-pc-config-dialog";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useLaunchVMMutation,
  useListRemoteDesktopQuery,
  useStartVMMutation,
  useStopVMMutation,
} from "@/api/fileManagerAPI";
import { useDeleteVMMutation } from "@/api/vmManagement";
import { DesktopInstance, PC } from "@/app/build-smartpc/types";
import { mockUsers, stableStates } from "@/app/build-smartpc/data";
import {
  getStatusIcon,
  getStatusText,
  isBusy,
} from "@/app/build-smartpc/utils";
import SmartPCEmptyState from "@/app/build-smartpc/_components/smart-pc-empty-state";
import ScheduleDialog from "@/app/build-smartpc/_components/schedule-dialog";
import IdleSettingsDialog from "@/app/build-smartpc/_components/idle-settings-dialog";
import { ConfirmDeleteModal } from "@/app/build-smartpc/_components/confirm-delete-pc-diolog";
import { setLaunchVMResponse } from "@/redux/slices/dcv/dcv-slice";
import { routes } from "@/constants/routes";
import { Checkbox } from "@/components/ui/checkbox";
import SelectedPc from "@/app/build-smartpc/_components/selected-pc";

// REALTIME API IMPORT - NEW
import { fetchInstanceDetails, InstanceDetail } from "@/api/realtime";

const CloudPCPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();

  // --- USER LOGIC START ---
  const { user } = useSelector((state: RootState) => state.auth);

  function getApiUserId(user: any) {
    if (!user) return "";
    // Support either ownerid or "custom:ownerid"
    if (user.role === "member" || user.role === "admin") {
      return user.ownerid;
    }
    console.log("DEBUG: ownerid");
    console.log(user);
    return user.id;
  }
  const apiUserId = getApiUserId(user);

  const isMember = user?.role === "member";
  // --- USER LOGIC END ---

  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const [shouldPoll, setShouldPoll] = useState(true);
  const [currentModal, setCurrentModal] = useState<
    "schedule" | "delete" | "idle" | null
  >(null);
  const [stoppingInstances, setStoppingInstances] = useState<string[]>([]);
  const [startingInstances, setStartingInstances] = useState<string[]>([]);
  const [launchingInstances, setLaunchingInstances] = useState<string[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [selectedPCs, setSelectedPCs] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(true);

  const {
    isError,
    error,
    data,
    isLoading,
    refetch: refetchRemoteDesktops,
  } = useListRemoteDesktopQuery(
    { userId },
    {
      skip: !userId,
      pollingInterval: shouldPoll ? 5000 : 0,
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
      refetchOnFocus: true,
    }
  );

  const [stopVM, { isLoading: isStopping }] = useStopVMMutation();
  const [startVM] = useStartVMMutation();
  const [launchVM] = useLaunchVMMutation();
  const [deleteVM, { isLoading: isDeleting }] = useDeleteVMMutation();

  const [cloudPCs, setCloudPCs] = useState<PC[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPCDialog, setShowNewPCDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showIdleDialog, setShowIdleDialog] = useState(false);
  const [showAssignUserDialog, setShowAssignUserDialog] = useState(false);
  const [selectedPCForAssign, setSelectedPCForAssign] = useState<PC | null>(
    null
  );

  const [selectedIdleTimeout, setSelectedIdleTimeout] = useState<string>("30");
  const [selectedTimeZone, setSelectedTimeZone] = useState("UTC");
  const [scheduleFrequency, setScheduleFrequency] = useState("everyday");
  const [autoStartTime, setAutoStartTime] = useState("");
  const [autoStopTime, setAutoStopTime] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // --- REALTIME PC STATE START ---
  // { [systemName]: InstanceDetail }
  const [realtimePcInfo, setRealtimePcInfo] = useState<
    Record<string, InstanceDetail>
  >({});
  // --- REALTIME PC STATE END ---

  useEffect(() => {
    if (isError) {
      setShouldPoll(false);
      return;
    }

    if (!data || data.length === 0) {
      setShouldPoll(false);
      return;
    }

    const allStable = data.every(
      (instance: DesktopInstance) =>
        instance.state !== undefined && stableStates.includes(instance.state)
    );

    setShouldPoll(!allStable);
  }, [data, isError, error]);

  useEffect(() => {
    if (isError || !data) return;

    const enriched = data.map((pc: PC, index: number) => ({
      ...pc,
      assignedUsers: mockUsers.slice(0, (index % mockUsers.length) + 1),
    }));

    setCloudPCs(enriched);
  }, [data]);

  // --- FETCH REALTIME INSTANCE METRICS ---
  useEffect(() => {
    console.log("DEBUG EFFECT: apiUserId", apiUserId);
    console.log("DEBUG EFFECT: cloudPCs", cloudPCs);
    // Only fetch if you have API user id and at least one PC
    if (!apiUserId || !Array.isArray(cloudPCs) || cloudPCs.length === 0) return;
    const instanceNames = cloudPCs.map((pc) => pc.systemName);

    // Fetch real-time details
    fetchInstanceDetails(apiUserId, instanceNames)
      .then((details) => {
        console.log("Realtime details", details);
        const map: Record<string, InstanceDetail> = {};
        details.forEach((d) => {
          if (d.systemName) map[d.systemName] = d;
        });
        setRealtimePcInfo(map);
      })
      .catch((err) => {
        setRealtimePcInfo({});
        console.error("Failed to fetch real-time PC info", err);
      });
  }, [apiUserId, cloudPCs]);

  //---------------------------------

  const handleStop = async (instanceId: string) => {
    setStoppingInstances((prev) => [...prev, instanceId]);
    try {
      await stopVM(instanceId).unwrap();
      toast({
        title: "SmartPC Stopped",
        description: "The instance was stopped successfully.",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Failed to Stop Instance",
        description: "Something went wrong while stopping the SmartPC.",
        variant: "destructive",
      });
    } finally {
      setStoppingInstances((prev) => prev.filter((id) => id !== instanceId));
    }
  };

  const handleStart = async (instanceId: string) => {
    setStartingInstances((prev) => [...prev, instanceId]);
    try {
      await startVM(instanceId).unwrap();
      toast({
        title: "SmartPC Started",
        description: "The instance was started successfully.",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Failed to Start Instance",
        description:
          "Unable to start the SmartPC. Please wait a few moments and try again.",
        variant: "destructive",
      });
    } finally {
      setStartingInstances((prev) => prev.filter((id) => id !== instanceId));
    }
  };

  const handleLaunch = async (instanceId: string) => {
    setLaunchingInstances((prev) => [...prev, instanceId]);
    try {
      const response = await launchVM({
        instanceId: instanceId,
        userId: userId,
      }).unwrap();
      console.log({ response });
      toast({
        title: "SmartPC Launched",
        description:
          "The instance has been launched successfully. Redirecting...",
      });
      dispatch(setLaunchVMResponse({ ...response, instanceId }));
      // setTimeout(() => {
      //   router.push(routes?.pcViewer);
      // }, 4000);
      window.open(routes?.pcViewer, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.log(error);
      toast({
        title: "Launch Failed",
        description: "Failed to start instance. Launch aborted.",
        variant: "destructive",
      });
    } finally {
      setLaunchingInstances((prev) => prev.filter((id) => id !== instanceId));
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedInstance) return;

    try {
      const { id: instanceId, name: instanceName } = selectedInstance;

      const instance = data?.find(
        (item: DesktopInstance) => item.instanceId === instanceId
      );

      if (instance?.state === "running") {
        await stopVM(instanceId).unwrap();
      }

      if (!instance?.region) {
        console.warn("Region is missing from instance metadata:", instance);
        throw new Error("Missing region for selected instance");
      }

      await deleteVM({ instanceId, region: instance.region }).unwrap();
      await refetchRemoteDesktops();

      toast({
        title: "SmartPC Deleted",
        description: `SmartPC "${instanceName}" has been deleted successfully.`,
      });
    } catch (error) {
      console.log("Delete Error:", error);
      toast({
        title: "Deletion Failed",
        description: `Failed to delete SmartPC". Please try again.`,
        variant: "destructive",
      });
    } finally {
      setSelectedInstance(null);
    }
  };

  const filteredPCs = Array.isArray(data)
    ? data.filter((pc: PC) => {
        const query = searchQuery.toLowerCase();
        return (
          pc.systemName?.toLowerCase().includes(query) ||
          pc.description?.toLowerCase().includes(query) ||
          pc.region?.toLowerCase().includes(query)
        );
      })
    : [];

  const handlePCSelection = (index: number) => {
    setSelectedPCs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    if (selectedPCs.length === filteredPCs.length) {
      setSelectedPCs([]);
    } else {
      setSelectedPCs(filteredPCs.map((_, index) => index));
    }
  };

  const handleScheduleSettings = (pc: PC) => {
    setSelectedTimeZone(pc.schedule?.timeZone || "UTC");
    setScheduleFrequency(pc.schedule?.frequency || "everyday");
    setAutoStartTime(pc.schedule?.start || "");
    setAutoStopTime(pc.schedule?.end || "");
    setCustomStartDate("");
    setCustomEndDate("");
    setShowScheduleDialog(true);
  };

  const handleIdleSettings = (pc: PC) => {
    setSelectedIdleTimeout(String(pc.idleTimeout || "30"));
    setShowIdleDialog(true);
  };

  const handleAssignUser = (pc: PC) => {
    setSelectedPCForAssign(pc);
    setShowAssignUserDialog(true);
  };

  const handleSaveIdleSettings = () => {
    setShowIdleDialog(false);
  };

  const handleSaveSchedule = () => {
    setShowScheduleDialog(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">SmartPCs</h1>
          <p className="text-muted-foreground">Manage your virtual machines</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search PCs by name, description, or region..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          {!isMember && (
            <Button onClick={() => setShowNewPCDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Build SmartPC
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {isLoading && (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {/* Empty State */}
        {!isLoading &&
          (!filteredPCs || filteredPCs.length === 0 || isError) && (
            <SmartPCEmptyState
              searchQuery={searchQuery}
              setShowNewPCDialog={setShowNewPCDialog}
              isError={isError}
            />
          )}
        {!isError && filteredPCs && filteredPCs.length > 0 && (
          <>
            {/* --- LIST VIEW --- */}
            {viewMode === "list" ? (
              <div className="bg-card rounded-lg border border-border">
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Checkbox
                      checked={selectedPCs.length === filteredPCs.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedPCs.length} selected
                    </span>
                  </div>

                  <div className="space-y-1">
                    {(filteredPCs as PC[]).map((pc, index) => {
                      const pcInfo = realtimePcInfo[pc.systemName];

                      return (
                        <div
                          key={pc.id}
                          className={`p-3 rounded-lg border cursor-pointer ${
                            selectedPCs.includes(index)
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                          onClick={() => handlePCSelection(index)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedPCs.includes(index)}
                                onCheckedChange={() => handlePCSelection(index)}
                              />
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">
                                    {pc?.systemName}
                                  </span>
                                  <div
                                    className={`px-2 py-0.5 rounded-md flex items-center gap-1.5 ${
                                      pc.state === "running"
                                        ? "bg-green-500/10 text-green-500"
                                        : pc.state === "stopped"
                                        ? "bg-red-500/10 text-red-500"
                                        : pc.state === "initializing"
                                        ? "bg-yellow-500/10 text-yellow-500"
                                        : pc.state === "initialization"
                                        ? "bg-yellow-500/10 text-yellow-500"
                                        : pc.state === "pending"
                                        ? "bg-yellow-500/10 text-yellow-500"
                                        : pc.state === "stopping"
                                        ? "bg-orange-500/10 text-orange-500"
                                        : pc.state === "idle"
                                        ? "bg-blue-500/10 text-blue-500"
                                        : "bg-gray-500/10 text-gray-500"
                                    }`}
                                  >
                                    {getStatusIcon(pc.state)}
                                    <span className="text-xs font-medium">
                                      {getStatusText(pc.state)}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {pc?.description ||
                                    "High-performance compute instanc"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleLaunch(pc.instanceId)}
                                disabled={
                                  isBusy(pc.state) || pc.state !== "running"
                                }
                                className="h-8"
                              >
                                <ExternalLink className="h-4 w-4 mr-1.5" />
                                {launchingInstances.includes(pc.instanceId)
                                  ? "Launching..."
                                  : "Launch"}
                              </Button>
                              {pc.state === "running" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStop(pc.instanceId)}
                                  className="h-8"
                                  disabled={
                                    isBusy(pc.state) ||
                                    stoppingInstances.includes(pc.instanceId)
                                  }
                                >
                                  <StopCircle className="h-4 w-4 mr-1.5" />
                                  Stop
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStart(pc.instanceId)}
                                  className="h-8"
                                  disabled={
                                    isBusy(pc.state) ||
                                    startingInstances.includes(pc.instanceId)
                                  }
                                >
                                  <Play className="h-4 w-4 mr-1.5" />
                                  Start
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleScheduleSettings(pc);
                                    }}
                                  >
                                    <CalendarClock className="h-4 w-4 mr-2" />
                                    Schedule
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleIdleSettings(pc);
                                    }}
                                  >
                                    <Moon className="h-4 w-4 mr-2" />
                                    Idle Settings
                                  </DropdownMenuItem>
                                  {!isMember && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAssignUser(pc);
                                      }}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Assign User
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  {!isMember && (
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => {
                                        setSelectedInstance({
                                          id: pc.instanceId,
                                          name: pc.systemName,
                                        });
                                        setCurrentModal("delete");
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          {/* --- REALTIME INFO --- */}
                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{pcInfo?.uptime || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span>{pcInfo?.region || "—"}</span>
                            </div>
                          </div>
                          {/* --- END REALTIME INFO --- */}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              // --- GRID VIEW ---
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(filteredPCs as PC[]).map((pc, index) => {
                  const pcInfo = realtimePcInfo[pc.systemName];
                  return (
                    <Card
                      key={pc.id}
                      className={`relative ${
                        selectedPCs.includes(index) ? "border-primary" : ""
                      }`}
                      onClick={() => handlePCSelection(index)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedPCs.includes(index)}
                              onCheckedChange={() => handlePCSelection(index)}
                              className="mt-1"
                            />
                            <div>
                              <CardTitle className="mb-2">
                                {pc?.systemName}
                              </CardTitle>
                              <div
                                className={`px-2 py-1 rounded-md inline-flex items-center gap-2 ${
                                  pc.state === "running"
                                    ? "bg-green-500/10 text-green-500"
                                    : pc.state === "stopped"
                                    ? "bg-red-500/10 text-red-500"
                                    : pc.state === "initializing"
                                    ? "bg-yellow-500/10 text-yellow-500"
                                    : pc.state === "initialization"
                                    ? "bg-yellow-500/10 text-yellow-500"
                                    : pc.state === "pending"
                                    ? "bg-yellow-500/10 text-yellow-500"
                                    : pc.state === "stopping"
                                    ? "bg-orange-500/10 text-orange-500"
                                    : pc.state === "idle"
                                    ? "bg-blue-500/10 text-blue-500"
                                    : "bg-gray-500/10 text-gray-500"
                                }`}
                              >
                                {getStatusIcon(pc.state)}
                                <span className="text-sm font-medium">
                                  {getStatusText(pc.state)}
                                </span>
                              </div>
                              <CardDescription className="mt-2">
                                {pc?.description ||
                                  "High-performance compute instanc"}
                              </CardDescription>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleScheduleSettings(pc);
                                }}
                              >
                                <CalendarClock className="h-4 w-4 mr-2" />
                                Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleIdleSettings(pc);
                                }}
                              >
                                <Moon className="h-4 w-4 mr-2" />
                                Idle Settings
                              </DropdownMenuItem>
                              {!isMember && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAssignUser(pc);
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Assign User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {!isMember && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedInstance({
                                      id: pc.instanceId,
                                      name: pc.systemName,
                                    });
                                    setCurrentModal("delete");
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* --- REALTIME INFO --- */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{pcInfo?.uptime || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span>{pcInfo?.region || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <CalendarClock className="h-4 w-4" />
                              <span>09:00 - 17:00</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>Idle: 15m</span>
                            </div>
                          </div>
                          {/* --- END REALTIME INFO --- */}
                          <div className="flex items-center justify-between border-t pt-4 mt-2">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">$42.99 this month</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleLaunch(pc.instanceId)}
                                disabled={
                                  isBusy(pc.state) || pc.state !== "running"
                                }
                                className="h-8"
                              >
                                <ExternalLink className="h-4 w-4 mr-1.5" />
                                {launchingInstances.includes(pc.instanceId)
                                  ? "Launching..."
                                  : "Launch"}
                              </Button>
                              {pc.state === "running" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStop(pc.instanceId)}
                                  className="h-8"
                                  disabled={
                                    isBusy(pc.state) ||
                                    stoppingInstances.includes(pc.instanceId)
                                  }
                                >
                                  <StopCircle className="h-4 w-4 mr-1.5" />
                                  {stoppingInstances.includes(pc.instanceId)
                                    ? "Stopping..."
                                    : "Stop"}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStart(pc.instanceId)}
                                  className="h-8"
                                  disabled={
                                    isBusy(pc.state) ||
                                    startingInstances.includes(pc.instanceId)
                                  }
                                >
                                  <Play className="h-4 w-4 mr-1.5" />
                                  {startingInstances.includes(pc.instanceId)
                                    ? "Starting..."
                                    : "Start"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
        {/* Details Panel */}
        <SelectedPc
          selectedPCs={selectedPCs}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          cloudPCs={cloudPCs}
          setCloudPCs={setCloudPCs}
          handleAssignUser={handleAssignUser}
        />
      </div>

      <SmartPCConfigDialog
        setShowNewPCDialog={setShowNewPCDialog}
        showNewPCDialog={showNewPCDialog}
      />

      {/* Add Schedule Dialog */}
      <ScheduleDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        selectedTimeZone={selectedTimeZone}
        setSelectedTimeZone={setSelectedTimeZone}
        scheduleFrequency={scheduleFrequency}
        setScheduleFrequency={setScheduleFrequency}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        autoStartTime={autoStartTime}
        setAutoStartTime={setAutoStartTime}
        autoStopTime={autoStopTime}
        setAutoStopTime={setAutoStopTime}
        onSave={handleSaveSchedule}
      />

      {/* Add Idle Settings Dialog */}
      <IdleSettingsDialog
        open={showIdleDialog}
        onOpenChange={setShowIdleDialog}
        selectedIdleTimeout={selectedIdleTimeout}
        setSelectedIdleTimeout={setSelectedIdleTimeout}
        onSave={handleSaveIdleSettings}
      />

      {currentModal === "delete" && selectedInstance && (
        <ConfirmDeleteModal
          isOpen={true}
          onClose={() => setCurrentModal(null)}
          onConfirm={handleConfirmDelete}
          desktopName={selectedInstance.name}
          isDeleting={isDeleting || isLoading || isStopping}
        />
      )}

      {/* Assign User Dialog */}
      <AssignUserDialog
        open={showAssignUserDialog}
        onOpenChange={setShowAssignUserDialog}
        pc={selectedPCForAssign}
        onSuccess={refetchRemoteDesktops}
      />
    </div>
  );
};

export default CloudPCPage;
