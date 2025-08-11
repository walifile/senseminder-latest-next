"use client";

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button'; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input'; 
import { useToast } from "@/hooks/use-toast";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { addPaymentMethod, setDefaultPaymentMethod } from '@/api/billing';
import { ExtendedPaymentMethod } from '@/app/dashboard/billing/page';

interface PaymentMethodDialogProps {
  onAddMethod: (method: any) => void;
  onSetDefault: (id: string) => void;
  savedMethods: ExtendedPaymentMethod[];  
}

export function PaymentMethodDialog({ onAddMethod, savedMethods, onSetDefault }: PaymentMethodDialogProps) {
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const stripe = useStripe();
  const elements = useElements();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(true);

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
      console.log("paymentMethod", JSON.stringify({...paymentMethod, isDefault: (!savedMethods || savedMethods.length == 0)}));
      const result = await addPaymentMethod({ paymentMethodId: paymentMethod!.id });
      onAddMethod({...result.paymentMethod, isDefault: (!savedMethods || savedMethods.length == 0)});
      setOpen(false);
      setShowAddForm(false);
    } catch (error: unknown) {
      const message = error instanceof Error
          ? error.message : "Failed to add payment method";

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
    setName('');
    setLoading(false);
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    setLoading(true);
    try {
      console.log("set default paymentMethod", paymentMethodId);
      const result = await setDefaultPaymentMethod({ paymentMethodId: paymentMethodId });
      onSetDefault(paymentMethodId);
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error
          ? error.message : "Failed to set default payment method";

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
  <>
    <Button onClick={() => setOpen(true)}>Add Payment Method</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Payment Methods</DialogTitle>
          <DialogDescription>Add or manage your saved cards.</DialogDescription>
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
          <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
          <Button disabled={!stripe || loading} onClick={handleAdd} className="w-full">
            {loading ? 'Adding...' : 'Add Card'}
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
          {(savedMethods && savedMethods.length > 0) ? (
            savedMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between border p-3 rounded-md"
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {method.card?.brand.toUpperCase()} •••• {method.card?.last4}
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