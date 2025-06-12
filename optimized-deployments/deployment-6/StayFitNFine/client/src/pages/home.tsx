import HeroSection from "@/components/hero-section";
import ServicesSection from "@/components/services-section";
import AboutSection from "@/components/about-section";
import TestimonialsSection from "@/components/testimonials-section";
import BlogSection from "@/components/blog-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="pt-16">
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <TestimonialsSection />
      <BlogSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
