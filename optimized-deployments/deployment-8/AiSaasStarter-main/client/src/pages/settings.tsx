import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Settings, User, Bell, Bot, Cog, Shield, Save, CheckCircle } from "lucide-react";

interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  positiveCount: number;
  negativeCount: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // User Profile
    fullName: "John Doe",
    emailAddress: "john.doe@company.com",
    timezone: "Eastern Time (UTC-5)",
    language: "English",
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    quoteApprovals: true,
    newCustomers: false,
    
    // AI Configuration
    openaiApiKey: "",
    geminiApiKey: "",
    apiKeyEncrypted: true,
    autoApprovalLimit: 10000,
    aiResponseSpeed: "fast",
    autoQuoteGeneration: true,
    smartPricing: true,
    
    // System Configuration
    companyName: "AI CPQ Pro",
    defaultCurrency: "USD",
    dateFormat: "MM/DD/YYYY",
    backupFrequency: "Daily",
    
    // Security
    currentPassword: "",
    newPassword: "",
    enableTwoFactor: false,
    manageApiKeys: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [apiTestLoading, setApiTestLoading] = useState(false);
  const { toast } = useToast();

  // Fetch feedback stats
  const { data: feedbackStats } = useQuery<FeedbackStats>({
    queryKey: ["/api/chat/feedback-stats"],
    refetchInterval: 30000
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Profile Updated",
        description: "Your profile settings have been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveNotifications = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved."
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save notifications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveAISettings = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "AI Settings Updated",
        description: "Your AI configuration has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save AI settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveSystemSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "System Settings Updated",
        description: "Your system configuration has been saved."
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save system settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveSecuritySettings = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Security Settings Updated",
        description: "Your security preferences have been saved."
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save security settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Add OpenAI API Key input and test logic
  const testApiKey = async (provider: 'openai' | 'gemini') => {
    setApiTestResult(null);
    setApiTestLoading(true);
    let valid = false;
    let message = '';
    try {
      if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${settings.openaiApiKey}` },
        });
        if (res.ok) {
          valid = true;
          message = 'OpenAI API key is valid!';
        } else {
          const err = await res.json();
          message = err.error?.message || 'Invalid OpenAI API key.';
        }
      } else if (provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${settings.geminiApiKey}`);
        if (res.ok) {
          valid = true;
          message = 'Gemini API key is valid!';
        } else {
          const err = await res.json();
          message = err.error?.message || 'Invalid Gemini API key.';
        }
      }
    } catch (e: any) {
      message = e.message || 'Network error.';
    }
    setApiTestResult(message);
    setApiTestLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your application preferences and configuration</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            User Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Configuration
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Cog className="h-4 w-4" />
            System Configuration
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* User Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Profile
              </CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={settings.fullName}
                    onChange={(e) => handleSettingChange('fullName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailAddress">Email Address</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={settings.emailAddress}
                    onChange={(e) => handleSettingChange('emailAddress', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Eastern Time (UTC-5)">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="Central Time (UTC-6)">Central Time (UTC-6)</SelectItem>
                      <SelectItem value="Mountain Time (UTC-7)">Mountain Time (UTC-7)</SelectItem>
                      <SelectItem value="Pacific Time (UTC-8)">Pacific Time (UTC-8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={saveProfile} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(value) => handleSettingChange('pushNotifications', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Quote Approvals</Label>
                    <p className="text-sm text-muted-foreground">Notify when quotes need approval</p>
                  </div>
                  <Switch
                    checked={settings.quoteApprovals}
                    onCheckedChange={(value) => handleSettingChange('quoteApprovals', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Customers</Label>
                    <p className="text-sm text-muted-foreground">Notify when new customers register</p>
                  </div>
                  <Switch
                    checked={settings.newCustomers}
                    onCheckedChange={(value) => handleSettingChange('newCustomers', value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={saveNotifications} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Configuration Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Configuration
              </CardTitle>
              <CardDescription>
                Configure AI settings and API connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="openaiApiKey"
                      type="password"
                      value={settings.openaiApiKey}
                      onChange={(e) => handleSettingChange('openaiApiKey', e.target.value)}
                      placeholder="Enter your OpenAI API key"
                    />
                    <Button variant="outline" onClick={() => testApiKey('openai')} disabled={apiTestLoading}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="geminiApiKey">Gemini API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="geminiApiKey"
                      type="password"
                      value={settings.geminiApiKey}
                      onChange={(e) => handleSettingChange('geminiApiKey', e.target.value)}
                      placeholder="Enter your Gemini API key"
                    />
                    <Button variant="outline" onClick={() => testApiKey('gemini')} disabled={apiTestLoading}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                  </div>
                </div>
                {apiTestResult && (
                  <div className={`text-sm ${apiTestResult.includes('valid') ? 'text-green-600' : 'text-red-600'}`}>{apiTestResult}</div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="autoApprovalLimit">Auto Approval Limit</Label>
                  <Input
                    id="autoApprovalLimit"
                    type="number"
                    value={settings.autoApprovalLimit}
                    onChange={(e) => handleSettingChange('autoApprovalLimit', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum amount for auto-approval ($)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="aiResponseSpeed">AI Response Speed</Label>
                  <Select value={settings.aiResponseSpeed} onValueChange={(value) => handleSettingChange('aiResponseSpeed', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">Fast (1-2s)</SelectItem>
                      <SelectItem value="balanced">Balanced (2-4s)</SelectItem>
                      <SelectItem value="quality">Quality (4-6s)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Quote Generation</Label>
                    <p className="text-sm text-muted-foreground">Enable AI to automatically generate quotes</p>
                  </div>
                  <Switch
                    checked={settings.autoQuoteGeneration}
                    onCheckedChange={(value) => handleSettingChange('autoQuoteGeneration', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Smart Pricing</Label>
                    <p className="text-sm text-muted-foreground">Use AI for dynamic pricing recommendations</p>
                  </div>
                  <Switch
                    checked={settings.smartPricing}
                    onCheckedChange={(value) => handleSettingChange('smartPricing', value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={saveAISettings} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save AI Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Configuration Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cog className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => handleSettingChange('companyName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <Select value={settings.defaultCurrency} onValueChange={(value) => handleSettingChange('defaultCurrency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={settings.dateFormat} onValueChange={(value) => handleSettingChange('dateFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select value={settings.backupFrequency} onValueChange={(value) => handleSettingChange('backupFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={saveSystemSettings} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={settings.currentPassword}
                    onChange={(e) => handleSettingChange('currentPassword', e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={settings.newPassword}
                    onChange={(e) => handleSettingChange('newPassword', e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={settings.enableTwoFactor}
                      onCheckedChange={(value) => handleSettingChange('enableTwoFactor', value)}
                    />
                    <Button variant="outline" size="sm">
                      Enable 2FA
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>API Access</Label>
                    <p className="text-sm text-muted-foreground">Manage API keys and access tokens</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage Keys
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={saveSecuritySettings} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}