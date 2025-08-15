"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowDown, ArrowUp } from "lucide-react";
import { selectUserId } from "@/redux/slices/auth/auth-slice";
import { useSelector } from "react-redux";
import { useGetTicketsQuery } from "@/api/supportAPI";
import TicketTableSkeleton from "./ticket-table-skeleton";
import { useRouter } from "next/navigation";
import { getStatusBadgeClass } from "../utils/get-status-badge-class";
import { formatDate, formatRelativeTime } from "@/lib/utils/format-time";

export default function TicketTable() {
  const router = useRouter();
  const userId = useSelector(selectUserId);

  const { data, isFetching } = useGetTicketsQuery(
    { userId: userId! },
    { skip: !userId }
  );

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("any");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const tickets = data?.tickets ?? [];

  const toggleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filtered = useMemo(() => {
    const sorted = [...tickets].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    });

    return sorted.filter((t) => {
      const matchQuery =
        t.subject.toLowerCase().includes(query.toLowerCase()) ||
        t.ticketId.toLowerCase().includes(query.toLowerCase());
      const matchStatus =
        statusFilter === "any" || t.status.toLowerCase() === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [tickets, query, statusFilter, sortDirection]);

  const SortIcon = () =>
    sortDirection === "asc" ? (
      <ArrowUp className="inline h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="inline h-4 w-4 ml-1" />
    );

  const handleTicketClick = (ticketId: string) => {
    router.push(`/dashboard/support/ticket/${ticketId}`);
  };

  if (isFetching) return <TicketTableSkeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Tickets</CardTitle>
        <CardDescription>Track and manage your requests</CardDescription>

        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search requests"
              className="pl-9 rounded-full"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <div className="grid grid-cols-4 md:grid-cols-6 p-4 font-medium border-b bg-muted/50 text-sm text-muted-foreground">
            <div
              className="col-span-1 flex items-center cursor-pointer"
              onClick={toggleSort}
            >
              Created <SortIcon />
            </div>
            <div className="col-span-1">ID</div>
            <div className="col-span-2">Subject</div>
            <div className="hidden md:block">Last activity</div>
            <div className="hidden md:block">Status</div>
          </div>

          {filtered.length > 0 ? (
            filtered.map((ticket) => (
              <div
                key={ticket.ticketId}
                onClick={() => handleTicketClick(ticket.ticketId)}
                className="grid grid-cols-4 md:grid-cols-6 p-4 cursor-pointer hover:bg-muted/50 text-sm"
              >
                <div>{formatDate(ticket.createdAt)}</div>
                <div className="text-muted-foreground">#{ticket.ticketId}</div>
                <div className="col-span-2 truncate">{ticket.subject}</div>
                <div className="hidden md:block">
                  {formatRelativeTime(ticket.lastUpdated || ticket.createdAt)}
                </div>
                <div className="hidden md:block">
                  <span className={getStatusBadgeClass(ticket.status)}>
                    {ticket.status.charAt(0).toUpperCase() +
                      ticket.status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No tickets found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
