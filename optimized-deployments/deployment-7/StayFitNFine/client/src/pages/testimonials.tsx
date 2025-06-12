import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon } from "lucide-react";
import Footer from "@/components/footer";
import type { Testimonial } from "@shared/schema";

export default function Testimonials() {
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      <div className="bg-gradient-to-br from-neutral-50 to-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6">
              Client Success Stories
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              See what our clients say about their transformation journey with personalized nutrition guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials?.map((testimonial) => (
              <Card key={testimonial.id} className="border border-neutral-200">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} className="h-5 w-5 text-accent fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-neutral-700 mb-6 italic">
                    "{testimonial.testimonialText}"
                  </p>
                  <div className="flex items-center">
                    {testimonial.clientImage && (
                      <img 
                        src={testimonial.clientImage} 
                        alt={testimonial.clientName}
                        className="w-12 h-12 rounded-full mr-4 object-cover"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-neutral-800">
                        {testimonial.clientName}
                      </div>
                      {testimonial.clientTitle && (
                        <div className="text-neutral-600 text-sm">
                          {testimonial.clientTitle}
                        </div>
                      )}
                      {testimonial.achievement && (
                        <div className="text-primary text-sm font-medium">
                          {testimonial.achievement}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!testimonials || testimonials.length === 0) && (
            <div className="text-center py-12">
              <p className="text-neutral-600">No testimonials available at the moment.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
