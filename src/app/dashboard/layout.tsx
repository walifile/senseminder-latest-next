"use client";

import React, { useEffect } from "react";
import DashboardHeader from "@/app/dashboard/_components/dashboard-header";
import DashboardSidebar from "@/app/dashboard/_components/dashboard-sidebar";
import {
  setIsShow,
  selectIsShow,
} from "@/redux/slices/feedback/feedback-slice";

import { useDispatch, useSelector } from "react-redux";

import FeedbackSlider from "./_components/feedback-slider";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const dispatch = useDispatch();
  const isShow = useSelector(selectIsShow);

  useEffect(() => {
    // Open feedback automatically on reload/mount
    dispatch(setIsShow(true));
  }, [dispatch]);

  const handleCloseFeedback = () => {
    dispatch(setIsShow(false));
  };

  return (
    <div data-testid="dashboard-layout" className="min-h-screen grid-bg relative">
      <div
        data-testid="dashboard-layout-container"
        className="flex h-screen overflow-hidden"
      >
        <DashboardSidebar />

        <div
          data-testid="dashboard-layout-content"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <DashboardHeader />

          <main
            data-testid="dashboard-layout-main"
            className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10 mb-2"
          >
            {children}
          </main>
        </div>
      </div>

      <FeedbackSlider open={isShow} onClose={handleCloseFeedback} />

      <div data-testid="dashboard-layout-background" className="hidden dark:block">
        <div className="absolute top-[-238px] left-[-226px] w-[501.29px] h-[740.39px] origin-top-left rotate-[21.2deg] opacity-100 bg-[#2530F0] rounded-[50%] blur-[255.50px] -z-10" />
        <div className="absolute top-[-146px] right-[-299px] w-[501.29px] h-[740.39px] origin-top-left rotate-[-11.32deg] opacity-100 bg-[#2530F0] rounded-[50%] blur-[255.50px] -z-10" />
        <div className="fixed bottom-[-265px] right-[-150px] w-[410px] h-[777px] opacity-40 bg-gradient-to-b from-[#9C05BF] to-[#2E2CEC] rounded-[50%] blur-[200px] -z-10" />
        <div className="fixed top-[75%] left-[38.31%] -translate-y-1/2 w-[493px] h-[488px] opacity-40 rotate-90 bg-[#4027E5] rounded-full blur-[200px] -z-10" />
      </div>
    </div>
  );
}
