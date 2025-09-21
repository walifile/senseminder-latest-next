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

import { Lock } from "lucide-react";

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

  const { data, refetch } = useGetPaymentMethodsQuery();
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
    return apiResponse.paymentMethods.map((pm) => ({
      id: pm.id,
      type: "card",
      card: {
        last4: pm.card.last4,
        exp_month: pm.card.exp_month,
        exp_year: pm.card.exp_year,
        brand: pm.card.brand,
      },
      isDefault: pm.id === defaultId,
    })) as ExtendedPaymentMethod[];
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
      throw new Error("Card element not found.");
    }
    console.log("user:: ", user);
    setName(user!.firstName);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: { name: user!.firstName, email: user!.email },
    });

    if (error) {
      console.error(error);
      toast({
        title: "Failed add Payment Method",
        description: "Failed add Payment Method. Please try again.",
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
        description: "Your new payment method has been saved successfully.",
      });

      const refreshed = await refetch().unwrap();
      setSavedPaymentMethods(mapPaymentMethodsFromAPI(refreshed));
      console.log("after savedPaymentMethods:", savedPaymentMethods);

      setShowAddForm(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to add payment method";

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
    setName("");
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
        title: "Default payment method updated",
        description:
          "Your default payment method has been updated successfully.",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to set default payment method";

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setMakeDefaultId(null);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    setDeletingId(paymentMethodId);
    try {
      await detachPaymentMethod({ paymentMethodId }).unwrap();
      toast({
        title: "Payment method removed",
        description: "Payment method has been removed successfully.",
      });
      setSavedPaymentMethods((prev) =>
        prev.filter((pm) => pm.id !== paymentMethodId)
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to remove the payment method";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
    setDeletingId(null);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Payment Method</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-2xl shadow-xl border bg-gradient-to-b from-white to-gray-50">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-600" />
              <DialogTitle className="text-xl font-bold">
                Secure Payment Methods
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-600">
              Your payment details are encrypted and safely processed by Stripe.
              We never store your card details.
            </DialogDescription>
          </DialogHeader>

          {/* Add Card Form */}
          {!showAddForm && (
            <Button
              variant="outline"
              onClick={() => setShowAddForm(true)}
              className="w-full"
            >
              + Add Payment Method
            </Button>
          )}
          {showAddForm && (
            <div className="space-y-4 border rounded-xl p-5 shadow-sm bg-white">
              <h4 className="text-base font-semibold text-gray-800">
                Add a New Card
              </h4>
              <Input
                placeholder="Cardholder name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg"
              />
              <div className="border rounded-lg p-4 bg-gray-50">
                <CardElement
                  options={{
                    style: {
                      base: { fontSize: "16px", color: "#1a1a1a" },
                      invalid: { color: "#e5424d" },
                    },
                  }}
                />
              </div>

              <Button
                disabled={!stripe || loading}
                onClick={handleAdd}
                className="w-full font-semibold rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Saving..." : "Save Card Securely"}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-red-500 hover:bg-red-100 rounded-xl"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          )}
          <div className="flex items-center justify-end mt-6 text-xs text-gray-400">
            <Lock className="w-4 h-4 mr-1" />
            <span className="mr-* tracking-wide">Powered by</span>
            <Image
              src="/assets/icons/stripe-logo.svg"
              alt="Stripe"
              width={70}
              height={20}
            />
          </div>
          {/* Existing Payment Methods */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Saved Cards</h3>
            <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
              {savedPaymentMethods && savedPaymentMethods.length > 0 ? (
                savedPaymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between border rounded-md p-3 shadow-sm hover:bg-gray-50 transition"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {method.card?.brand.toUpperCase()} ••••{" "}
                        {method.card?.last4}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Expires {method.card?.exp_month}/{method.card?.exp_year}
                      </span>
                      {method.isDefault && (
                        <span className="text-xs font-semibold text-green-600">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!method.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={makeDefaultId === method.id}
                          onClick={() =>
                            handleSetDefaultPaymentMethod(method.id)
                          }
                        >
                          {makeDefaultId === method.id
                            ? "Updating..."
                            : "Make Default"}
                        </Button>
                      )}

                      <Button
                        key={method.id}
                        size="sm"
                        variant="outline"
                        disabled={deletingId === method.id}
                        className="px-3 py-1 rounded bg-red-600 text-white"
                        onClick={() => handleDeletePaymentMethod(method.id)}
                      >
                        {deletingId === method.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No payment methods saved.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
