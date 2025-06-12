import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SF</span>
              </div>
              <span className="text-xl font-bold">StayFitNFine</span>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              Transform your health with expert nutrition guidance from certified dietician Ishita Singh.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#home" className="text-neutral-300 hover:text-white transition-colors">Home</a></li>
              <li><a href="#services" className="text-neutral-300 hover:text-white transition-colors">Services</a></li>
              <li><a href="#about" className="text-neutral-300 hover:text-white transition-colors">About</a></li>
              <li><a href="#testimonials" className="text-neutral-300 hover:text-white transition-colors">Testimonials</a></li>
              <li><Link href="/blog" className="text-neutral-300 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Weight Management</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Clinical Nutrition</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Sports Nutrition</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Diabetes Care</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Plant-Based Nutrition</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
            <div className="space-y-3 text-neutral-300">
              <div className="flex items-center space-x-3">
                <i className="fas fa-map-marker-alt"></i>
                <span>Mumbai, Maharashtra</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-phone"></i>
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-envelope"></i>
                <span>ishita@stayfitnfine.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-clock"></i>
                <span>Mon-Sat: 9AM-7PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-12 pt-8 text-center">
          <p className="text-neutral-400">
            © {currentYear} StayFitNFine. All rights reserved. | 
            <a href="#" className="hover:text-white transition-colors ml-1">Privacy Policy</a> | 
            <a href="#" className="hover:text-white transition-colors ml-1">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
