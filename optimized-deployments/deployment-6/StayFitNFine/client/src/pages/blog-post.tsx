import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, ArrowLeft, Share2 } from "lucide-react";
import type { BlogPost } from "@shared/schema";

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: [`/api/blog/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-32 pb-16">
          <div className="max-w-4xl mx-auto container-padding">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
              <div className="h-12 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
              <div className="h-64 bg-neutral-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-4 bg-neutral-200 rounded"></div>
                <div className="h-4 bg-neutral-200 rounded"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-32 pb-16">
          <div className="max-w-4xl mx-auto container-padding text-center">
            <h1 className="text-4xl font-bold text-neutral-800 mb-4">
              Blog Post Not Found
            </h1>
            <p className="text-xl text-neutral-600 mb-8">
              The article you're looking for doesn't exist or has been moved.
            </p>
            <Link href="/blog">
              <Button className="btn-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Weight Loss': 'bg-primary/10 text-primary',
      'Diabetes Care': 'bg-blue-100 text-blue-700',
      'Meal Planning': 'bg-amber-100 text-amber-700',
      'Sports Nutrition': 'bg-orange-100 text-orange-700',
      'Plant-Based': 'bg-green-100 text-green-700',
      'Heart Health': 'bg-red-100 text-red-700',
    };
    return colors[category as keyof typeof colors] || 'bg-neutral-100 text-neutral-700';
  };

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <article className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto container-padding">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/blog">
              <Button variant="ghost" className="p-0 text-primary hover:text-primary/80">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <Badge className={getCategoryColor(post.category)}>
                {post.category}
              </Badge>
              <div className="flex items-center text-neutral-500">
                <CalendarDays className="w-4 h-4 mr-2" />
                {formatDate(post.createdAt)}
              </div>
              <div className="flex items-center text-neutral-500">
                <Clock className="w-4 h-4 mr-2" />
                5 min read
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between border-b border-neutral-200 pb-6">
              <div className="flex items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face" 
                  alt="Ishita Singh"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-semibold text-neutral-800">Ishita Singh</div>
                  <div className="text-neutral-500 text-sm">Registered Dietician</div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={sharePost}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-12">
            <img 
              src={post.imageUrl || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=600&fit=crop"} 
              alt={post.title}
              className="w-full h-64 lg:h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg prose-neutral max-w-none">
            {/* Since we don't have full content, we'll show a placeholder */}
            <div className="space-y-6 text-neutral-700 leading-relaxed">
              <p>
                {post.excerpt}
              </p>
              
              <p>
                This is where the full blog post content would be displayed. In a production environment, 
                you would store the complete article content in the database and render it here with proper 
                formatting, including headings, lists, images, and other rich content.
              </p>

              <h2 className="text-2xl font-bold text-neutral-800 mt-12 mb-4">
                Key Takeaways
              </h2>
              
              <ul className="space-y-2">
                <li>• Evidence-based nutrition recommendations</li>
                <li>• Practical tips for daily implementation</li>
                <li>• Sustainable lifestyle changes</li>
                <li>• Professional guidance and support</li>
              </ul>

              <h2 className="text-2xl font-bold text-neutral-800 mt-12 mb-4">
                Need Personalized Guidance?
              </h2>
              
              <p>
                While general nutrition information is helpful, everyone's needs are unique. For personalized 
                nutrition guidance tailored to your specific health goals and lifestyle, consider booking a 
                consultation with our certified dietician.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 p-8 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-neutral-800 mb-4">
                Ready to Transform Your Health?
              </h3>
              <p className="text-neutral-600 mb-6">
                Get personalized nutrition guidance from our certified dietician.
              </p>
              <Button className="btn-primary">
                Book Free Consultation
              </Button>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
