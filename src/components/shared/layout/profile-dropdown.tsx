/* eslint perfectionist/sort-imports: "off" */

import type { RootState } from "@/redux/store";
import { useState, useEffect } from "react";
import { checkOnboarded } from "@/lib/utils/checkOnboarded";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import FeedbackDialog from "@/app/dashboard/_components/feedback-dialog";

import { Button } from "@/components/ui/button";
import { getAvatarFallback } from "@/lib/utils/index";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { useSelector } from "react-redux";

import {
  User,
  LogOut,
  CreditCard,
  ChevronDown,
  MessageSquarePlus,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useBoolean } from "@/hooks/use-boolean";

import { handleSignOut } from "@/lib/services/auth";

const ProfileDropdown = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);

  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchOnboarded = async () => {
      const onboarded = await checkOnboarded();
      setIsOnboarded(onboarded);
    };
    fetchOnboarded();
  }, []);

  const feedbackDialog = useBoolean();

  const handleLogout = async () => {
    try {
      const response = await handleSignOut();
      if (response.success) {
        toast({
          title: "Success",
          description: "Logged out successfully!",
        });
        router.push(routes?.home);
      } else {
        toast({
          title: "Logout Failed",
          description: response.error || "Logout failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong during logout.";

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    isOnboarded && (
      <>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-0 pr-3 h-14">
              <Avatar className="size-14">
                <AvatarFallback>{getAvatarFallback(user ?? {})}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-base font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 hidden md:block" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/dashboard/billing">
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={feedbackDialog.onTrue}>
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Product Feedback
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <FeedbackDialog
          open={feedbackDialog.value}
          onClose={feedbackDialog.onFalse}
        />
      </>
    )
  );
};

export default ProfileDropdown;
