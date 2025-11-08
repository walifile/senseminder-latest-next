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
    apiResponse: PaymentMethodResponse
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
        } as ExtendedPaymentMethod)
    );
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
            : { ...pm, isDefault: false }
        )
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

  // Updated per your rules:
  // - If only one remains after deletion and it's not default → make it default
  // - If deleting the default while multiple remain → set the latest (last item) as default
  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    setDeletingId(paymentMethodId);
    try {
      const wasDefault =
        savedPaymentMethods.find((pm) => pm.id === paymentMethodId)
          ?.isDefault === true;

      await detachPaymentMethod({ paymentMethodId }).unwrap();

      const updated = savedPaymentMethods.filter(
        (pm) => pm.id !== paymentMethodId
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
                  : { ...pm, isDefault: false }
              )
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
      const message =
        error instanceof Error
          ? error.message
          : "Failed to remove the payment method";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <CreditCard className="h-4 w-4" />
        Add Payment Method
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-xl sm:max-w-xl rounded-2xl border bg-white p-0 dark:bg-slate-900 dark:border-slate-800 overflow-y-auto max-h-screen sm:mx-auto mx-2">
          <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <DialogTitle className="text-xl font-semibold dark:text-slate-100">
                Manage Payment Methods
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground dark:text-slate-400">
              We process payments securely via Stripe. Your card details never
              touch our servers.
            </DialogDescription>
          </DialogHeader>

          <div className="mx-2 sm:mx-6 mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 rounded-lg border bg-gradient-to-r from-emerald-50 to-emerald-100/60 px-3 sm:px-4 py-2.5 text-xs text-emerald-900 dark:from-emerald-900/30 dark:to-emerald-800/20 dark:border-emerald-900/40 dark:text-emerald-200">
            <Lock className="h-4 w-4" />
            <span className="font-medium">Bank-grade encryption</span>
            <span className="mx-2">•</span>
            <span>PCI DSS Level 1 by Stripe</span>
            <span className="ml-auto flex items-center gap-2">
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300">
                Powered by
              </span>
              <Image
                src="/assets/icons/stripe-Logo.svg"
                alt="Stripe"
                width={60}
                height={18}
                priority
                className="opacity-90 dark:opacity-80"
              />
            </span>
          </div>

          <div className="px-2 pb-4 sm:px-6 sm:pb-6">
            <section className="mt-4 sm:mt-6">
              {!showAddForm && (
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(true)}
                  className="w-full rounded-xl dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  + Add Payment Method
                </Button>
              )}

              {showAddForm && (
                <div className="rounded-xl border bg-white p-3 sm:p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                  <h4 className="mb-3 text-base font-semibold dark:text-slate-100">
                    Add a New Card
                  </h4>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium dark:text-slate-200">
                      Cardholder name
                      <Input
                        placeholder="Name on card"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
                        autoComplete="cc-name"
                      />
                    </label>

                    <label className="block text-sm font-medium dark:text-slate-200">
                      Card details
                      <div className="mt-1 rounded-lg border bg-gray-50 p-3 dark:bg-slate-800 dark:border-slate-700">
                        <CardElement
                          options={{
                            style: {
                              base: {
                                fontSize: "16px",
                                color: "#0f172a",
                                "::placeholder": { color: "#94a3b8" },
                                fontSmoothing: "antialiased",
                              },
                              invalid: { color: "#dc2626" },
                            },
                            hidePostalCode: true,
                          }}
                        />
                      </div>
                    </label>

                    <p className="mt-1 flex items-start gap-2 text-xs text-muted-foreground dark:text-slate-400">
                      <Info className="mt-0.5 h-3.5 w-3.5" />
                      We never store your full card number or CVC. Stripe
                      tokenizes your details.
                    </p>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Button
                        disabled={!stripe || loading}
                        onClick={handleAdd}
                        className="w-full rounded-xl"
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
                        variant="ghost"
                        className="w-full rounded-xl dark:text-slate-300 dark:hover:bg-slate-800"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <div className="my-4 sm:my-6 border-t dark:border-slate-800" />

            <section>
              <div className="mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h3 className="text-lg font-semibold dark:text-slate-100">
                  Saved Cards
                </h3>
                {isFetching && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground dark:text-slate-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Refreshing…
                  </span>
                )}
              </div>

              <div className="max-h-64 space-y-3 overflow-y-auto pr-0 sm:pr-1">
                {savedPaymentMethods && savedPaymentMethods.length > 0 ? (
                  savedPaymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between rounded-lg border p-3 shadow-sm transition hover:bg-gray-50 dark:hover:bg-slate-800 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                          <CreditCard className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="font-medium dark:text-slate-100">
                            {(method.card?.brand || "Card").toUpperCase()} ••••{" "}
                            {method.card?.last4}
                          </span>
                          <span className="text-sm text-muted-foreground dark:text-slate-400">
                            Expires {method.card?.exp_month}/
                            {method.card?.exp_year}
                          </span>
                          {method.isDefault && (
                            <span className="mt-1 inline-flex w-fit items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                              Default
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!method.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={makeDefaultId === method.id}
                            onClick={() =>
                              handleSetDefaultPaymentMethod(method.id)
                            }
                            className="dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                          >
                            {makeDefaultId === method.id ? (
                              <span className="inline-flex items-center gap-1">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Updating…
                              </span>
                            ) : (
                              "Make Default"
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={deletingId === method.id}
                          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-900/20"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Remove this payment method? You can add it again at any time."
                              )
                            ) {
                              handleDeletePaymentMethod(method.id);
                            }
                          }}
                        >
                          {deletingId === method.id ? (
                            <span className="inline-flex items-center gap-1">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Deleting…
                            </span>
                          ) : (
                            "Remove"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border bg-slate-50 p-4 sm:p-6 text-center dark:bg-slate-900 dark:border-slate-800">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow dark:bg-slate-800">
                      <CreditCard className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                      No payment methods saved yet.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-3 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                      onClick={() => setShowAddForm(true)}
                    >
                      Add a card
                    </Button>
                  </div>
                )}
              </div>
            </section>

            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-[11px] text-muted-foreground dark:text-slate-400">
              <Lock className="h-3.5 w-3.5" />
              Your information is transmitted securely over TLS and handled by
              Stripe.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
