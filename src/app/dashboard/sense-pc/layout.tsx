"use client";

import React from "react";

interface CloudPCLayoutProps {
  children: React.ReactNode;
}

export default function CloudPCLayout({ children }: CloudPCLayoutProps) {
  return (
    <div data-testid="dashboard-sense-pc-layout" className="flex-1 overflow-auto">
      {children}
    </div>
  );
}
