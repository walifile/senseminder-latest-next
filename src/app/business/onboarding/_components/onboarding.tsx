"use client";

import FAQ from "@/app/home/_components/faq";
import { MainLayout } from "@/app/home/_components/main-layout";

import { BuildPcDialog } from "./build-pc-dialog";
import { InviteUsersDialog } from "./invite-users-dialog";
import { BillingSetupDialog } from "./billing-setup-dialog";
import { businessFaqItems } from "../data/onboarding-content";
import { BusinessDetailsDialog } from "./business-details-dialog";
import { useBusinessOnboardingFlow } from "../hooks/use-business-onboarding-flow";
import {
  QuickLinksSection,
  ValuePropsSection,
  TeamOnboardingHero,
  OnboardingStepsSection,
  TeamOnboardingCtaSection,
} from "./onboarding-sections";

export default function TeamOnboarding() {
  const {
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
    onBillingDialogOpenChange,
    onBillingNext,
    onBillingPrevious,
    onBuildNow,
    onBuildPcDialogOpenChange,
    onBuildPrevious,
    onBusinessDetailsDialogOpenChange,
    onBusinessDetailsNext,
    onBusinessTargetPcCountBlur,
    onBusinessTargetPcCountChange,
    onBusinessTeamSizeChange,
    onBusinessUseCaseChange,
    onGetStarted,
    onInviteNext,
    onInvitePrevious,
    onInviteUser,
    onInviteUsersDialogOpenChange,
  } = useBusinessOnboardingFlow();

  return (
    <MainLayout>
      <TeamOnboardingHero onGetStarted={onGetStarted} />

      <QuickLinksSection />
      <ValuePropsSection />
      <OnboardingStepsSection />
      <TeamOnboardingCtaSection onGetStarted={onGetStarted} />

      <FAQ
        items={businessFaqItems}
        title="Common questions from business teams"
        subtitle="If you do not see your question here, contact us and we will help."
      />

      <BusinessDetailsDialog
        open={showBusinessDetailsDialog}
        onOpenChange={onBusinessDetailsDialogOpenChange}
        businessOrganization={businessOrganization}
        businessTeamSize={businessTeamSize}
        onBusinessTeamSizeChange={onBusinessTeamSizeChange}
        businessTargetPcCount={businessTargetPcCount}
        onBusinessTargetPcCountBlur={onBusinessTargetPcCountBlur}
        onBusinessTargetPcCountChange={onBusinessTargetPcCountChange}
        businessUseCase={businessUseCase}
        onBusinessUseCaseChange={onBusinessUseCaseChange}
        onNext={onBusinessDetailsNext}
        isSavingBusinessDetails={isSavingBusinessDetails}
      />

      <BillingSetupDialog
        open={showBillingSetupDialog}
        onOpenChange={onBillingDialogOpenChange}
        onPrevious={onBillingPrevious}
        onNext={onBillingNext}
      />

      <BuildPcDialog
        open={showBuildPcDialog}
        onOpenChange={onBuildPcDialogOpenChange}
        onPrevious={onBuildPrevious}
        onBuildNow={onBuildNow}
      />

      <InviteUsersDialog
        open={showInviteUsersDialog}
        onOpenChange={onInviteUsersDialogOpenChange}
        isInviting={isInviting}
        invitedUsers={invitedUsers}
        onInviteUser={onInviteUser}
        onPrevious={onInvitePrevious}
        onNext={onInviteNext}
      />
    </MainLayout>
  );
}
