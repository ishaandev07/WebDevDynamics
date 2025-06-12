import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import Footer from "@/components/footer";
import type { BlogPost } from "@shared/schema";

export default function Blog() {
  const { data: blogPosts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading blog posts...</p>
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
              Nutrition Insights & Tips
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Stay updated with the latest nutrition science, healthy recipes, and wellness advice.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts?.map((post) => (
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
              <p className="text-neutral-600">No blog posts available at the moment.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
