import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, Scale, TrendingUp, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BMICalculator() {
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "male",
    activityLevel: "moderate"
  });
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const calculateBMI = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Calculate BMI locally for instant results
      const heightInM = parseFloat(data.height) / 100;
      const weightInKg = parseFloat(data.weight);
      const bmi = parseFloat((weightInKg / (heightInM * heightInM)).toFixed(2));
      
      let category = "";
      let recommendations = "";
      let color = "";
      
      if (bmi < 18.5) {
        category = "Underweight";
        recommendations = "Consider consulting with a nutritionist to develop a healthy weight gain plan with nutrient-dense foods.";
        color = "text-blue-600";
      } else if (bmi >= 18.5 && bmi < 25) {
        category = "Normal weight";
        recommendations = "Great job! Maintain your healthy weight with balanced nutrition and regular physical activity.";
        color = "text-green-600";
      } else if (bmi >= 25 && bmi < 30) {
        category = "Overweight";
        recommendations = "Focus on portion control, increase physical activity, and consider professional guidance for sustainable weight management.";
        color = "text-yellow-600";
      } else {
        category = "Obese";
        recommendations = "Consult with healthcare professionals for a comprehensive weight management plan including nutrition and exercise guidance.";
        color = "text-red-600";
      }

      const idealWeightMin = Math.round(18.5 * heightInM * heightInM);
      const idealWeightMax = Math.round(24.9 * heightInM * heightInM);
      
      return {
        bmi,
        category,
        recommendations,
        color,
        idealWeightRange: `${idealWeightMin} - ${idealWeightMax} kg`,
        healthTips: [
          "Drink at least 8 glasses of water daily",
          "Include 5 servings of fruits and vegetables",
          "Aim for 150 minutes of moderate exercise weekly",
          "Get 7-9 hours of quality sleep each night"
        ]
      };
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "BMI Calculated Successfully",
        description: `Your BMI is ${data.bmi} (${data.category})`
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.age || !formData.height || !formData.weight) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const age = parseInt(formData.age);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    
    if (age < 18 || age > 120) {
      toast({
        title: "Invalid Age",
        description: "Age must be between 18 and 120",
        variant: "destructive"
      });
      return;
    }
    
    if (height < 100 || height > 250) {
      toast({
        title: "Invalid Height",
        description: "Height must be between 100 and 250 cm",
        variant: "destructive"
      });
      return;
    }
    
    if (weight < 30 || weight > 300) {
      toast({
        title: "Invalid Weight",
        description: "Weight must be between 30 and 300 kg",
        variant: "destructive"
      });
      return;
    }
    
    calculateBMI.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-600 text-white p-3 rounded-full">
              <Calculator className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Free BMI Calculator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Calculate your Body Mass Index and get personalized health recommendations from nutrition experts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="h-5 w-5 mr-2" />
                BMI Calculator
              </CardTitle>
              <CardDescription>
                Enter your details to calculate your Body Mass Index
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      min="18"
                      max="120"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange("gender", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      min="100"
                      max="250"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      min="30"
                      max="300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Activity Level</Label>
                  <RadioGroup
                    value={formData.activityLevel}
                    onValueChange={(value) => handleInputChange("activityLevel", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sedentary" id="sedentary" />
                      <Label htmlFor="sedentary">Sedentary (little/no exercise)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="moderate" id="moderate" />
                      <Label htmlFor="moderate">Moderate (exercise 3-5 days/week)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id="active" />
                      <Label htmlFor="active">Active (exercise 6-7 days/week)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="very_active" id="very_active" />
                      <Label htmlFor="very_active">Very Active (2x/day or intense exercise)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Calculate BMI
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Your BMI Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-600 mb-2">
                    {result.bmi}
                  </div>
                  <div className={`text-xl font-semibold ${result.color}`}>
                    {result.category}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Ideal Weight Range</h4>
                    <p className="text-gray-600">{result.idealWeightRange}</p>
                  </div>
                </div>

                <Alert>
                  <Heart className="h-4 w-4" />
                  <AlertDescription>
                    {result.recommendations}
                  </AlertDescription>
                </Alert>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Health Tips for You</h4>
                  <ul className="space-y-2">
                    {result.healthTips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-600">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Want Professional Guidance?</h4>
                  <p className="text-green-700 text-sm mb-3">
                    Get personalized nutrition plans and expert advice from our certified dieticians.
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Book Free Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* BMI Chart Info */}
          {!result && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Understanding BMI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Underweight</span>
                    <span className="text-blue-600 font-semibold">Below 18.5</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Normal weight</span>
                    <span className="text-green-600 font-semibold">18.5 - 24.9</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">Overweight</span>
                    <span className="text-yellow-600 font-semibold">25 - 29.9</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">Obese</span>
                    <span className="text-red-600 font-semibold">30 and above</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Important Note</h4>
                  <p className="text-sm text-gray-600">
                    BMI is a useful screening tool but doesn't directly measure body fat. 
                    Factors like muscle mass, bone density, and overall body composition 
                    should also be considered for a complete health assessment.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}