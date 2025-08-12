"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import TicketConversation from "../../_components/ticket-conversation";
import { format } from "date-fns";
import {
  useAssignTicketMutation,
  useGetTicketByIdQuery,
  useUpdateTicketStatusMutation,
} from "@/api/supportAPI";
import PrioritySelectField from "../../_components/priority-select-field";
import { getStatusBadgeClass } from "../../_components/get-status-badge-class";

const formatLabel = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1).replace("-", " ");

const TicketDetailPage = () => {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const userId = useSelector((state: RootState) => state.auth.user?.id) || "";
  const ticketId = params.id as string;

  const [priority, setPriority] = useState<string>("");

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateTicketStatusMutation();
  const [assignTicket] = useAssignTicketMutation();

  const {
    data: ticket,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetTicketByIdQuery(
    { userId, id: ticketId },
    { skip: !userId || !ticketId }
  );

  useEffect(() => {
    if (ticket) setPriority(ticket.priority ?? "");
  }, [ticket?.id, ticket?.priority]);

  const handleStatusChange = async (value: string) => {
    try {
      await updateStatus({ userId, id: ticketId, status: value }).unwrap();

      toast({ title: `Status updated to ${value}` });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const handlePriorityChange = async (value: string) => {
    setPriority(value);

    await assignTicket({ userId, id: ticketId, assignedTo: userId }).unwrap();

    toast({ title: `Priority updated to ${value}` });
  };

  if (isLoading || isFetching) return <div>Loading...</div>;

  const isClosed = ticket.status === "closed";

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard/support")}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Support
      </Button>

      {/* Subject and status */}
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">{ticket.subject}</h1>
        <div className={getStatusBadgeClass(ticket.status)}>
          {formatLabel(ticket.status)}
        </div>
      </div>

      {/* Description */}
      <div className="bg-muted/50 p-4 border text-sm text-muted-foreground rounded-md whitespace-pre-line">
        {ticket.description}
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_420px] gap-6 w-full">
        {/* Left: Ticket Conversation */}
        <div className="w-full">
          <TicketConversation
            ticketId={ticketId}
            userId={userId}
            isClosed={isClosed}
            ticketStatus={ticket.status}
            senderType="customer"
          />
        </div>

        {/* Right: Ticket Info */}
        <div className="w-full space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                <div className="text-muted-foreground">Email</div>
                <div className="truncate">{ticket.email}</div>

                <div className="text-muted-foreground">Role</div>
                <div className="capitalize">{ticket.role || "N/A"}</div>

                <div className="text-muted-foreground">Ticket ID</div>
                <div className="break-all">{ticket.ticketId}</div>

                <div className="text-muted-foreground">Created</div>
                <div>{format(new Date(ticket.createdAt), "PPpp")}</div>

                <div className="text-muted-foreground">Category</div>
                <div className="capitalize">{ticket.category}</div>

                <div className="text-muted-foreground">Status</div>
                <div>
                  <span className={getStatusBadgeClass(ticket.status)}>
                    {formatLabel(ticket.status)}
                  </span>
                </div>

                <div className="text-muted-foreground">Priority</div>
                <div>
                  <PrioritySelectField
                    value={priority}
                    setValue={handlePriorityChange}
                    disabled={isClosed}
                  />
                </div>
              </div>

              {!isClosed && (
                <Button
                  variant="outline"
                  className="w-full gap-1 mt-3"
                  onClick={() => handleStatusChange("resolved")}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Resolved
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
