"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetTicketsQuery } from "@/api/supportAPI";
import { selectUserId, selectUserEmail } from "@/redux/slices/auth/auth-slice";

import { Input } from "@/components/ui/input";
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

import { Search, ArrowUp, ArrowDown } from "lucide-react";

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
      <div className="p-6 pt-0 space-y-5 border-b border-black/10 dark:border-border">
        <div className="space-y-1">
          <div className="justify-start text-white text-2xl font-bold font-['Space_Grotesk'] leading-8">Sense Cloud</div>
          <div className="justify-start text-paragraph text-base font-normal font-['Inter'] leading-6">Manage your files and folders</div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <div className="bg-[rgba(37,48,240,0.07)] dark:bg-[#ffffff08] rounded-[1000px] border-[none] relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[1000px] before:[background:linear-gradient(270deg,rgba(168,1,186,0.5)_0%,rgba(37,48,240,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
              <Search className="absolute h-10 w-10 top-1/2 left-1.5 -translate-y-1/2 p-2 text-[#2530F0] dark:text-white bg-[#ced1fc] dark:bg-[rgba(255,255,255,0.03)] rounded-[23px] border border-solid border-[#2530F0] dark:border-[#A801BA]" />
              <Input
                id="support-ticket-search"
                name="support-ticket-search"
                placeholder="Search requests"
                className="pl-14 h-14 md:text-base rounded-full"
                onChange={(e) => setQuery(e.target.value)}
                value={query}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-4">
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
      </div>

      <div className="p-6 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-700/10 dark:bg-[#ffffff0f] hover:bg-blue-700/10 dark:hover:bg-[#ffffff0f]">
              <TableHead
                className="rounded-tl-xl"
                onClick={toggleSort}
              >
                Created <SortIcon />
              </TableHead>
              <TableHead>
                ID
              </TableHead>
              <TableHead>
                Subject
              </TableHead>
              <TableHead>
                Last activity
              </TableHead>
              <TableHead>
                Status
              </TableHead>
              <TableHead>
                Email
              </TableHead>
              <TableHead className="rounded-tr-xl">
                Role
              </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {filtered.length > 0 ? (
              filtered.map((ticket) => {
                const isOwner = ticket.email === userEmail;
                return (
                  <TableRow
                    key={ticket.ticketId}
                    onClick={() =>
                      handleTicketClick(ticket.ticketId, ticket.email)
                    }
                    className={`border-b ${isOwner
                      ? "hover:bg-muted/40 cursor-pointer"
                      : "cursor-not-allowed opacity-70"
                      }`}
                  >
                    <TableCell className="whitespace-nowrap">
                      {formatDate(ticket.createdAt)} 
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      #{ticket.ticketId}
                    </TableCell>
                    <TableCell className="whitespace-normal break-words max-w-[300px]">
                      {ticket.subject}
                    </TableCell>
                    <TableCell>
                      {formatRelativeTime(
                        ticket.lastUpdated || ticket.createdAt
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={getStatusBadgeClass(ticket.status)}>
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
    </>
  );
}
