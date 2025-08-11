
// 'use client';

// import { useState, useMemo } from 'react';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Search } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';

// interface Ticket {
//   ticketId: string;
//   subject: string;
//   status: string;
//   priority: string;
//   createdAt: string;
//   lastUpdated?: string;
// }

// interface Props {
//   tickets: Ticket[];
//   onClick: (ticketId: string) => void;
// }

// export default function TicketTable({ tickets, onClick }: Props) {
//   const [query, setQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('any');

//   const filtered = useMemo(() => {
//     const sorted = [...tickets].sort((a, b) => {
//       const dateA = new Date(a.lastUpdated || a.createdAt).getTime();
//       const dateB = new Date(b.lastUpdated || b.createdAt).getTime();
//       return dateB - dateA;
//     });

//     return sorted.filter((t) => {
//       const matchQuery =
//         t.subject.toLowerCase().includes(query.toLowerCase()) ||
//         t.ticketId.toLowerCase().includes(query.toLowerCase());
//       const matchStatus = statusFilter === 'any' || t.status.toLowerCase() === statusFilter;
//       return matchQuery && matchStatus;
//     });
//   }, [tickets, query, statusFilter]);

//   const getStatusBadgeClass = (status: string) => {
//     const base = 'px-2 py-0.5 text-xs rounded-full font-medium';
//     switch (status.toLowerCase()) {
//       case 'resolved':
//         return "bg-yellow-100 text-yellow-800";
//       case 'closed':
//         return `${base} bg-gray-200 text-gray-700`;
//       case 'open':
//         return `${base} bg-green-100 text-green-700`;
//       case 'in-progress':
//         return `${base} bg-blue-100 text-blue-700`;
//       default:
//         return `${base} bg-muted text-muted-foreground`;
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Support Tickets</CardTitle>
//         <CardDescription>Track and manage your requests</CardDescription>

//         <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
//           {/* Search */}
//           <div className="relative w-full max-w-md">
//             <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search requests"
//               className="pl-9 rounded-full"
//             />
//           </div>

//           {/* Status Filter */}
//           <div className="flex items-center gap-2">
//             <label className="text-sm text-muted-foreground">Status:</label>
//             <Select value={statusFilter} onValueChange={setStatusFilter}>
//               <SelectTrigger className="w-[150px]">
//                 <SelectValue placeholder="Any" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="any">Any</SelectItem>
//                 <SelectItem value="open">Open</SelectItem>
//                 <SelectItem value="in-progress">In Progress</SelectItem>
//                 <SelectItem value="resolved">Resolved</SelectItem>
//                 <SelectItem value="closed">Closed</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent>
//         <div className="rounded-md border">
//           <div className="grid grid-cols-4 md:grid-cols-6 p-4 font-medium border-b bg-muted/50 text-sm text-muted-foreground">
//             <div className="col-span-2">Subject</div>
//             <div className="hidden md:block">Id</div>
//             <div className="hidden md:block">Created</div>
//             <div className="hidden md:block">Last activity</div>
//             <div className="hidden md:block">Status</div>
//           </div>

//           {filtered.length > 0 ? (
//             filtered.map((ticket) => (
//               <div
//                 key={ticket.ticketId}
//                 onClick={() => onClick(ticket.ticketId)}
//                 className="grid grid-cols-4 md:grid-cols-6 p-4 cursor-pointer hover:bg-muted/50 text-sm"
//               >
//                 <div className="col-span-2 truncate">{ticket.subject}</div>
//                 <div className="hidden md:block text-muted-foreground">#{ticket.ticketId}</div>
//                 <div className="hidden md:block">
//                   {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
//                 </div>
//                 <div className="hidden md:block">
//                   {formatDistanceToNow(new Date(ticket.lastUpdated || ticket.createdAt), {
//                     addSuffix: true,
//                   })}
//                 </div>
//                 <div className="hidden md:block">
//                   <span className={getStatusBadgeClass(ticket.status)}>
//                     {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
//                   </span>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="p-6 text-center text-muted-foreground">
//               No tickets found.
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

'use client';
import { format } from 'date-fns';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowDownUp, ArrowDown, ArrowUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Ticket {
  ticketId: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  lastUpdated?: string;
}

interface Props {
  tickets: Ticket[];
  onClick: (ticketId: string) => void;
}

export default function TicketTable({ tickets, onClick }: Props) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('any');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const toggleSort = () => {
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const filtered = useMemo(() => {
    const sorted = [...tickets].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return sorted.filter((t) => {
      const matchQuery =
        t.subject.toLowerCase().includes(query.toLowerCase()) ||
        t.ticketId.toLowerCase().includes(query.toLowerCase());
      const matchStatus = statusFilter === 'any' || t.status.toLowerCase() === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [tickets, query, statusFilter, sortDirection]);

  const getStatusBadgeClass = (status: string) => {
    const base = 'px-2 py-0.5 text-xs rounded-full font-medium';
    switch (status.toLowerCase()) {
      case 'resolved':
        return `${base} bg-yellow-100 text-yellow-800`;
      case 'closed':
        return `${base} bg-gray-200 text-gray-700`;
      case 'open':
        return `${base} bg-green-100 text-green-700`;
      case 'in-progress':
        return `${base} bg-blue-100 text-blue-700`;
      default:
        return `${base} bg-muted text-muted-foreground`;
    }
  };

  const SortIcon = () =>
    sortDirection === 'asc' ? (
      <ArrowUp className="inline h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="inline h-4 w-4 ml-1" />
    );

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
            <div className="col-span-1 flex items-center cursor-pointer" onClick={toggleSort}>
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
                onClick={() => onClick(ticket.ticketId)}
                className="grid grid-cols-4 md:grid-cols-6 p-4 cursor-pointer hover:bg-muted/50 text-sm"
              >
                <div>
                  {format(new Date(ticket.createdAt), 'dd/MM/yyyy')}
                </div>
                <div className="text-muted-foreground">#{ticket.ticketId}</div>
                <div className="col-span-2 truncate">{ticket.subject}</div>
                <div className="hidden md:block">
                  {formatDistanceToNow(new Date(ticket.lastUpdated || ticket.createdAt), {
                    addSuffix: true,
                  })}
                </div>
                <div className="hidden md:block">
                  <span className={getStatusBadgeClass(ticket.status)}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">No tickets found.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
