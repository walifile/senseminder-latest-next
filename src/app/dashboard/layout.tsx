"use client";

import React from "react";
import FeedbackDialog from "@/app/dashboard/_components/feedback-dialog";
import DashboardHeader from "@/app/dashboard/_components/dashboard-header";
import DashboardSidebar from "@/app/dashboard/_components/dashboard-sidebar";
import {
  setIsShow,
  selectIsShow,
} from "@/redux/slices/feedback/feedback-slice";

import { useDispatch, useSelector } from "react-redux";
// import DesktopAppDialog from "./storage/_components/desktop-app-dialog";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const dispatch = useDispatch();
  const isShow = useSelector(selectIsShow);

  const handleCloseFeedback = () => {
    dispatch(setIsShow(false));
  };

  return (
    <div className="min-h-screen grid-bg">
      {/* Main layout container */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - fixed */}
        <DashboardSidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header - fixed */}
          <DashboardHeader />

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
      {/* Dialog mounted globally in dashboard layout */}
      {/* <DesktopAppDialog /> */}
      {/* Feedback dialog */}
      <FeedbackDialog open={isShow} onClose={handleCloseFeedback} />;
    </div>
  );
}
