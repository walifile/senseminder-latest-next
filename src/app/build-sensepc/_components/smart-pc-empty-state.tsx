"use client";

import Link from "next/link";
import { routes } from "@/constants/routes";
import React, { useState, useEffect } from "react";
import { getPromoInfo } from "@/api/promocashback";

import { Button } from "@/components/ui/button";

import { Gift, Monitor, HammerIcon, GraduationCap } from "lucide-react";

type SmartPCEmptyStateProps = {
  isMember: boolean;
  searchQuery: string;
  handleShowNewPCDialog: () => void;
};

const SmartPCEmptyState: React.FC<SmartPCEmptyStateProps> = ({
  isMember,
  searchQuery,
  handleShowNewPCDialog,
}) => {
  const [promoEligible, setPromoEligible] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const info = await getPromoInfo();
        if (active) setPromoEligible(Boolean(info?.eligible));
      } catch {
        if (active) setPromoEligible(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <Monitor className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Sense PCs Found</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {searchQuery
          ? "No Sense PCs match your search criteria. Try adjusting your search terms."
          : "Get started by building your first Sense PC. Check out our tutorials to learn more about Sense PC features."}
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        {!isMember && (
          <Button onClick={handleShowNewPCDialog} data-testid="sensepc-build-button">
            <HammerIcon className="h-4 w-4 mr-2" />
            Build Sense PC
          </Button>
        )}

        {!searchQuery && (
          <Button variant="outline" asChild>
            <Link href="/dashboard/tutorials">
              <GraduationCap className="h-4 w-4 mr-2" />
              View Tutorials
            </Link>
          </Button>
        )}

        {promoEligible && (
  
        <Button
          asChild
          variant="white"
          data-testid="sensepc-redeem-promo-button"
          className="rounded-full px-6 relative overflow-hidden group shadow-lg hover:shadow-xl border-purple-200/50 dark:border-purple-400/30 hover:border-purple-300 dark:hover:border-purple-400 transition-all duration-500 ease-out hover:scale-105 active:scale-95 bg-gradient-to-br from-white via-white to-purple-50/30 dark:from-white dark:via-white dark:to-purple-100/20 backdrop-blur-sm"
        >
          <Link href={routes.billing}>
            <span className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/10 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />

            <Gift className="h-4 w-4 mr-2 relative z-10 animate-[bounce_3s_infinite] group-hover:animate-none group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 ease-in-out text-purple-600 dark:text-purple-700" />

            <span className="relative z-10 font-semibold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent dark:from-gray-800 dark:via-purple-800 dark:to-gray-800">
              Redeem Promotion
            </span>
            <span className="absolute top-1 right-3 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
          </Link>
        </Button>

        )}
      </div>
    </div>
  );
};

export default SmartPCEmptyState;
