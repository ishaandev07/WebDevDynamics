import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Activity, BookOpen, LogOut, User, Settings } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: bookings } = useQuery({
    queryKey: ["/api/user/bookings"],
    queryFn: async () => {
      const response = await fetch("/api/user/bookings", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("sessionToken")}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    }
  });

  const { data: healthAssessments } = useQuery({
    queryKey: ["/api/user/health-assessments"],
    queryFn: async () => {
      const response = await fetch("/api/user/health-assessments", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("sessionToken")}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to fetch assessments");
      return response.json();
    }
  });

  const { data: mealPlans } = useQuery({
    queryKey: ["/api/user/meal-plans"],
    queryFn: async () => {
      const response = await fetch("/api/user/meal-plans", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("sessionToken")}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to fetch meal plans");
      return response.json();
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'confirmed': return 'green';
      case 'completed': return 'blue';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-gray-600 mt-1">
            Track your wellness journey and manage your consultations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="assessments">Health Reports</TabsTrigger>
            <TabsTrigger value="meal-plans">Meal Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Consultations scheduled
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Health Assessments</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{healthAssessments?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Completed assessments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Meal Plans</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mealPlans?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Personalized plans
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your wellness journey
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest health and wellness activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthAssessments?.slice(0, 3).map((assessment: any) => (
                    <div key={assessment.id} className="flex items-center space-x-4">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Activity className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Health Assessment Completed</p>
                        <p className="text-xs text-gray-500">
                          BMI: {assessment.bmi} | Score: {assessment.assessmentScore}/100
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  
                  {bookings?.slice(0, 2).map((booking: any) => (
                    <div key={booking.id} className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Consultation Booked</p>
                        <p className="text-xs text-gray-500">
                          {booking.consultationType} consultation
                        </p>
                      </div>
                      <Badge variant={getStatusColor(booking.status) as any}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>All your consultation bookings and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings?.map((booking: any) => (
                    <div key={booking.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{booking.consultationType}</h3>
                          <p className="text-sm text-gray-500">
                            Health Goals: {booking.healthGoals || 'Not specified'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Booked on {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(booking.status) as any}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {!bookings?.length && (
                    <p className="text-center text-gray-500 py-8">
                      No bookings yet. Book your first consultation to get started!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <CardTitle>Health Assessment Reports</CardTitle>
                <CardDescription>Your health assessment history and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthAssessments?.map((assessment: any) => (
                    <div key={assessment.id} className="p-4 border rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">BMI</p>
                          <p className="font-medium">{assessment.bmi}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Health Score</p>
                          <p className="font-medium">{assessment.assessmentScore}/100</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Activity Level</p>
                          <p className="font-medium capitalize">{assessment.activityLevel}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="font-medium">
                            {new Date(assessment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Recommendations</p>
                        <p className="text-sm">{assessment.recommendations}</p>
                      </div>
                    </div>
                  ))}
                  {!healthAssessments?.length && (
                    <p className="text-center text-gray-500 py-8">
                      No health assessments yet. Take your first assessment to track your wellness!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meal-plans">
            <Card>
              <CardHeader>
                <CardTitle>My Meal Plans</CardTitle>
                <CardDescription>Personalized nutrition plans created for you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mealPlans?.map((plan: any) => (
                    <div key={plan.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{plan.title}</h3>
                        <Badge variant="outline">{plan.goalType}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Duration</p>
                          <p>{plan.duration} days</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Daily Calories</p>
                          <p>{plan.calories} kcal</p>
                        </div>
                      </div>
                      {plan.description && (
                        <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                      )}
                    </div>
                  ))}
                  {!mealPlans?.length && (
                    <p className="text-center text-gray-500 py-8">
                      No meal plans yet. Book a consultation to get personalized meal plans!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}