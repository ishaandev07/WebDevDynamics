import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { CALENDLY_CONFIG } from '@/lib/constants';

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  consultationType: string;
  healthGoals?: string;
  paymentMethod?: string;
}

export function useBookingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await apiRequest('POST', '/api/bookings', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Booking Created Successfully!",
        description: "You will be redirected to Calendly to schedule your appointment.",
      });
      
      // Redirect to Calendly with prefilled information
      const calendlyUrl = data.booking.calendlyUrl;
      window.open(calendlyUrl, '_blank');
      
      // Close modal and reset
      closeModal();
      
      // Invalidate and refetch any relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
    },
    onError: (error: any) => {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const openModal = (plan?: string) => {
    setIsOpen(true);
    if (plan) {
      setSelectedPlan(plan);
      setCurrentStep(2); // Skip plan selection if plan is provided
    } else {
      setCurrentStep(1);
    }
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedPlan(null);
    setCurrentStep(1);
    document.body.style.overflow = 'auto';
  };

  const selectPlan = (plan: string) => {
    setSelectedPlan(plan);
    setCurrentStep(2);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const submitBooking = (formData: BookingFormData) => {
    if (!selectedPlan) {
      toast({
        title: "No Plan Selected",
        description: "Please select a consultation plan first.",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      ...formData,
      consultationType: selectedPlan,
    };

    bookingMutation.mutate(bookingData);
  };

  return {
    isOpen,
    selectedPlan,
    currentStep,
    isSubmitting: bookingMutation.isPending,
    openModal,
    closeModal,
    selectPlan,
    goToStep,
    submitBooking,
  };
}
