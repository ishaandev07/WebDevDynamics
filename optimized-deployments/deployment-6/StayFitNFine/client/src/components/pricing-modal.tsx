import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CreditCard } from "lucide-react";
import type { PricingPackage } from "@/lib/types";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: PricingPackage | null;
  onProceedToBooking: () => void;
}

export function PricingModal({ isOpen, onClose, selectedPackage, onProceedToBooking }: PricingModalProps) {
  if (!selectedPackage) return null;

  const handleProceed = () => {
    onClose();
    onProceedToBooking();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Payment Options</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{selectedPackage.name}</h3>
              <div className="text-2xl font-bold text-blue-600 mb-2">{selectedPackage.price}</div>
              <p className="text-sm text-gray-600">{selectedPackage.description}</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-800 font-medium">
                  Payment gateway integration coming soon!
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                For now, payment will be collected during your consultation.
              </p>
            </CardContent>
          </Card>

          {/* Payment Gateway Placeholder */}
          <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
            <CardContent className="p-6 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Payment Gateway Integration
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Secure payment processing will be integrated here. Supports all major payment methods.
              </p>
              <div className="flex justify-center space-x-4 text-gray-400">
                <i className="fab fa-cc-visa text-2xl"></i>
                <i className="fab fa-cc-mastercard text-2xl"></i>
                <i className="fab fa-cc-paypal text-2xl"></i>
                <i className="fas fa-university text-2xl"></i>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button 
              onClick={handleProceed}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Proceed to Booking
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
