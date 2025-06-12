import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Calendar, FileText, Activity, BarChart, Settings, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("sessionToken")}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    }
  });

  const { data: clientInquiries } = useQuery({
    queryKey: ["/api/admin/client-inquiries"],
    queryFn: async () => {
      const response = await fetch("/api/admin/client-inquiries", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("sessionToken")}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to fetch inquiries");
      return response.json();
    }
  });

  const { data: contactSubmissions } = useQuery({
    queryKey: ["/api/admin/contact-submissions"],
    queryFn: async () => {
      const response = await fetch("/api/admin/contact-submissions", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("sessionToken")}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to fetch submissions");
      return response.json();
    }
  });

  const { data: healthAssessments } = useQuery({
    queryKey: ["/api/admin/health-assessments"],
    queryFn: async () => {
      const response = await fetch("/api/admin/health-assessments", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("sessionToken")}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to fetch assessments");
      return response.json();
    }
  });

  const { data: testimonials } = useQuery({
    queryKey: ["/api/admin/testimonials"],
    queryFn: async () => {
      const response = await fetch("/api/admin/testimonials", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("sessionToken")}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to fetch testimonials");
      return response.json();
    }
  });

  const { data: blogPosts } = useQuery({
    queryKey: ["/api/admin/blog"],
    queryFn: async () => {
      const response = await fetch("/api/admin/blog", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("sessionToken")}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Failed to fetch blog posts");
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
                <Badge variant="outline">Admin</Badge>
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
            StayFitNFine Administration
          </h2>
          <p className="text-gray-600 mt-1">
            Manage users, bookings, content, and analytics
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered members
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Client Inquiries</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clientInquiries?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Consultation requests
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
                  <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contactSubmissions?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Pending responses
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent User Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users?.slice(0, 5).map((user: any) => (
                      <div key={user.id} className="flex items-center space-x-4">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Client Inquiries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clientInquiries?.slice(0, 5).map((inquiry: any) => (
                      <div key={inquiry.id} className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{inquiry.firstName} {inquiry.lastName}</p>
                          <p className="text-xs text-gray-500">{inquiry.consultationType}</p>
                        </div>
                        <Badge variant={getStatusColor(inquiry.status) as any}>
                          {inquiry.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>All registered users and their information</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'destructive'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Client Inquiries & Bookings</CardTitle>
                <CardDescription>Manage consultation requests and bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Consultation Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientInquiries?.map((inquiry: any) => (
                      <TableRow key={inquiry.id}>
                        <TableCell className="font-medium">
                          {inquiry.firstName} {inquiry.lastName}
                        </TableCell>
                        <TableCell>{inquiry.email}</TableCell>
                        <TableCell>{inquiry.consultationType}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(inquiry.status) as any}>
                            {inquiry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Contact Submissions</CardTitle>
                <CardDescription>Messages from website contact form</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactSubmissions?.map((submission: any) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {submission.firstName} {submission.lastName}
                        </TableCell>
                        <TableCell>{submission.email}</TableCell>
                        <TableCell>{submission.subject}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(submission.status) as any}>
                            {submission.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <CardTitle>Health Assessments</CardTitle>
                <CardDescription>User health assessment data and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>BMI</TableHead>
                      <TableHead>Health Score</TableHead>
                      <TableHead>Activity Level</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {healthAssessments?.map((assessment: any) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">
                          {assessment.firstName} {assessment.lastName}
                        </TableCell>
                        <TableCell>{assessment.age}</TableCell>
                        <TableCell>{assessment.bmi}</TableCell>
                        <TableCell>
                          <Badge variant={
                            assessment.assessmentScore >= 80 ? 'default' :
                            assessment.assessmentScore >= 60 ? 'secondary' : 'destructive'
                          }>
                            {assessment.assessmentScore}/100
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{assessment.activityLevel}</TableCell>
                        <TableCell>
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Blog posts and testimonials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Blog Posts</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Views</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {blogPosts?.map((post: any) => (
                          <TableRow key={post.id}>
                            <TableCell className="font-medium">{post.title}</TableCell>
                            <TableCell>{post.category}</TableCell>
                            <TableCell>
                              <Badge variant={post.isPublished ? 'default' : 'secondary'}>
                                {post.isPublished ? 'Published' : 'Draft'}
                              </Badge>
                            </TableCell>
                            <TableCell>{post.viewCount || 0}</TableCell>
                            <TableCell>
                              {new Date(post.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Testimonials</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Featured</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testimonials?.map((testimonial: any) => (
                          <TableRow key={testimonial.id}>
                            <TableCell className="font-medium">{testimonial.clientName}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {testimonial.rating}/5 ⭐
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={testimonial.isPublished ? 'default' : 'secondary'}>
                                {testimonial.isPublished ? 'Published' : 'Draft'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={testimonial.isFeatured ? 'default' : 'outline'}>
                                {testimonial.isFeatured ? 'Featured' : 'Regular'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(testimonial.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}