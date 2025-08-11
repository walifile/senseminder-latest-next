"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function FAQSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>FAQ</CardTitle>
        <CardDescription>Common questions and solutions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>How do I reset my Sense PC?</strong>
          <p className="text-sm text-muted-foreground">
            Go to your dashboard, select your PC, then choose "Reset".
          </p>
        </div>
        <div>
          <strong>What happens if I exceed storage?</strong>
          <p className="text-sm text-muted-foreground">
            You won't be able to upload files until space is cleared or plan
            upgraded.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
