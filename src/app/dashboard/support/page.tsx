"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchWithUserId } from "@/lib/fetchWithUserId";
import TicketTable from "./_components/ticket-table";
import { Ticket } from "./types";
import { selectUserId } from "@/redux/slices/auth/auth-slice";
import api from "@/api/apiConfig";
import NewTicket from "./_components/new-ticket";
import FAQSection from "./_components/faq-section";

const API_BASE = api?.SUPPORT_API_BASE;

export default function SupportPage() {
  const { toast } = useToast();
  const router = useRouter();
  const userId = useSelector(selectUserId);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState("tickets");

  useEffect(() => {
    if (userId) loadTickets();
  }, [userId]);

  const loadTickets = async () => {
    if (!userId) return;

    try {
      const res = await fetchWithUserId(`${API_BASE}/tickets`, {
        method: "GET",
        userId,
      });
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch {
      toast({ title: "Failed to load tickets" });
    }
  };

  const handleTicketClick = (ticketId: string) => {
    router.push(`/dashboard/support/ticket/${ticketId}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Support Center</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="new-ticket">New Ticket</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6 mt-6">
          <TicketTable tickets={tickets} onClick={handleTicketClick} />
        </TabsContent>

        <TabsContent value="new-ticket" className="space-y-6 mt-6">
          <NewTicket setActiveTab={setActiveTab} loadTickets={loadTickets} />
        </TabsContent>

        <TabsContent value="faq" className="space-y-6 mt-6">
          <FAQSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
