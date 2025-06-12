import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Contact() {
  return (
    <div className="pt-16">
      <div className="bg-gradient-to-br from-neutral-50 to-primary/5 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6">
            Get In Touch
          </h1>
          <p className="text-xl text-neutral-600">
            Ready to start your nutrition journey? Contact us today to schedule your consultation.
          </p>
        </div>
      </div>
      <ContactSection />
      <Footer />
    </div>
  );
}
