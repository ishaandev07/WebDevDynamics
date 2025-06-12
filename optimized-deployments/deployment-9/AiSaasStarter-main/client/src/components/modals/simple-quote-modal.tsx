import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { QuoteWithCustomer, Customer } from "@shared/schema";

interface SimpleQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote?: QuoteWithCustomer | null;
  customers: Customer[];
  mode: "create" | "edit" | "view";
}

export function SimpleQuoteModal({ isOpen, onClose, quote, customers, mode }: SimpleQuoteModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    customerId: "",
    amount: "",
    description: "",
    status: "draft",
    validityDays: "30",
  });
  
  const { toast } = useToast();
  const isReadOnly = mode === "view";

  useEffect(() => {
    if (quote && isOpen) {
      setFormData({
        title: quote.title,
        customerId: quote.customerId.toString(),
        amount: quote.amount,
        description: quote.description || "",
        status: quote.status || "draft",
        validityDays: quote.validityDays?.toString() || "30",
      });
    } else if (!quote && isOpen) {
      setFormData({
        title: "",
        customerId: "",
        amount: "",
        description: "",
        status: "draft",
        validityDays: "30",
      });
    }
  }, [quote, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "create") {
      toast({
        title: "Quote Created",
        description: `Quote "${formData.title}" has been created successfully.`,
      });
    } else if (mode === "edit") {
      toast({
        title: "Quote Updated",
        description: `Quote "${formData.title}" has been updated successfully.`,
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New Quote"}
            {mode === "edit" && "Edit Quote"}
            {mode === "view" && "Quote Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isReadOnly}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Customer</Label>
            <Select
              value={formData.customerId}
              onValueChange={(value) => setFormData({ ...formData, customerId: value })}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              disabled={isReadOnly}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isReadOnly}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="validityDays">Validity (Days)</Label>
            <Input
              id="validityDays"
              type="number"
              value={formData.validityDays}
              onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
              disabled={isReadOnly}
              min="1"
            />
          </div>

          {!isReadOnly && (
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === "create" ? "Create Quote" : "Update Quote"}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}