import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MenuIcon, XIcon, User, LogOut } from "lucide-react";
import BookingModal from "./booking-modal";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  const toolItems = [
    { label: "BMI Calculator", href: "/bmi-calculator" },
    { label: "Calorie Calculator", href: "/calorie-calculator" },
    { label: "Health Assessment", href: "/health-assessment" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <nav className="bg-white shadow-lg fixed w-full z-50 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  SF
                </div>
                <span className="ml-3 text-xl font-bold text-gray-800">StayFitNFine</span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex lg:items-center lg:space-x-6">
              {/* Main Navigation */}
              <div className="flex items-center space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "text-green-600"
                        : "text-gray-600 hover:text-green-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Health Tools Dropdown */}
              <div className="relative group">
                <button className="text-sm font-medium text-gray-600 hover:text-green-600 flex items-center">
                  Health Tools
                  <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {toolItems.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 first:rounded-t-md last:rounded-b-md"
                    >
                      {tool.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Authentication & CTA */}
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-green-600"
                    >
                      <User className="h-4 w-4" />
                      <span>{user?.firstName || 'Dashboard'}</span>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={logout}
                      className="text-gray-600 border-gray-300 hover:border-green-600 hover:text-green-600"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:border-green-600 hover:text-green-600">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
                
                <Button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Book Consultation
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <XIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t shadow-lg">
            <div className="px-4 pt-4 pb-6 space-y-3">
              {/* Main Navigation */}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    isActive(item.href)
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Health Tools */}
              <div className="border-t pt-3 mt-3">
                <div className="text-sm font-semibold text-gray-500 mb-2 px-3">Health Tools</div>
                {toolItems.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {tool.label}
                  </Link>
                ))}
              </div>
              
              {/* Authentication & CTA */}
              <div className="border-t pt-3 mt-3 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>{user?.firstName || 'Dashboard'}</span>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full text-gray-600 border-gray-300"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full text-gray-600 border-gray-300">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
                
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsBookingModalOpen(true);
                  }}
                >
                  Book Consultation
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </>
  );
}