import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Clock, Calendar } from 'lucide-react';

export function BlogPreviewSection() {
  const { data: blogPosts, isLoading } = useQuery({
    queryKey: ['/api/blog?limit=3'],
  });

  if (isLoading) {
    return (
      <section id="blog" className="section-padding bg-muted/30">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Latest Health Tips & Articles</h2>
            <p className="text-xl text-muted-foreground">
              Stay updated with the latest nutrition science and health tips
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-4 w-24" />
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
    <section id="blog" className="section-padding bg-muted/30">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Latest Health Tips & Articles</h2>
          <p className="text-xl text-muted-foreground">
            Stay updated with the latest nutrition science and health tips
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts?.map((post: any) => (
            <Card key={post.id} className="h-full transition-all duration-300 hover:shadow-xl group">
              <div className="overflow-hidden">
                <img
                  src={post.imageUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop'}
                  alt={post.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              
              <CardContent className="p-6 flex flex-col h-[calc(100%-12rem)]">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-muted-foreground mb-4 flex-1 line-clamp-3">
                  {post.excerpt}
                </p>

                <Link href={`/blog/${post.slug}`}>
                  <Button variant="ghost" className="p-0 h-auto font-semibold text-primary hover:text-primary/80 group">
                    Read More 
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/blog">
            <Button size="lg" className="btn-primary">
              View All Articles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {(!blogPosts || blogPosts.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blog posts available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
