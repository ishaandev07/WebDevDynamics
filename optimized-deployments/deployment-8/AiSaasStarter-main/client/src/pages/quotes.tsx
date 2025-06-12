import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SimpleQuoteModal } from "@/components/modals/simple-quote-modal";
import { Plus, FileText, Eye, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { QuoteWithCustomer, Customer } from "@shared/schema";

export default function Quotes() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteWithCustomer | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  
  const { toast } = useToast();

  const { data: quotes = [], isLoading } = useQuery<QuoteWithCustomer[]>({
    queryKey: ["/api/quotes"],
  });

  const { data: customersData = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/quotes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Success",
        description: "Quote deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete quote",
        variant: "destructive",
      });
    },
  });

  const handleCreateQuote = () => {
    setSelectedQuote(null);
    setModalMode("create");
    setIsCreateModalOpen(true);
  };

  const handleViewQuote = (quote: QuoteWithCustomer) => {
    setSelectedQuote(quote);
    setModalMode("view");
    setIsCreateModalOpen(true);
  };

  const handleEditQuote = (quote: QuoteWithCustomer) => {
    setSelectedQuote(quote);
    setModalMode("edit");
    setIsCreateModalOpen(true);
  };

  const handleDeleteQuote = async (quote: QuoteWithCustomer) => {
    if (confirm(`Are you sure you want to delete quote ${quote.quoteNumber}?`)) {
      deleteQuoteMutation.mutate(quote.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quotes</h1>
            <p className="text-muted-foreground mt-2">Create and manage your quotes and proposals.</p>
          </div>
          <Button onClick={handleCreateQuote}>
            <Plus className="w-4 h-4 mr-2" />
            Create Quote
          </Button>
        </div>

        {/* Quotes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : quotes.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No quotes yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first quote to get started with managing proposals.
              </p>
              <Button onClick={handleCreateQuote}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Quote
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quotes.map((quote) => (
              <Card key={quote.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{quote.quoteNumber}</span>
                    </div>
                    {getStatusBadge(quote.status)}
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">{quote.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {quote.description || "No description provided"}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="text-foreground">{quote.customer.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="text-foreground font-medium">{formatAmount(quote.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="text-foreground">{new Date(quote.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewQuote(quote)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditQuote(quote)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteQuote(quote)}
                      disabled={deleteQuoteMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <SimpleQuoteModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          quote={selectedQuote}
          customers={customersData || []}
          mode={modalMode}
        />
      </div>
    </div>
  );
}
