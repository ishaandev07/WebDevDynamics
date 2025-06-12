import { Link } from "wouter";
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
                SF
              </div>
              <span className="ml-3 text-xl font-bold">StayFitNFine</span>
            </div>
            <p className="text-neutral-300 mb-6">
              Transform your health with expert nutrition guidance from certified dietician Ishita Singh.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <LinkedinIcon className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <YoutubeIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-neutral-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/services" className="text-neutral-300 hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/about" className="text-neutral-300 hover:text-white transition-colors">About</Link></li>
              <li><Link href="/testimonials" className="text-neutral-300 hover:text-white transition-colors">Testimonials</Link></li>
              <li><Link href="/blog" className="text-neutral-300 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Basic Consultation</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Premium Consultation</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">VIP Package</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Weight Loss Programs</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Diabetes Care</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
            <div className="space-y-3">
              <div className="text-neutral-300">
                <strong>Address:</strong><br />
                Mumbai, Maharashtra, India
              </div>
              <div className="text-neutral-300">
                <strong>Phone:</strong><br />
                +91 98765 43210
              </div>
              <div className="text-neutral-300">
                <strong>Email:</strong><br />
                ishita@stayfitnfine.com
              </div>
              <div className="text-neutral-300">
                <strong>Hours:</strong><br />
                Mon-Sat: 9AM-7PM
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 mt-12 pt-8 text-center">
          <p className="text-neutral-400">
            © 2023 StayFitNFine. All rights reserved. | 
            <a href="#" className="hover:text-white transition-colors ml-1">Privacy Policy</a> | 
            <a href="#" className="hover:text-white transition-colors ml-1">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
