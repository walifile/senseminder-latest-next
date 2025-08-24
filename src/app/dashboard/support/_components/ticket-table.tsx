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
import { selectUserId, selectUserEmail } from "@/redux/slices/auth/auth-slice";
import { useSelector } from "react-redux";
import { useGetTicketsQuery } from "@/api/supportAPI";
import TicketTableSkeleton from "./ticket-table-skeleton";
import { useRouter } from "next/navigation";
import { getStatusBadgeClass } from "../utils/get-status-badge-class";
import { formatDate, formatRelativeTime } from "@/lib/utils/format-time";
import { shortEmail } from "@/lib/utils/format-string";

export default function TicketTable() {
  const router = useRouter();
  const userId = useSelector(selectUserId);
  const userEmail = useSelector(selectUserEmail);

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

  const handleTicketClick = (ticketId: string, ticketEmail?: string) => {
    if (ticketEmail === userEmail) {
      router.push(`/dashboard/support/ticket/${ticketId}`);
    }
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
        <div className="overflow-auto rounded border">
          <table className="min-w-[1000px] w-full text-sm border-collapse">
            <thead className="bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-muted/50">
              <tr>
                <th
                  className="px-4 py-3 text-left cursor-pointer border-b border-border"
                  onClick={toggleSort}
                >
                  Created <SortIcon />
                </th>
                <th className="px-4 py-3 text-left border-b border-border">
                  ID
                </th>
                <th className="px-4 py-3 text-left border-b border-border">
                  Subject
                </th>
                <th className="px-4 py-3 text-left border-b border-border">
                  Last activity
                </th>
                <th className="px-4 py-3 text-left border-b border-border">
                  Status
                </th>
                <th className="px-4 py-3 text-left border-b border-border">
                  Email
                </th>
                <th className="px-4 py-3 text-left border-b border-border">
                  Role
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.length > 0 ? (
                filtered.map((ticket) => {
                  const isOwner = ticket.email === userEmail;
                  return (
                    <tr
                      key={ticket.ticketId}
                      onClick={() =>
                        handleTicketClick(ticket.ticketId, ticket.email)
                      }
                      className={`border-b ${
                        isOwner
                          ? "hover:bg-muted/40 cursor-pointer"
                          : "cursor-not-allowed opacity-70"
                      }`}
                    >
                      <td className="px-4 py-2 whitespace-nowrap">
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                        #{ticket.ticketId}
                      </td>
                      <td className="px-4 py-2 whitespace-normal break-words max-w-[300px]">
                        {ticket.subject}
                      </td>
                      <td className="px-4 py-2">
                        {formatRelativeTime(
                          ticket.lastUpdated || ticket.createdAt
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span className={getStatusBadgeClass(ticket.status)}>
                          {ticket.status.charAt(0).toUpperCase() +
                            ticket.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2 break-all">
                        {shortEmail(ticket.email)}
                      </td>
                      <td className="px-4 py-2 capitalize">
                        {ticket.role === "owner" ? "Me" : ticket.role || "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="p-6 text-center text-muted-foreground"
                  >
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
