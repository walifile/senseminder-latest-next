"use client";

import type { RootState } from "@/redux/store";
import type { ApiUser } from "@/app/dashboard/users/types";

import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import { useMemo, useState, useEffect } from "react";
import { useGetPaymentMethodsQuery } from "@/api/billing";
import { useGetUsersQuery, useInviteUserMutation } from "@/api/user";
import { selectIsAuthenticated } from "@/redux/slices/auth/auth-slice";
import { useCreateBusinessDetailsMutation } from "@/api/profileManagement";

import { getErrorMessage } from "@/lib/utils";

import { useSelector } from "react-redux";

import { useToast } from "@/hooks/use-toast";

import { ONBOARDING_LINKS } from "../data/onboarding-content";
import { validateBusinessOnboardingDetails } from "../schema";
import {
  BUSINESS_INTENT_KEY,
  BUSINESS_SESSION_KEYS,
  BUSINESS_BILLING_PROMPT_SEEN_KEY,
} from "../constants/session";

import type { BusinessOnboardingInviteUserFormValues } from "../schema";

const MINIMUM_BUSINESS_PC_COUNT = 3;

function normalizeBusinessTargetPcCount(value: string | null | undefined) {
  const trimmedValue = value?.trim() ?? "";

  if (!trimmedValue || !/^\d+$/.test(trimmedValue)) {
    return String(MINIMUM_BUSINESS_PC_COUNT);
  }

  return String(
    Math.max(MINIMUM_BUSINESS_PC_COUNT, Number.parseInt(trimmedValue, 10)),
  );
}

function sanitizeBusinessTargetPcCountInput(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  if (!/^\d+$/.test(trimmedValue)) {
    return null;
  }

  return trimmedValue;
}

export function useBusinessOnboardingFlow() {
  const router = useRouter();
  const { toast } = useToast();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authUser = useSelector((state: RootState) => state.auth.user);

  const [showBusinessDetailsDialog, setShowBusinessDetailsDialog] =
    useState(false);
  const [showBillingSetupDialog, setShowBillingSetupDialog] = useState(false);
  const [showBuildPcDialog, setShowBuildPcDialog] = useState(false);
  const [showInviteUsersDialog, setShowInviteUsersDialog] = useState(false);

  const [businessOrganization, setBusinessOrganization] = useState("");
  const [businessTeamSize, setBusinessTeamSize] = useState("");
  const [businessTargetPcCount, setBusinessTargetPcCount] = useState(
    String(MINIMUM_BUSINESS_PC_COUNT),
  );
  const [businessUseCase, setBusinessUseCase] = useState("");
  const [isSavingBusinessDetails, setIsSavingBusinessDetails] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const { data: paymentMethodsData } = useGetPaymentMethodsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: usersData } = useGetUsersQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [inviteUser] = useInviteUserMutation();
  const [createBusinessDetails] = useCreateBusinessDetailsMutation();

  const markBillingPromptSeen = () => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(BUSINESS_BILLING_PROMPT_SEEN_KEY, "true");
  };

  const closeAllDialogs = () => {
    setShowBusinessDetailsDialog(false);
    setShowBillingSetupDialog(false);
    setShowInviteUsersDialog(false);
    setShowBuildPcDialog(false);
  };

  const resetBusinessOnboardingSession = () => {
    if (typeof window === "undefined") return;

    BUSINESS_SESSION_KEYS.forEach((key) => sessionStorage.removeItem(key));
    sessionStorage.setItem(BUSINESS_INTENT_KEY, "true");
  };

  const clearBusinessOnboardingIntent = () => {
    if (typeof window === "undefined") return;

    sessionStorage.removeItem(BUSINESS_INTENT_KEY);
    sessionStorage.setItem(BUSINESS_BILLING_PROMPT_SEEN_KEY, "true");
  };

  const loadBusinessDetailsFromSession = () => {
    if (typeof window === "undefined") return;

    setBusinessOrganization(
      sessionStorage.getItem("businessOrganizationName") ||
        authUser?.organization ||
        "",
    );
    setBusinessTeamSize(sessionStorage.getItem("businessTeamSize") || "");
    setBusinessTargetPcCount(
      normalizeBusinessTargetPcCount(
        sessionStorage.getItem("businessTargetPcCount"),
      ),
    );
    setBusinessUseCase(sessionStorage.getItem("businessUseCase") || "");
  };

  const goToBuildPcStep = () => {
    closeAllDialogs();
    setShowBuildPcDialog(true);
  };

  const goToInviteUsersStep = () => {
    closeAllDialogs();
    setShowInviteUsersDialog(true);
  };

  const goToBusinessDetailsStep = () => {
    loadBusinessDetailsFromSession();
    closeAllDialogs();
    setShowBusinessDetailsDialog(true);
  };

  const goToBillingStep = () => {
    setShowBusinessDetailsDialog(false);
    setShowBillingSetupDialog(true);
  };

  const handleExitOnboarding = () => {
    markBillingPromptSeen();
    closeAllDialogs();
    router.push(routes.dashboard);
  };

  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") return;

    const hasBusinessIntent =
      sessionStorage.getItem(BUSINESS_INTENT_KEY) === "true";
    const hasSeenPrompt =
      sessionStorage.getItem(BUSINESS_BILLING_PROMPT_SEEN_KEY) === "true";

    if (hasBusinessIntent && !hasSeenPrompt) {
      setBusinessOrganization(
        sessionStorage.getItem("businessOrganizationName") ||
          authUser?.organization ||
          "",
      );
      setBusinessTeamSize(sessionStorage.getItem("businessTeamSize") || "");
      setBusinessTargetPcCount(
        normalizeBusinessTargetPcCount(
          sessionStorage.getItem("businessTargetPcCount"),
        ),
      );
      setBusinessUseCase(sessionStorage.getItem("businessUseCase") || "");
      setShowBusinessDetailsDialog(true);
      setShowBillingSetupDialog(false);
      setShowInviteUsersDialog(false);
      setShowBuildPcDialog(false);
    }
  }, [authUser?.organization, isAuthenticated]);

  useEffect(() => {
    if (!showBillingSetupDialog) return;

    const paymentCount = paymentMethodsData?.paymentMethods?.length ?? 0;
    if (paymentCount > 0) {
      setShowBusinessDetailsDialog(false);
      setShowBillingSetupDialog(false);
      setShowBuildPcDialog(false);
      setShowInviteUsersDialog(true);
    }
  }, [paymentMethodsData, showBillingSetupDialog]);

  const handleBusinessGetStarted = () => {
    if (!isAuthenticated) {
      resetBusinessOnboardingSession();
      router.push(ONBOARDING_LINKS.signup);
      return;
    }

    clearBusinessOnboardingIntent();
    closeAllDialogs();
    router.push(routes.dashboard);
  };

  const handleBusinessDetailsNext = async () => {
    const normalizedPcCount = normalizeBusinessTargetPcCount(
      businessTargetPcCount,
    );

    if (businessTargetPcCount !== normalizedPcCount) {
      setBusinessTargetPcCount(normalizedPcCount);
    }

    const validation = validateBusinessOnboardingDetails({
      organization: businessOrganization,
      teamSize: businessTeamSize,
      pcCount: normalizedPcCount,
      businessUseCase,
    });

    if (validation.error) {
      toast(validation.error);
      return;
    }

    setIsSavingBusinessDetails(true);

    try {
      const { teamSize, pcCount, businessUseCase: normalizedBusinessUseCase } =
        validation.data;
      const normalizedOrganization = businessOrganization.trim();

      await createBusinessDetails({
        teamSize,
        pcCount,
        businessUseCase: normalizedBusinessUseCase,
      }).unwrap();

      if (typeof window !== "undefined") {
        sessionStorage.setItem("businessOrganizationName", normalizedOrganization);
        sessionStorage.setItem("businessTeamSize", String(teamSize));
        sessionStorage.setItem("businessTargetPcCount", String(pcCount));
        sessionStorage.setItem("businessUseCase", normalizedBusinessUseCase);
      }

      goToBillingStep();
    } catch (error) {
      toast({
        title: "Failed to save business details",
        variant: "destructive",
        description: getErrorMessage(error, "Failed to save business details"),
      });
    } finally {
      setIsSavingBusinessDetails(false);
    }
  };

  const handleInviteUser = async ({
    email,
    role,
  }: BusinessOnboardingInviteUserFormValues) => {
    setIsInviting(true);

    try {
      const normalizedEmail = email.trim();
      const fallbackName = normalizedEmail.split("@")[0] || "User";

      await inviteUser({
        name: fallbackName,
        email: normalizedEmail,
        role,
        group: "",
      }).unwrap();

      toast({
        title: "Invitation sent",
        description: `Invite sent to ${normalizedEmail}`,
      });
      return true;
    } catch (error) {
      const maybeData = (error as { data?: { code?: unknown } })?.data;
      const code =
        typeof maybeData?.code === "string" ? maybeData.code : undefined;

      toast({
        title: "Failed to invite user",
        variant: "destructive",
        description:
          code === "EMAIL_ALREADY_EXISTS"
            ? "This email address is already invited."
            : getErrorMessage(error, "Failed to invite user"),
      });
      return false;
    } finally {
      setIsInviting(false);
    }
  };

  const invitedUsers = useMemo(
    () =>
      (usersData?.users || []).filter(
        (user: ApiUser) => user.role === "admin" || user.role === "member",
      ),
    [usersData?.users],
  );

  return {
    businessOrganization,
    businessTargetPcCount,
    businessTeamSize,
    businessUseCase,
    invitedUsers,
    isInviting,
    isSavingBusinessDetails,
    showBillingSetupDialog,
    showBuildPcDialog,
    showBusinessDetailsDialog,
    showInviteUsersDialog,
    onBusinessTargetPcCountBlur: () => {
      setBusinessTargetPcCount(
        normalizeBusinessTargetPcCount(businessTargetPcCount),
      );
    },
    onBusinessTargetPcCountChange: (value: string) => {
      const sanitizedValue = sanitizeBusinessTargetPcCountInput(value);

      if (sanitizedValue === null) {
        return;
      }

      setBusinessTargetPcCount(sanitizedValue);
    },
    onBusinessTeamSizeChange: setBusinessTeamSize,
    onBusinessUseCaseChange: setBusinessUseCase,
    onBillingDialogOpenChange: (open: boolean) => {
      if (open) {
        setShowBillingSetupDialog(true);
        return;
      }
      handleExitOnboarding();
    },
    onBillingNext: goToInviteUsersStep,
    onBillingPrevious: goToBusinessDetailsStep,
    onBuildNow: () => {
      markBillingPromptSeen();
      setShowBuildPcDialog(false);
      router.push(routes.dashboard);
    },
    onBuildPcDialogOpenChange: (open: boolean) => {
      if (open) {
        setShowBuildPcDialog(true);
        return;
      }
      handleExitOnboarding();
    },
    onBuildPrevious: goToInviteUsersStep,
    onBusinessDetailsDialogOpenChange: (open: boolean) => {
      if (open) {
        setShowBusinessDetailsDialog(true);
        return;
      }
      handleExitOnboarding();
    },
    onBusinessDetailsNext: handleBusinessDetailsNext,
    onGetStarted: handleBusinessGetStarted,
    onInviteNext: goToBuildPcStep,
    onInvitePrevious: goToBillingStep,
    onInviteUser: handleInviteUser,
    onInviteUsersDialogOpenChange: (open: boolean) => {
      if (open) {
        setShowInviteUsersDialog(true);
        return;
      }
      handleExitOnboarding();
    },
  };
}
