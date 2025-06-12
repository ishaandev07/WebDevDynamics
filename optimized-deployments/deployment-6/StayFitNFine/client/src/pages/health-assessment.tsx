import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Activity, Heart, Target, TrendingUp, Calculator, CheckCircle } from "lucide-react";

const healthAssessmentSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  age: z.number().min(13, "Must be at least 13 years old").max(120, "Please enter a valid age"),
  gender: z.enum(["male", "female", "other"]),
  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),
  activityLevel: z.enum(["sedentary", "lightly_active", "moderate", "active", "very_active"]),
  healthGoals: z.string().optional(),
  medicalConditions: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  followUpConsent: z.boolean().default(false),
});

type FormData = z.infer<typeof healthAssessmentSchema>;

interface AssessmentResult {
  id: number;
  bmi: string;
  assessmentScore: number;
  recommendations: string;
}

export default function HealthAssessment() {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(healthAssessmentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      age: 0,
      gender: "male",
      height: "",
      weight: "",
      activityLevel: "moderate",
      healthGoals: "",
      medicalConditions: "",
      dietaryRestrictions: "",
      followUpConsent: false,
    },
  });

  const createAssessment = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/health-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create assessment");
      }
      
      return response.json();
    },
    onSuccess: (data: AssessmentResult) => {
      setResult(data);
      setStep(3);
      toast({
        title: "Assessment Complete!",
        description: "Your personalized health report is ready.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process your assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createAssessment.mutate(data);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "bg-blue-500" };
    if (bmi < 25) return { category: "Normal weight", color: "bg-green-500" };
    if (bmi < 30) return { category: "Overweight", color: "bg-yellow-500" };
    return { category: "Obese", color: "bg-red-500" };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const activityLevels = [
    { value: "sedentary", label: "Sedentary (little or no exercise)" },
    { value: "lightly_active", label: "Lightly active (light exercise 1-3 days/week)" },
    { value: "moderate", label: "Moderately active (moderate exercise 3-5 days/week)" },
    { value: "active", label: "Active (hard exercise 6-7 days/week)" },
    { value: "very_active", label: "Very active (very hard exercise, physical job)" },
  ];

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Free Health Assessment
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Get your personalized BMI calculation and health recommendations in under 3 minutes
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Calculator className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">BMI Calculator</h3>
                  <p className="text-sm text-gray-600">Instant BMI calculation with health category</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Health Score</h3>
                  <p className="text-sm text-gray-600">Comprehensive health assessment score</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Personal Recommendations</h3>
                  <p className="text-sm text-gray-600">Customized nutrition and lifestyle tips</p>
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={() => setStep(2)}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              Start Your Free Assessment
              <TrendingUp className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Health Assessment Form</CardTitle>
              <CardDescription className="text-center">
                Please fill out all fields for the most accurate assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="25" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input placeholder="170" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input placeholder="70" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="activityLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Activity Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select activity level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {activityLevels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="healthGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Health Goals (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What are your main health and fitness goals?"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Conditions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any medical conditions we should know about?"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dietaryRestrictions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dietary Restrictions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any food allergies or dietary preferences?"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="followUpConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to receive follow-up nutrition tips and consultation offers via email
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={createAssessment.isPending}
                  >
                    {createAssessment.isPending ? "Processing..." : "Get My Health Assessment"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 3 && result) {
    const bmi = parseFloat(result.bmi);
    const bmiInfo = getBMICategory(bmi);

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Health Assessment Results
            </h1>
            <p className="text-gray-600">
              Here's your personalized health analysis and recommendations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-6 w-6 mr-2 text-green-600" />
                  BMI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {bmi.toFixed(1)}
                  </div>
                  <Badge className={`${bmiInfo.color} text-white`}>
                    {bmiInfo.category}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Underweight</span>
                    <span>&lt; 18.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Normal weight</span>
                    <span>18.5 - 24.9</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overweight</span>
                    <span>25.0 - 29.9</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Obese</span>
                    <span>&geq; 30.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-6 w-6 mr-2 text-green-600" />
                  Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(result.assessmentScore)}`}>
                    {result.assessmentScore}/100
                  </div>
                  <Progress value={result.assessmentScore} className="mb-2" />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Your overall health score based on BMI, activity level, and lifestyle factors
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-6 w-6 mr-2 text-green-600" />
                Personalized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {result.recommendations}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Ready to Take the Next Step?
                </h3>
                <p className="text-green-700 mb-6">
                  Get a personalized nutrition plan from our certified dietician
                </p>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => window.location.href = '/services'}
                >
                  Book Your Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}