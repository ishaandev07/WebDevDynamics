import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "wouter";
import type { BlogPost } from "@shared/schema";

export default function BlogSection() {
  const { data: blogPosts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading blog posts...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-800 mb-4">Latest Health Tips & Articles</h2>
          <p className="text-xl text-neutral-600">
            Stay updated with the latest nutrition science and health tips
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts?.slice(0, 6).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {post.imageUrl && (
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {post.category}
                  </Badge>
                  <span className="text-neutral-500 text-sm ml-3">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-3">
                  {post.title}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {post.excerpt}
                </p>
                <button className="text-primary font-semibold hover:text-green-600 transition-colors flex items-center">
                  Read More <ArrowRightIcon className="ml-1 h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!blogPosts || blogPosts.length === 0) && (
          <div className="text-center py-12">
            <p className="text-neutral-600">Blog articles will be available soon.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/blog">
            <Button>View All Articles</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
