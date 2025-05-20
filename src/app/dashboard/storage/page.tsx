"use client";

import React from "react";
import CloudStorage from "@/app/dashboard/storage/_components/smart-storage";

const StoragePage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Smart Storage</h1>
      <CloudStorage />
    </div>
  );
};

export default StoragePage;
