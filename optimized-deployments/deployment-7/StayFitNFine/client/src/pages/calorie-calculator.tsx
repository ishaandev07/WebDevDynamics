import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Target, TrendingUp, Apple } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CalorieCalculator() {
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "male",
    activityLevel: "moderate",
    goal: "maintain"
  });
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const calculateCalories = useMutation({
    mutationFn: async (data: typeof formData) => {
      const age = parseInt(data.age);
      const height = parseFloat(data.height);
      const weight = parseFloat(data.weight);
      
      // Calculate BMR using Mifflin-St Jeor Equation
      let bmr;
      if (data.gender === "male") {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }
      
      // Activity multipliers
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      };
      
      const tdee = Math.round(bmr * activityMultipliers[data.activityLevel as keyof typeof activityMultipliers]);
      
      // Goal adjustments
      let targetCalories;
      let weeklyWeightChange;
      let goalDescription;
      
      switch (data.goal) {
        case "lose":
          targetCalories = tdee - 500; // 1 lb per week
          weeklyWeightChange = "-0.5 kg (1 lb)";
          goalDescription = "Weight Loss";
          break;
        case "gain":
          targetCalories = tdee + 500; // 1 lb per week
          weeklyWeightChange = "+0.5 kg (1 lb)";
          goalDescription = "Weight Gain";
          break;
        default:
          targetCalories = tdee;
          weeklyWeightChange = "0 kg";
          goalDescription = "Weight Maintenance";
      }
      
      // Macronutrient breakdown (general recommendations)
      const protein = Math.round((targetCalories * 0.25) / 4); // 25% protein
      const carbs = Math.round((targetCalories * 0.45) / 4); // 45% carbs
      const fat = Math.round((targetCalories * 0.30) / 9); // 30% fat
      
      const mealBreakdown = {
        breakfast: Math.round(targetCalories * 0.25),
        lunch: Math.round(targetCalories * 0.30),
        dinner: Math.round(targetCalories * 0.30),
        snacks: Math.round(targetCalories * 0.15)
      };

      return {
        bmr: Math.round(bmr),
        tdee,
        targetCalories,
        weeklyWeightChange,
        goalDescription,
        macros: { protein, carbs, fat },
        mealBreakdown,
        tips: [
          "Eat protein with every meal to maintain muscle mass",
          "Include fiber-rich foods to stay satisfied longer",
          "Stay hydrated with 8-10 glasses of water daily",
          "Time your largest meals around your most active periods"
        ]
      };
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Calorie Needs Calculated",
        description: `Your daily calorie target: ${data.targetCalories} calories`
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
    
    calculateCalories.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-full">
              <Zap className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Free Calorie Calculator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Calculate your daily calorie needs and get personalized nutrition guidance for your health goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Calorie Calculator
              </CardTitle>
              <CardDescription>
                Enter your details to calculate your daily calorie needs
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
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
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
                      value={formData.height}
                      onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Activity Level</Label>
                  <Select value={formData.activityLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, activityLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (desk job, no exercise)</SelectItem>
                      <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                      <SelectItem value="very_active">Very Active (2x/day or intense exercise)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Goal</Label>
                  <Select value={formData.goal} onValueChange={(value) => setFormData(prev => ({ ...prev, goal: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">Lose Weight</SelectItem>
                      <SelectItem value="maintain">Maintain Weight</SelectItem>
                      <SelectItem value="gain">Gain Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Calculate Calories
                </Button>
              </form>
            </CardContent>
          </Card>

          {result && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Your Calorie Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {result.targetCalories}
                  </div>
                  <div className="text-lg text-gray-600">
                    calories per day for {result.goalDescription}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Expected weekly change: {result.weeklyWeightChange}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-lg font-semibold text-gray-900">{result.bmr}</div>
                    <div className="text-sm text-gray-600">BMR (at rest)</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-lg font-semibold text-gray-900">{result.tdee}</div>
                    <div className="text-sm text-gray-600">TDEE (with activity)</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Daily Macronutrients</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-semibold text-red-700">{result.macros.protein}g</div>
                      <div className="text-xs text-red-600">Protein</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-700">{result.macros.carbs}g</div>
                      <div className="text-xs text-green-600">Carbs</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-semibold text-yellow-700">{result.macros.fat}g</div>
                      <div className="text-xs text-yellow-600">Fat</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Meal Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">Breakfast</span>
                      <span className="font-medium">{result.mealBreakdown.breakfast} cal</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">Lunch</span>
                      <span className="font-medium">{result.mealBreakdown.lunch} cal</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">Dinner</span>
                      <span className="font-medium">{result.mealBreakdown.dinner} cal</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">Snacks</span>
                      <span className="font-medium">{result.mealBreakdown.snacks} cal</span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Apple className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {result.tips.map((tip: string, index: number) => (
                        <div key={index} className="text-sm">• {tip}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Ready for a Custom Plan?</h4>
                  <p className="text-blue-700 text-sm mb-3">
                    Get personalized meal plans and professional nutrition coaching.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Book Nutrition Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}