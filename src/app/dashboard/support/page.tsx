"use client";

import Image from "next/image";
import React, { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";

import NewTicket from "./_components/new-ticket";
import FAQSection from "./_components/faq-section";
import TicketTable from "./_components/ticket-table";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("tickets");

  return (
    <div className="space-y-6">
      <Card className="relative !border-0 gradient-outline-border bg-[rgba(37,48,240,0.07)] dark:bg-[rgba(255,255,255,0.03)]">
        <CardContent className="p-0 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center p-6 border-b border-black/10 dark:border-border">
              <div className="flex items-center gap-2">
                <h1 className="justify-start text-black dark:text-white text-3xl font-semibold font-['Space_Grotesk'] leading-10">Support Center</h1>
              </div>
              <div className="flex space-x-2">
                <TabsList className="grid grid-cols-3 w-full h-12 bg-white/5 rounded-full border border-fuchsia-700">
                  <TabsTrigger value="tickets" className="h-full px-4 py-2 rounded-[100px] inline-flex justify-center items-center gap-1.5">
                    <div className="w-4 h-4 relative overflow-hidden">
                      <Image
                        src="/assets/svg/support/my-tickets.svg"
                        alt="My Tickets Icon"
                        fill
                        priority
                      />
                    </div>
                    <div className="justify-start text-sm font-medium font-['Inter'] leading-5">
                      My Tickets
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="new-ticket" className="h-full px-4 py-2 rounded-[100px] inline-flex justify-center items-center gap-1.5">
                    <div className="w-4 h-4 relative overflow-hidden">
                      <Image
                        src="/assets/svg/support/new-ticket.svg"
                        alt="New Ticket Icon"
                        fill
                        priority
                      />
                    </div>
                    <div className="justify-start text-sm font-medium font-['Inter'] leading-5">
                      New Ticket
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="faq" className="h-full px-4 py-2 rounded-[100px] inline-flex justify-center items-center gap-1.5">
                    <div className="w-4 h-4 relative overflow-hidden">
                      <Image
                        src="/assets/svg/support/faq.svg"
                        alt="FAQ Icon"
                        fill
                        priority
                      />
                    </div>
                    <div className="justify-start text-sm font-medium font-['Inter'] leading-5">
                      FAQ
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
