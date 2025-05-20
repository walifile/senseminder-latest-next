import React from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface RemainingBalanceProps {
  balance: number;
}

const RemainingBalance = ({ balance }: RemainingBalanceProps) => {
  const [showLowBalanceAlert, setShowLowBalanceAlert] = React.useState(false);

  // Determine color based on balance
  const getBalanceColor = () => {
    if (balance >= 50)
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    if (balance > 10)
      return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
  };

  // Show alert if balance is low
  React.useEffect(() => {
    if (balance <= 10) {
      setShowLowBalanceAlert(true);
    }
  }, [balance]);

  return (
    <>
      <Link href="/billing">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
            getBalanceColor()
          )}
        >
          <Wallet className="h-4 w-4" />${balance.toFixed(2)}
        </Button>
      </Link>

      <AlertDialog
        open={showLowBalanceAlert}
        onOpenChange={setShowLowBalanceAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Low Balance Warning</AlertDialogTitle>
            <AlertDialogDescription>
              Your balance is running low (${balance.toFixed(2)}). To ensure
              uninterrupted service, please recharge your account soon. Your
              SmartPCs may be suspended if the balance reaches $0.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Link href="/billing">
                <Button>Recharge Now</Button>
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RemainingBalance;
