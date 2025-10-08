"use client";

import React, { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { Info, Search, Filter } from "lucide-react";

import FeedbackTable from "./_components/feedback-table";

import type { ApiFeedback } from "./types";

// Static data for demonstration
const staticFeedback: ApiFeedback[] = [
  {
    id: "1",
    userId: "user1",
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    type: "bug",
    rating: 2,
    comment:
      "The application crashes when I try to upload large files. This happens consistently and is very frustrating.",
    status: "pending",
    source: "dashboard",
    metadata: {
      page: "/dashboard/upload",
      browser: "Chrome",
      os: "Windows",
    },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    userId: "user2",
    userName: "Jane Smith",
    userEmail: "jane.smith@example.com",
    type: "feature",
    rating: 4,
    comment:
      "Would love to see dark mode support. The current interface is great but can be harsh on the eyes during long sessions.",
    status: "in-progress",
    source: "settings",
    metadata: {
      page: "/settings/appearance",
      browser: "Firefox",
      os: "macOS",
    },
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-16T09:15:00Z",
  },
  {
    id: "3",
    userId: "user3",
    userName: "Mike Johnson",
    userEmail: "mike.johnson@example.com",
    type: "general",
    rating: 5,
    comment:
      "Excellent service! Everything works smoothly and the interface is intuitive.",
    status: "resolved",
    source: "pc-creation",
    metadata: {
      page: "/create-pc",
      browser: "Safari",
      os: "macOS",
    },
    createdAt: "2024-01-13T16:45:00Z",
    updatedAt: "2024-01-17T11:30:00Z",
  },
  {
    id: "4",
    userId: "user4",
    userName: "Sarah Wilson",
    userEmail: "sarah.wilson@example.com",
    type: "bug",
    rating: 1,
    comment:
      "Payment processing is broken. I've been trying to make a payment for hours.",
    status: "rejected",
    source: "payment",
    metadata: {
      page: "/billing/payment",
      browser: "Chrome",
      os: "Linux",
    },
    createdAt: "2024-01-12T09:10:00Z",
    updatedAt: "2024-01-18T13:45:00Z",
  },
  {
    id: "5",
    userId: "user5",
    userName: "Alex Brown",
    userEmail: "alex.brown@example.com",
    type: "feature",
    rating: 3,
    comment:
      "The remote session feature works but could use better performance optimization.",
    status: "pending",
    source: "remote-session",
    createdAt: "2024-01-11T11:25:00Z",
    updatedAt: "2024-01-11T11:25:00Z",
  },
];

const FeedbackManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isLoading] = useState(false);

  // Filter feedback based on search and filters
  const filteredFeedback = staticFeedback.filter((feedback) => {
    const matchesSearch =
      feedback.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.comment.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || feedback.status === statusFilter;
    const matchesType = typeFilter === "all" || feedback.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const clearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setSearchQuery("");
  };

  const getStatusStats = () => {
    const stats = staticFeedback.reduce((acc, feedback) => {
      acc[feedback.status] = (acc[feedback.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: staticFeedback.length,
      pending: stats.pending || 0,
      inProgress: stats["in-progress"] || 0,
      resolved: stats.resolved || 0,
      rejected: stats.rejected || 0,
    };
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Feedback Management</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px]" align="start">
              Manage and respond to user feedback to improve your services.
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Feedback</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.inProgress}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.resolved}
            </div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Feedback Overview</CardTitle>
              <CardDescription>Review and manage user feedback</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Filters */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="general">General Feedback</SelectItem>
                </SelectContent>
              </Select>

              {(statusFilter !== "all" || typeFilter !== "all") && (
                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}

              {/* Search */}
              <div className="relative w-64">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <FeedbackTable
            loading={isLoading}
            filteredFeedback={filteredFeedback}
          />
        </CardContent>

        <CardFooter className="border-t pt-6 flex justify-between text-muted-foreground text-sm">
          <p>
            Showing {filteredFeedback.length} of {staticFeedback.length}{" "}
            feedback entries
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FeedbackManagementPage;
