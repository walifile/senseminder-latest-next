"use client";

import React, { useEffect, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { addPaymentMethod, setDefaultPaymentMethod } from "@/api/billing";
import { getPaymentMethods } from "@/api/billing";
import { ExtendedPaymentMethod } from "../types";

export function PaymentMethodDialog() {
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const stripe = useStripe();
  const elements = useElements();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(true);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<
    ExtendedPaymentMethod[]
  >([]);

  const fetchPaymentMethods = async () => {
    try {
      const data = await getPaymentMethods();
      const mapped = mapPaymentMethodsFromAPI(data);
      setSavedPaymentMethods(mapped);
    } catch (error: unknown) {
      console.error("Failed to load payment methods:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Could not fetch payment methods.";
      toast({
        title: "Error loading payment methods",
        description: message,
      });
    }
  };

  const mapPaymentMethodsFromAPI = (
    apiResponse: any
  ): ExtendedPaymentMethod[] => {
    const defaultId = apiResponse.defaultPaymentMethod?.id;
    return apiResponse.paymentMethods.map((pm: any) => ({
      id: pm.id,
      type: "card",
      card: {
        last4: pm.card.last4,
        exp_month: pm.card.exp_month,
        exp_year: pm.card.exp_year,
        brand: pm.card.brand,
      },
      isDefault: pm.id === defaultId,
    }));
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

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
      const result = await addPaymentMethod({
        paymentMethodId: paymentMethod!.id,
      });
      setSavedPaymentMethods((prev) => [
        ...prev,
        {
          ...result.paymentMethod,
          isDefault: !savedPaymentMethods || savedPaymentMethods.length == 0,
        },
      ]);
      toast({
        title: "Payment method added",
        description: "Your new payment method has been saved successfully.",
      });
      setOpen(false);
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
    setLoading(true);
    try {
      console.log("set default paymentMethod", paymentMethodId);
      const result = await setDefaultPaymentMethod({
        paymentMethodId,
      });
      setSavedPaymentMethods((prev) =>
        prev.map((method) => ({
          ...method,
          isDefault: method.id === paymentMethodId,
        }))
      );
      toast({
        title: "Default payment method updated",
        description:
          "Your default payment method has been updated successfully.",
      });
      setOpen(false);
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
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Payment Method</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Payment Methods</DialogTitle>
            <DialogDescription>
              Add or manage your saved cards.
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
            <div className="space-y-4">
              <Input
                placeholder="Cardholder name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <CardElement
                options={{ style: { base: { fontSize: "16px" } } }}
              />
              <Button
                disabled={!stripe || loading}
                onClick={handleAdd}
                className="w-full"
              >
                {loading ? "Adding..." : "Add Card"}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-red-500"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Existing Payment Methods */}
          <div className="mt-6 space-y-4">
            {savedPaymentMethods && savedPaymentMethods.length > 0 ? (
              savedPaymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between border p-3 rounded-md"
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
                      <span className="text-xs text-green-600">Default</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefaultPaymentMethod(method.id)}
                      >
                        Make Default
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No payment methods saved.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
