import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import type { Testimonial } from "@shared/schema";

export default function Testimonials() {
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials?approved=true"],
  });

  if (isLoading) {
    return (
      <section id="testimonials" className="section-padding bg-neutral-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="animate-pulse space-y-8">
            <div className="text-center">
              <div className="h-12 bg-neutral-200 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-6 bg-neutral-200 rounded w-3/4 mx-auto"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-neutral-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const featuredTestimonials = testimonials?.filter(t => t.featured) || [];

  return (
    <section id="testimonials" className="section-padding bg-neutral-50">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-800 mb-4">
            Client <span className="text-gradient">Success Stories</span>
          </h2>
          <p className="text-xl text-neutral-600">
            See what our clients say about their transformation journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className="testimonial-card">
              <CardContent className="p-8">
                {/* Rating */}
                <div className="flex mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                {/* Testimonial Text */}
                <p className="text-neutral-700 mb-6 italic leading-relaxed">
                  "{testimonial.testimonialText}"
                </p>
                
                {/* Client Info */}
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.imageUrl || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"} 
                    alt={`${testimonial.clientName} testimonial photo`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-neutral-800">
                      {testimonial.clientName}
                    </div>
                    {testimonial.clientTitle && (
                      <div className="text-neutral-600 text-sm">
                        {testimonial.clientTitle}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {featuredTestimonials.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <p className="text-xl text-neutral-600">
              No testimonials available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
