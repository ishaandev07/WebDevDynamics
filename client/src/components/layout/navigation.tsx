import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Rocket, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Rocket className="text-blue-600 text-2xl mr-3" />
              <span className="text-xl font-bold text-slate-900">DeployBot</span>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">
                Documentation
              </Button>
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">
                Support
              </Button>
              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2">
                      {user?.profileImageUrl && (
                        <img 
                          src={user.profileImageUrl} 
                          alt="User profile" 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <span className="text-sm font-medium text-slate-700">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user?.email || 'User'
                        }
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
