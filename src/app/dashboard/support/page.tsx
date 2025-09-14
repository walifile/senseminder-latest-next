"use client";

import React, { useState } from "react";

import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";

import NewTicket from "./_components/new-ticket";
import FAQSection from "./_components/faq-section";
import TicketTable from "./_components/ticket-table";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("tickets");

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
          <TicketTable />
        </TabsContent>

        <TabsContent value="new-ticket" className="space-y-6 mt-6">
          <NewTicket setActiveTab={setActiveTab} />
        </TabsContent>

        <TabsContent value="faq" className="space-y-6 mt-6">
          <FAQSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
