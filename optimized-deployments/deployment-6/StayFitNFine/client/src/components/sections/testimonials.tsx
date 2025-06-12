import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Quote } from 'lucide-react';

export function TestimonialsSection() {
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['/api/testimonials'],
  });

  if (isLoading) {
    return (
      <section id="testimonials" className="section-padding bg-background">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Client Success Stories</h2>
            <p className="text-xl text-muted-foreground">
              See what our clients say about their transformation journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-20 w-full" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16 mt-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="section-padding bg-background">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Client Success Stories</h2>
          <p className="text-xl text-muted-foreground">
            See what our clients say about their transformation journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials?.map((testimonial: any) => (
            <Card key={testimonial.id} className="h-full transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-8 h-full flex flex-col">
                <div className="flex items-center mb-6">
                  <div className="flex text-yellow-500">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>

                <div className="flex-1 mb-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <p className="text-muted-foreground italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.imageUrl || `https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face`}
                    alt={`${testimonial.clientName} - Happy Client`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.clientName}</div>
                    {testimonial.clientTitle && (
                      <div className="text-sm text-muted-foreground">{testimonial.clientTitle}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!testimonials || testimonials.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No testimonials available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
