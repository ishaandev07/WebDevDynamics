import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import BookingModal from "@/components/modals/booking-modal";

export default function Navbar() {
  const [location] = useLocation();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const navItems = [
    { href: "/#home", label: "Home" },
    { href: "/#services", label: "Services" },
    { href: "/#about", label: "About" },
    { href: "/#testimonials", label: "Testimonials" },
    { href: "/blog", label: "Blog" },
  ];

  const scrollToSection = (elementId: string) => {
    if (location !== "/") {
      window.location.href = `/${elementId}`;
      return;
    }
    
    const element = document.querySelector(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SF</span>
              </div>
              <span className="text-xl font-bold text-neutral-800">StayFitNFine</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                item.href.startsWith("/#") ? (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href.substring(1))}
                    className="text-neutral-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-neutral-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              ))}
              <Button 
                onClick={() => setIsBookingModalOpen(true)}
                className="bg-primary hover:bg-green-600"
              >
                Book Consultation
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navItems.map((item) => (
                      item.href.startsWith("/#") ? (
                        <button
                          key={item.href}
                          onClick={() => scrollToSection(item.href.substring(1))}
                          className="text-left px-3 py-2 text-neutral-600 hover:text-primary transition-colors"
                        >
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="px-3 py-2 text-neutral-600 hover:text-primary transition-colors"
                        >
                          {item.label}
                        </Link>
                      )
                    ))}
                    <Button 
                      onClick={() => setIsBookingModalOpen(true)}
                      className="mt-4 bg-primary hover:bg-green-600"
                    >
                      Book Consultation
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </>
  );
}
