"use client";

import React, { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";

import NewTicket from "./_components/new-ticket";
import FAQSection from "./_components/faq-section";
import TicketTable from "./_components/ticket-table";
import {
  supportTabs,
  supportTabIconProps,
  supportTabTriggerClass,
} from "./utils/tab-config";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("tickets");

  return (
    <div data-testid="dashboard-support-page" className="space-y-6">
      <Card
        data-testid="dashboard-support-card"
        className="relative !border-0 gradient-outline-border bg-[rgba(37,48,240,0.07)] dark:bg-[rgba(255,255,255,0.03)]"
      >
        <CardContent className="p-0 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-black/10 dark:border-border gap-3">
              <div className="w-full md:w-auto flex items-center gap-2">
                <h1 className="justify-start text-black dark:text-white text-3xl font-semibold font-['Space_Grotesk'] whitespace-nowrap leading-10">
                  Support Center
                </h1>
              </div>
              <div className="flex self-end space-x-2">
                <TabsList className="grid grid-cols-3 w-full h-12 bg-white/5 rounded-full border border-[#A801BA]">
                  {supportTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={supportTabTriggerClass}
                      data-testid={
                        tab.value === "new-ticket"
                          ? "support-new-ticket-tab"
                          : tab.value === "tickets"
                            ? "support-my-tickets-tab"
                            : "support-faq-tab"
                      }
                    >
                      <div {...supportTabIconProps(tab.icon)} />
                      <div className="justify-start text-sm font-medium font-['Inter'] leading-5">
                        {tab.label}
                      </div>
                    </TabsTrigger>
                  ))}
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
