import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Upload, 
  Server, 
  Bot, 
  Settings,
  Star,
  CreditCard
} from "lucide-react";
import { Link, useLocation } from "wouter";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Upload Project', href: '/upload', icon: Upload },
  { name: 'Deployments', href: '/deployments', icon: Server },
  { name: 'Pricing', href: '/pricing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 pt-6 pb-4 overflow-y-auto">
      <nav className="px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start px-3 py-2 text-sm font-medium rounded-md",
                  isActive 
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100" 
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-8 px-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
          <h3 className="text-sm font-semibold">Upgrade to Pro</h3>
          <p className="text-xs mt-1 opacity-90">
            Unlimited deployments & priority support
          </p>
          <Button 
            size="sm"
            variant="secondary"
            className="mt-2 bg-white text-blue-600 text-xs font-medium px-3 py-1 rounded-md hover:bg-slate-100"
          >
            Learn More
          </Button>
        </div>
      </div>
    </aside>
  );
}
