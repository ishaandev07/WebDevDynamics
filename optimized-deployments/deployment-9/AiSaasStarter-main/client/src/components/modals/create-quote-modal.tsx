import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertQuoteSchema, type QuoteWithCustomer, type InsertQuote, type Customer } from "@shared/schema";
import { z } from "zod";

const quoteFormSchema = insertQuoteSchema.extend({
  id: z.number().optional(),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

interface CreateQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote?: QuoteWithCustomer | null;
  mode: "create" | "edit" | "view";
}

export function CreateQuoteModal({ isOpen, onClose, quote, mode }: CreateQuoteModalProps) {
  const { toast } = useToast();
  const isReadOnly = mode === "view";

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      customerId: 0,
      title: "",
      description: "",
      amount: 0,
      status: "draft",
      validUntil: "",
    },
  });

  useEffect(() => {
    if (quote && isOpen) {
      form.reset({
        ...quote,
        validUntil: quote.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : "",
      });
    } else if (!quote && isOpen) {
      form.reset({
        customerId: 0,
        title: "",
        description: "",
        amount: 0,
        status: "draft",
        validUntil: "",
      });
    }
  }, [quote, isOpen, form]);

  const createQuoteMutation = useMutation({
    mutationFn: async (data: InsertQuote) => {
      return await apiRequest("POST", "/api/quotes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Success",
        description: "Quote created successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create quote",
        variant: "destructive",
      });
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: async (data: QuoteFormData) => {
      return await apiRequest("PATCH", `/api/quotes/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Success",
        description: "Quote updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update quote",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuoteFormData) => {
    const processedData = {
      ...data,
      validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,
    };

    if (mode === "edit" && quote) {
      updateQuoteMutation.mutate({ ...processedData, id: quote.id });
    } else if (mode === "create") {
      const { id, ...createData } = processedData;
      createQuoteMutation.mutate(createData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New Quote"}
            {mode === "edit" && "Edit Quote"}
            {mode === "view" && "Quote Details"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={isReadOnly}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name} - {customer.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isReadOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isReadOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      disabled={isReadOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isReadOnly}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validUntil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid Until</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" disabled={isReadOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isReadOnly && (
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createQuoteMutation.isPending || updateQuoteMutation.isPending}
                >
                  {mode === "create" ? "Create" : "Update"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}