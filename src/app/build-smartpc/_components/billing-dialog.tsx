import React, { useState,useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const billingPlans = [
  {
    id: "hourly",
    name: "Hourly",
    description: "Perfect for quick tasks and testing",
    price: "0.50",
    unit: "hour",
    icon: "\u23F0",
    features: [
      "Pay only for actual usage",
      "No minimum commitment",
      "Instant start/stop",
      "Basic support included",
    ],
  },
  {
    id: "daily",
    name: "Daily",
    description: "Ideal for day-long projects",
    price: "9.99",
    unit: "day",
    icon: "\ud83d\uddd3\ufe0f",
    features: [
      "24-hour continuous access",
      "15% savings vs hourly",
      "Automated daily backups",
      "Priority email support",
    ],
  },
  {
    id: "monthly",
    name: "Monthly",
    description: "Best value for regular users",
    price: "179.99",
    unit: "month",
    icon: "\ud83d\udcc5",
    features: [
      "30-day continuous access",
      "35% savings vs Daily",
      "Advanced monitoring tools",
      "24/7 priority support",
    ],
  },
];

interface BillingPlanDialogProps {
  currentPlan: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (plan: string) => void;
}

export const BillingPlanDialog: React.FC<BillingPlanDialogProps> = ({
  currentPlan,
  open,
  onOpenChange,
  onConfirm,
}) => {
  const availablePlans = billingPlans.filter((plan) => plan.id !== currentPlan);
  const [selectedPlan, setSelectedPlan] = useState<string>(availablePlans[0]?.id || "");
const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (open) {
      const defaultPlan = billingPlans.find((p) => p.id !== currentPlan)?.id || "";
      setSelectedPlan(defaultPlan);
      setConsent(false);
    }
  }, [open, currentPlan]);

  const plan = billingPlans.find((p) => p.id === selectedPlan);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Billing Plan Change</DialogTitle>
        </DialogHeader>

        <Tabs
          value={selectedPlan}
          onValueChange={(val) => setSelectedPlan(val)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2">
            {availablePlans.map((p) => (
              <TabsTrigger key={p.id} value={p.id}>
                {p.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {availablePlans.map((plan) => (
            <TabsContent key={plan.id} value={plan.id} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">per {plan.unit}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">What's included:</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(!!v)} />
                <label
                  htmlFor="consent"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  I am fully aware of the plan and price.
                </label>
              </div>

              <DialogFooter>
                <Button onClick={() => onConfirm(selectedPlan)} disabled={!consent}>
                  Confirm Plan Change
                </Button>
              </DialogFooter>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
