"use client";

import React from "react";
import DashboardHeader from "@/app/dashboard/_components/dashboard-header";
import DashboardSidebar from "@/app/dashboard/_components/dashboard-sidebar";
import {
  setIsShow,
  selectIsShow,
} from "@/redux/slices/feedback/feedback-slice";

import { useDispatch, useSelector } from "react-redux";

import FeedbackSlider from "./_components/feedback-slider";
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
    <div className="min-h-screen grid-bg relative">
      {/* Main layout container */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - fixed */}
        <DashboardSidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header - fixed */}
          <DashboardHeader />

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10 mb-2">
            {children}
          </main>
        </div>
      </div>

      {/* Dialog mounted globally in dashboard layout */}
      {/* <DesktopAppDialog /> */}

      {/* Feedback */}
      <FeedbackSlider open={isShow} onClose={handleCloseFeedback} />

      {/* Background blobs (dark mode only) */}
      <div className="hidden dark:block">
        <div className="absolute top-[-238px] left-[-226px] w-[501.29px] h-[740.39px] origin-top-left rotate-[21.2deg] opacity-100 bg-[#2530F0] rounded-[50%] blur-[255.50px] -z-10" />
        <div className="absolute top-[-146px] right-[-299px] w-[501.29px] h-[740.39px] origin-top-left rotate-[-11.32deg] opacity-100 bg-[#2530F0] rounded-[50%] blur-[255.50px] -z-10" />
        <div className="fixed bottom-[-265px] right-[-150px] w-[410px] h-[777px] opacity-40 bg-gradient-to-b from-[#9C05BF] to-[#2E2CEC] rounded-[50%] blur-[200px] -z-10" />
        <div className="fixed top-[75%] left-[38.31%] -translate-y-1/2 w-[493px] h-[488px] opacity-40 rotate-90 bg-[#4027E5] rounded-full blur-[200px] -z-10" />
      </div>
    </div>
  );
}
