import type { RootState } from "@/redux/store";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import { setIsShow } from "@/redux/slices/feedback/feedback-slice";

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

import { useDispatch, useSelector } from "react-redux";

import { User, LogOut, CreditCard, ChevronDown } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { handleSignOut } from "@/lib/services/auth";

const ProfileDropdown = () => {
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleDropdownOpenChange = (open: boolean) => {
    if (open) {
      dispatch(setIsShow(true));
    }
  };

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
    <DropdownMenu onOpenChange={handleDropdownOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getAvatarFallback(user ?? {})}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 hidden md:block" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
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

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
