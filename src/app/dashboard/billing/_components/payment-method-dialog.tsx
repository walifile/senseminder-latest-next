"use client";

import type { RootState } from "@/redux/store";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useDetachPaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,
} from "@/api/billing";

import { Logger } from "@/lib/utils/logger";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { useSelector } from "react-redux";

import { useStripe, CardElement, useElements } from "@stripe/react-stripe-js";

import { Info, Lock, Loader2, CreditCard, ShieldCheck } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import type { ExtendedPaymentMethod, PaymentMethodResponse } from "../types";

export function PaymentMethodDialog() {
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const stripe = useStripe();
  const elements = useElements();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [makeDefaultId, setMakeDefaultId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(true);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<
    ExtendedPaymentMethod[]
  >([]);

  useEffect(() => {
    if (open && user?.firstName && !name) setName(user.firstName);
  }, [open, user?.firstName, name]);

  const { data, refetch, isFetching } = useGetPaymentMethodsQuery();
  const [addPaymentMethod] = useAddPaymentMethodMutation();
  const [setDefaultPaymentMethod] = useSetDefaultPaymentMethodMutation();
  const [detachPaymentMethod] = useDetachPaymentMethodMutation();

  useEffect(() => {
    if (data) {
      const mapped = mapPaymentMethodsFromAPI(data);
      setSavedPaymentMethods(mapped);
    }
     
  }, [data]);

  const mapPaymentMethodsFromAPI = (
    apiResponse: PaymentMethodResponse,
  ): ExtendedPaymentMethod[] => {
    const defaultId = apiResponse.defaultPaymentMethod?.id;
    return apiResponse.paymentMethods.map(
      (pm) =>
        ({
          id: pm.id,
          type: "card",
          card: {
            last4: pm.card.last4,
            exp_month: pm.card.exp_month,
            exp_year: pm.card.exp_year,
            brand: pm.card.brand,
          },
          isDefault: pm.id === defaultId,
        }) as ExtendedPaymentMethod,
    );
  };


  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const openRemoveConfirm = (paymentMethodId: string) => {
    setPendingRemoveId(paymentMethodId);
    setConfirmRemoveOpen(true);
  };

  const closeRemoveConfirm = () => {
    setConfirmRemoveOpen(false);
    setPendingRemoveId(null);
  };

  const confirmRemove = async () => {
    if (!pendingRemoveId) return;
    closeRemoveConfirm();
    await handleDeletePaymentMethod(pendingRemoveId);
  };


  const handleAdd = async () => {
    if (!stripe || !elements || !CardElement) {
      toast({
        title: "Payment error",
        description: "Stripe has not finished loading. Please try again.",
      });
      return;
    }

    setLoading(true);
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setLoading(false);
      throw new Error("Card element not found.");
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: { name: user!.firstName, email: user!.email },
    });

    if (error) {
      Logger.error(error);
      toast({
        title: "Failed to add payment method",
        description: "Please check the details and try again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      await addPaymentMethod({
        paymentMethodId: paymentMethod!.id,
        setAsDefault: savedPaymentMethods.length === 0,
      }).unwrap();

      toast({
        title: "Payment method added",
        description: "Your new payment method has been saved.",
      });

      const refreshed = await refetch().unwrap();
      setSavedPaymentMethods(mapPaymentMethodsFromAPI(refreshed));
      setShowAddForm(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to add payment method";
      toast({ title: "Error", description: message, variant: "destructive" });
    }

    setLoading(false);
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    setMakeDefaultId(paymentMethodId);
    try {
      await setDefaultPaymentMethod({ paymentMethodId }).unwrap();
      setSavedPaymentMethods((prev) =>
        prev.map((pm) =>
          pm.id === paymentMethodId
            ? { ...pm, isDefault: true }
            : { ...pm, isDefault: false },
        ),
      );
      toast({
        title: "Default updated",
        description: "Your default payment method has been updated.",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to set default payment method";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setMakeDefaultId(null);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    setDeletingId(paymentMethodId);
    try {
      const wasDefault =
        savedPaymentMethods.find((pm) => pm.id === paymentMethodId)
          ?.isDefault === true;

      await detachPaymentMethod({ paymentMethodId }).unwrap();

      const updated = savedPaymentMethods.filter(
        (pm) => pm.id !== paymentMethodId,
      );
      setSavedPaymentMethods(updated);

      toast({
        title: "Payment method removed",
        description: "Payment method has been removed successfully.",
      });

      const hasDefaultNow = updated.some((pm) => pm.isDefault);

      if (!hasDefaultNow && updated.length > 0) {
        const candidate =
          updated.length === 1
            ? updated[0]
            : wasDefault
              ? updated[updated.length - 1]
              : null;

        if (candidate) {
          setMakeDefaultId(candidate.id);
          try {
            await setDefaultPaymentMethod({
              paymentMethodId: candidate.id,
            }).unwrap();
            setSavedPaymentMethods((prev) =>
              prev.map((pm) =>
                pm.id === candidate.id
                  ? { ...pm, isDefault: true }
                  : { ...pm, isDefault: false },
              ),
            );
            toast({
              title: "Default updated",
              description:
                updated.length === 1
                  ? "Your remaining card was set as the default."
                  : "A new default card was selected automatically.",
            });
          } catch (err: unknown) {
            const message =
              err instanceof Error
                ? err.message
                : "Failed to set default payment method";
            toast({
              title: "Error",
              description: message,
              variant: "destructive",
            });
          } finally {
            setMakeDefaultId(null);
          }
        }
      }
    } catch (error: unknown) {
      console.error("Detach payment method error:", error);
      // Check for HTTP 400 error
      if (error && typeof error === 'object' && 'status' in error) {
        const rtkError = error as { status: number; data?: { message?: string } };

        if (rtkError.status === 400 && rtkError.data?.message) {
          toast({
            title: "Error",
            description: rtkError.data.message,
            variant: "destructive",
            duration: 7000,
          });
          setDeletingId(null);
          return;
        }
      }

      // Default error handling
      const message =
        error instanceof Error
          ? error.message
          : "Failed to remove the payment method";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  // theme-aware Stripe colors (keep)
  const isDarkMode =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const cardTextColor = isDarkMode ? "#ffffff" : "#454545";
  const cardPlaceholderColor = isDarkMode ? "#b9c2d5" : "#454545";

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <CreditCard className="h-4 w-4" />
        Manage Payment Methods
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-testid="dashboard-billing-payment-method-dialog"
          className="
            p-0
            max-w-none sm:max-w-none
            w-[min(92vw,48rem)]
            max-h-[calc(100vh-3rem)]
            overflow-y-auto
          "
        >
          <div
            className="
              rounded-2xl
              bg-white dark:bg-[#140947]
              px-5 sm:px-8
              pt-8 sm:pt-10
              pb-8 sm:pb-9
              flex flex-col
              gap-6 sm:gap-7
            "
          >
            {/* Header */}
            <DialogHeader className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-7 w-7 text-[#35D750] dark:text-[#4CC26C]" />
                <DialogTitle className="font-space-grotesk font-semibold text-xl sm:text-2xl tracking-[-0.02em] text-[#020816] dark:text-white">
                  Manage Payment Methods
                </DialogTitle>
              </div>

              <DialogDescription className="font-inter text-sm leading-5 text-[#454545] dark:text-[#A3A3A3]">
                We process payments securely via Stripe. Your card details never
                touch our servers.
              </DialogDescription>
            </DialogHeader>

            <div className="h-px w-full bg-black/10 dark:bg-white/15" />

         {/* Security bar (aligned) */}
          <div className="w-full overflow-hidden rounded-lg bg-[rgba(53,215,80,0.15)] px-4 py-3 dark:bg-[#1C144D]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              {/* Left */}
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Lock className="h-5 w-5 shrink-0 text-[#35D750] dark:text-[#4CC26C]" />
                <span className="font-inter text-sm leading-5 text-[#35D750] dark:text-[#4CC26C]">
                  Bank-grade encryption
                </span>
              </div>

              {/* Divider */}
              <div
                aria-hidden
                className="hidden sm:block h-6 w-px shrink-0 bg-[#35D750]/40 dark:bg-[#4CC26C]/40"
              />

              {/* Middle (keeps center aligned) */}
              <div className="flex min-w-0 flex-1 sm:justify-center">
                <span className="font-inter text-sm leading-5 text-[#35D750] dark:text-[#4CC26C] whitespace-nowrap">
                  PCI DSS Level 1 by Stripe
                </span>
              </div>

              {/* Divider */}
              <div
                aria-hidden
                className="hidden sm:block h-6 w-px shrink-0 bg-[#35D750]/40 dark:bg-[#4CC26C]/40"
              />

              {/* Right */}
              <div className="flex items-center gap-2 whitespace-nowrap sm:ml-auto">
                <span className="font-inter text-sm leading-5 text-[#35D750] dark:text-[#4CC26C]">
                  Powered by
                </span>
                <Image
                  src="/assets/icons/stripe-Logo.svg"
                  alt="Stripe"
                  width={64}
                  height={24}
                  priority
                  className="block h-6 w-auto shrink-0"
                />
              </div>
            </div>
          </div>

            {/* Add Card */}
            <section className="flex flex-col gap-4 sm:gap-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-space-grotesk font-semibold text-lg sm:text-xl text-[#020816] dark:text-white">
                  Add a New Card
                </h3>

                {!showAddForm && (
                  <Button variant="outline" onClick={() => setShowAddForm(true)}>
                    Add a card
                  </Button>
                )}
              </div>

              {showAddForm && (
                <div className="flex flex-col gap-5">
                  {/* Cardholder */}
                  <div className="flex flex-col gap-2">
                    <p className="font-inter font-semibold text-sm text-[#020816] dark:text-white">
                      Cardholder name
                    </p>

                    <Input
                      variant="glowing"
                      // if your Input.tsx supports this, it’ll make the fill match dialog bg
                      // if not, it’s harmless
                      wrapperClassName="bg-white dark:bg-[#140947]"
                      placeholder="Name on card"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="cc-name"
                    />
                  </div>

                  {/* Card details */}
                  <div className="flex flex-col gap-2">
                    <p className="font-inter font-semibold text-sm text-[#020816] dark:text-white">
                      Card details
                    </p>

                    <div
                      className="
                        rounded-lg
                        bg-[rgba(53,215,80,0.15)]
                        dark:bg-[#2A2067]
                        px-5 py-4
                      "
                    >
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              color: cardTextColor,
                              "::placeholder": { color: cardPlaceholderColor },
                              fontSmoothing: "antialiased",
                            },
                            invalid: { color: "#dc2626" },
                          },
                          hidePostalCode: true,
                        }}
                      />
                    </div>

                    <div className="mt-1 flex items-start gap-2">
                      <Info className="mt-0.5 h-4 w-4 opacity-60 text-[#454545] dark:text-[#B9C2D5]" />
                      <p className="font-inter text-sm leading-5 text-[#454545] dark:text-[#A3A3A3]">
                        We never store your full card number or CVC. Stripe
                        tokenizes your details.
                      </p>
                    </div>
                  </div>

                  {/* Buttons (no custom styling; layout only) */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button
                      disabled={!stripe || loading}
                      onClick={handleAdd}
                      className="w-full"
                    >
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving…
                        </span>
                      ) : (
                        "Save Card Securely"
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </section>

            <div className="h-px w-full bg-black/10 dark:bg-white/15" />

            {/* Saved cards */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-space-grotesk font-semibold text-lg sm:text-xl text-[#020816] dark:text-white">
                  Saved Cards
                </h3>

                {isFetching && (
                  <span className="inline-flex items-center gap-2 text-sm text-[#454545] dark:text-[#A3A3A3]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Refreshing…
                  </span>
                )}
              </div>

              <div className="w-full rounded-lg border border-[#8086F3] p-4">
                {savedPaymentMethods && savedPaymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {savedPaymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="w-full rounded-lg border border-black/10 px-4 py-3 dark:border-white/10"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-black/5 dark:bg-white/5">
                              <CreditCard className="h-5 w-5 text-[#454545] dark:text-[#B9C2D5]" />
                            </div>

                            <div className="flex flex-col">
                              <p className="font-inter font-semibold text-sm text-[#020816] dark:text-white">
                                {(method.card?.brand || "Card").toUpperCase()}{" "}
                                •••• {method.card?.last4}
                              </p>
                              <p className="font-inter text-sm text-[#454545] dark:text-[#A3A3A3]">
                                Expires {method.card?.exp_month}/
                                {method.card?.exp_year}
                              </p>

                              {method.isDefault && (
                                <span className="mt-1 inline-flex w-fit items-center rounded-full bg-[#35D750]/15 px-2 py-0.5 text-xs font-semibold text-[#35D750] dark:text-[#4CC26C]">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 sm:justify-end">
                            {!method.isDefault && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={makeDefaultId === method.id}
                                onClick={() =>
                                  handleSetDefaultPaymentMethod(method.id)
                                }
                              >
                                {makeDefaultId === method.id ? (
                                  <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Updating…
                                  </span>
                                ) : (
                                  "Make Default"
                                )}
                              </Button>
                            )}

                            {/* Remove matches outline/cancel style */}
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={deletingId === method.id}
                              onClick={() => openRemoveConfirm(method.id)}

                            >
                              {deletingId === method.id ? (
                                <span className="inline-flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Deleting…
                                </span>
                              ) : (
                                "Remove"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                    <CreditCard className="h-8 w-8 text-[#454545] dark:text-[#B9C2D5]" />
                    <p className="font-inter font-semibold text-sm text-[#454545] dark:text-white">
                      No payment methods saved yet.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddForm(true)}
                    >
                      Add a card
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2">
                <Lock className="mt-0.5 h-4 w-4 text-[#454545] dark:text-[#B9C2D5]" />
                <p className="font-inter text-sm leading-5 text-[#454545] dark:text-[#B9C2D5]">
                  Your information is transmitted securely over TLS and handled
                  by Stripe
                </p>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>
<Dialog
  open={confirmRemoveOpen}
  onOpenChange={(v) => {
    if (!v) closeRemoveConfirm();
  }}
>
  <DialogContent
    data-testid="dashboard-billing-payment-method-remove-dialog"
    className="w-[min(92vw,420px)] p-0"
  >
    <div className="rounded-[16px] bg-white px-5 py-6 dark:bg-[#140947] sm:px-6">
      <DialogHeader className="space-y-1 text-left">
        <DialogTitle className="font-space-grotesk text-[18px] font-semibold leading-6 text-[#020816] dark:text-white">
          Remove payment method?
        </DialogTitle>
        <DialogDescription className="font-inter text-[14px] leading-5 text-[#454545] dark:text-[#B9C2D5]">
          You can add it again at any time.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={closeRemoveConfirm}>
          Cancel
        </Button>

        <Button
          variant="destructive"
          disabled={!pendingRemoveId || deletingId === pendingRemoveId}
          onClick={confirmRemove}
        >
          {deletingId === pendingRemoveId ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Removing…
            </span>
          ) : (
            "Remove"
          )}
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

    </>
  );
}
