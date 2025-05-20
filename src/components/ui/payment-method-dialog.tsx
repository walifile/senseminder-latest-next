import * as React from "react";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PaymentMethod {
  id: string;
  type: "card";
  last4: string;
  expMonth: number;
  expYear: number;
  brand: string;
  isDefault: boolean;
}

interface NewCard {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

interface PaymentMethodDialogProps {
  savedMethods: PaymentMethod[];
  onAddMethod: (data: NewCard) => void;
  onRemoveMethod: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function PaymentMethodDialog({
  savedMethods,
  onAddMethod,
  onRemoveMethod,
  onSetDefault,
}: PaymentMethodDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isAddingNew, setIsAddingNew] = React.useState(false);
  const [newCard, setNewCard] = React.useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send this to your payment processor
    onAddMethod(newCard);
    setNewCard({ number: "", expiry: "", cvc: "", name: "" });
    setIsAddingNew(false);
  };

  const getBrandIcon = (brand: string) => {
    console.log(brand);
    // You can add more card brand icons here
    return <CreditCard className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <CreditCard className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Payment Methods</DialogTitle>
          <DialogDescription>
            Manage your saved payment methods or add a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Saved Payment Methods */}
          {savedMethods.map((method) => (
            <Card
              key={method.id}
              className={cn(
                "relative group cursor-pointer transition-colors",
                method.isDefault && "border-primary"
              )}
              onClick={() => !method.isDefault && onSetDefault(method.id)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getBrandIcon(method.brand)}
                  <div>
                    <p className="font-medium">
                      {method.brand} •••• {method.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires {method.expMonth}/{method.expYear}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveMethod(method.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Payment Method Form */}
          {isAddingNew ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Cardholder Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newCard.name}
                  onChange={(e) =>
                    setNewCard({ ...newCard, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Card Number</Label>
                <Input
                  id="number"
                  placeholder="1234 5678 9012 3456"
                  value={newCard.number}
                  onChange={(e) =>
                    setNewCard({ ...newCard, number: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={newCard.expiry}
                    onChange={(e) =>
                      setNewCard({ ...newCard, expiry: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={newCard.cvc}
                    onChange={(e) =>
                      setNewCard({ ...newCard, cvc: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingNew(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Card</Button>
              </DialogFooter>
            </form>
          ) : (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Card
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
