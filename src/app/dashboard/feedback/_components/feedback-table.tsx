"use client";

import React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";

import { format } from "date-fns";
import { Star } from "lucide-react";

import { getStatusColor, getTypeBadgeColor } from "../utils";

import type { ApiFeedback } from "../types";

const headers = [
  "User",
  "Type",
  "Rating",
  "Comment",
  "Status",
  "Source",
  "Date",
  // "",
];

type Props = {
  loading: boolean;
  filteredFeedback: ApiFeedback[];
};

const FeedbackTable = ({ loading, filteredFeedback }: Props) => {
  // const updateStatusDialog = useBoolean();
  // const [selectedFeedback, setSelectedFeedback] = useState<ApiFeedback | null>(
  //   null
  // );

  const renderRating = (rating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3 w-3",
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          )}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">({rating})</span>
    </div>
  );

  return (
    <>
      <Table data-testid="dashboard-feedback-table">
        <TableHeader>
          <TableRow>
            {headers.map((header, i) => (
              <TableHead key={i}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-6 text-muted-foreground"
              >
                Loading feedback...
              </TableCell>
            </TableRow>
          ) : filteredFeedback.length > 0 ? (
            filteredFeedback.map((feedback) => (
              <TableRow key={feedback.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{feedback.userName || feedback.userEmail}</div>
                    {feedback.userName && (
                      <div className="text-xs text-muted-foreground">
                        {feedback.userEmail}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "capitalize",
                      getTypeBadgeColor(feedback.type)
                    )}
                  >
                    {feedback.type}
                  </Badge>
                </TableCell>
                <TableCell>{renderRating(feedback.rating)}</TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={feedback.comment}>
                    {feedback.comment || (
                      <span className="text-muted-foreground">No comment</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "capitalize",
                      getStatusColor(feedback.status)
                    )}
                  >
                    {feedback.status.replace("-", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">{feedback.source}</TableCell>
                <TableCell>
                  {format(new Date(feedback.createdAt), "MMM dd, yyyy")}
                </TableCell>
                {/* <TableCell>
                  <ActionsMenu
                    actions={[
                      {
                        label: "Update Status",
                        icon: Edit,
                        onClick: () => handleUpdateStatus(feedback),
                      },
                    ]}
                  />
                </TableCell> */}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-6 text-muted-foreground"
              >
                No feedback found. Try adjusting your search filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* UPDATE STATUS DIALOG */}
      {/* <UpdateStatusDialog
        open={updateStatusDialog.value}
        onClose={updateStatusDialog.onFalse}
        selectedFeedback={selectedFeedback}
      /> */}
    </>
  );
};

export default FeedbackTable;
