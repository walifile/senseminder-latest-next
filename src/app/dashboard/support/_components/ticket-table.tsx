"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetTicketsQuery } from "@/api/supportAPI";
import { selectUserId, selectUserEmail } from "@/redux/slices/auth/auth-slice";

import { shortEmail } from "@/lib/utils/format-string";
import { formatDate, formatRelativeTime } from "@/lib/utils/format-time";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";

import { useSelector } from "react-redux";

import { ArrowUp, ArrowDown } from "lucide-react";

import GradientSearchInput from "@/components/shared/inputs/gradient-search-input";

import TicketTableSkeleton from "./ticket-table-skeleton";
import { getStatusBadgeClass } from "../utils/get-status-badge-class";

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

  const toggleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filtered = useMemo(() => {
    const tickets = data?.tickets ?? [];
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
  }, [data?.tickets, query, statusFilter, sortDirection]);

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
    <>
      <div className="p-6 pt-0 space-y-5">
        <div className="space-y-1">
          <div className="justify-start text-black dark:text-white text-2xl font-bold font-['Space_Grotesk'] leading-8">
            Sense Support
          </div>
          <div className="justify-start text-[#454545] dark:text-paragraph text-base font-normal font-['Inter'] leading-6">
            Our support team will respond as soon as possible.
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <GradientSearchInput
            wrapperClassName="w-full max-w-md"
            id="support-ticket-search"
            name="support-ticket-search"
            placeholder="Search requests"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            inputTestId="support-search-input"
          />

          {/* Status Filter */}
          <div className="flex items-center self-end gap-4">
            <label className="text-sm text-[#454545] dark:text-[#B9C2D5]">
              Status:
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="w-[150px]"
              variant="pill"
              data-testid="support-status-filter"
            >
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
      </div>

      <div className="px-6 pb-6">
        <div className="overflow-hidden rounded-2xl border border-[#2530F033] dark:border-[#ffffff1a]">
          <Table
            data-testid="support-ticket-list"
            className="border-separate border-spacing-0"
          >
            <TableHeader>
              <TableRow className="bg-blue-700/10 dark:bg-[#ffffff0f] hover:bg-blue-700/10 dark:hover:bg-[#ffffff0f]">
                <TableHead className="rounded-tl-xl whitespace-nowrap" onClick={toggleSort}>
                  Created <SortIcon />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Last activity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="rounded-tr-xl">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody style={{ borderSpacing: 0, borderCollapse: "separate" }}>
              {filtered.length > 0 ? (
                filtered.map((ticket) => {
                  const isOwner = ticket.email === userEmail;
                  return (
                    <TableRow
                      key={ticket.ticketId}
                      onClick={() =>
                        handleTicketClick(ticket.ticketId, ticket.email)
                      }
                      data-testid="support-ticket-row"
                      className={`border-b ${
                        isOwner
                          ? "hover:bg-muted/40 cursor-pointer"
                          : "cursor-not-allowed opacity-70"
                      }`}
                    >
                      <TableCell className="whitespace-nowrap">
                        {formatDate(ticket.createdAt)}
                      </TableCell>
                      <TableCell
                        className="text-muted-foreground whitespace-nowrap"
                        data-testid="support-ticket-id"
                      >
                        #{ticket.ticketId}
                      </TableCell>
                      <TableCell
                        className="whitespace-normal break-words max-w-[300px]"
                        data-testid="support-ticket-subject"
                      >
                        {ticket.subject}
                      </TableCell>
                      <TableCell>
                        {formatRelativeTime(
                          ticket.lastUpdated || ticket.createdAt
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={getStatusBadgeClass(ticket.status)}
                          data-testid="support-ticket-status-badge"
                        >
                          {ticket.status.charAt(0).toUpperCase() +
                            ticket.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="break-all">
                        {shortEmail(ticket.email)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {ticket.role === "owner" ? "Me" : ticket.role || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No tickets found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
