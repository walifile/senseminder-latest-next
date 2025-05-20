"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

type StoragePlan = {
  id: string;
  name: string;
  storage: string;
  price: string;
  current?: boolean;
  features: string[];
};

type StoragePlansDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: StoragePlan[];
};

const StoragePlansDialog: React.FC<StoragePlansDialogProps> = ({
  open,
  onOpenChange,
  plans,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Storage Plans</DialogTitle>
          <DialogDescription>
            Choose a plan that fits your storage needs
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-4 rounded-lg border ${
                plan.current ? "border-primary" : "border-border"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{plan.name}</h3>
                {plan.current && (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    Current
                  </Badge>
                )}
              </div>
              <div className="text-2xl font-bold mb-2">{plan.storage}</div>
              <div className="text-sm text-muted-foreground mb-4">
                {plan.price}
              </div>
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.current ? "outline" : "default"}
                className="w-full"
                disabled={plan.current}
              >
                {plan.current ? "Current Plan" : "Upgrade"}
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StoragePlansDialog;
