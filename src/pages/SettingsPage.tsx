
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User, Lock, Bell, Shield, Users, LogOut } from 'lucide-react';

const SettingsPage = () => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '',
  });
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile information updated successfully!");
  };
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Password updated successfully!");
  };
  
  const handleSignOut = () => {
    toast.info("Signing out...");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/4">
            <Tabs defaultValue="profile" orientation="vertical" className="w-full">
              <TabsList className="bg-muted p-2 flex flex-row lg:flex-col h-auto space-x-2 lg:space-x-0 lg:space-y-2 lg:h-auto">
                <TabsTrigger value="profile" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="w-full justify-start">
                  <Lock className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="privacy" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="team" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Team Access
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button 
              variant="outline" 
              className="w-full mt-8 text-red-500" 
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
          
          <div className="lg:w-3/4">
            <Tabs defaultValue="profile">
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your account profile information and email address
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSaveProfile}>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-2xl">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="avatar">Profile Photo</Label>
                          <Input id="avatar" type="file" />
                          <p className="text-sm text-muted-foreground">
                            Accepted formats: .jpg, .png, .gif max 2MB
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input 
                              id="name" 
                              value={user.name}
                              onChange={(e) => setUser({...user, name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              value={user.email}
                              onChange={(e) => setUser({...user, email: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="ml-auto bg-monify-purple-500 hover:bg-monify-purple-600">
                        Save Changes
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleChangePassword}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="ml-auto bg-monify-purple-500 hover:bg-monify-purple-600">
                        Update Password
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>
                      Add an extra layer of security to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">
                          Secure your account with two-factor authentication
                        </p>
                      </div>
                      <Switch
                        checked={twoFactorEnabled}
                        onCheckedChange={setTwoFactorEnabled}
                      />
                    </div>
                    
                    {twoFactorEnabled && (
                      <div className="rounded-md bg-muted p-4 mt-4">
                        <h4 className="mb-2 font-medium">Two-factor authentication is enabled</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          You'll be asked for an authentication code when signing in on new devices.
                        </p>
                        <Button variant="outline" size="sm">
                          Configure 2FA
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Configure how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Push Notifications</h4>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications on your device
                          </p>
                        </div>
                        <Switch
                          checked={pushNotifications}
                          onCheckedChange={setPushNotifications}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Notification Types</h4>
                      
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="financial-updates" className="flex-1 cursor-pointer">
                            Financial Updates
                          </Label>
                          <Switch id="financial-updates" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="spending-alerts" className="flex-1 cursor-pointer">
                            Spending Alerts
                          </Label>
                          <Switch id="spending-alerts" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="new-features" className="flex-1 cursor-pointer">
                            New Features
                          </Label>
                          <Switch id="new-features" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="account-security" className="flex-1 cursor-pointer">
                            Account Security
                          </Label>
                          <Switch id="account-security" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="ml-auto bg-monify-purple-500 hover:bg-monify-purple-600">
                      Save Preferences
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="privacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>
                      Manage how your information is handled and displayed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Make Profile Public</h4>
                          <p className="text-sm text-muted-foreground">
                            Allow others to see your profile information
                          </p>
                        </div>
                        <Switch defaultChecked={false} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Show Financial Data</h4>
                          <p className="text-sm text-muted-foreground">
                            Allow financial advisors to view your data
                          </p>
                        </div>
                        <Switch defaultChecked={false} />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-4">Data Management</h4>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          Download All My Data
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-red-500">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="team" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Access</CardTitle>
                    <CardDescription>
                      Manage who can access your financial information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-md bg-muted p-4">
                      <h4 className="font-medium mb-2">Invite Team Members</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add financial advisors, accountants, or team members to collaborate on your finances.
                      </p>
                      <div className="flex gap-2">
                        <Input placeholder="Email address" className="flex-1" />
                        <Button>Send Invite</Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-4">Team Members</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">Jane Doe</p>
                              <p className="text-xs text-muted-foreground">jane@example.com</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Remove</Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback>MS</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">Mike Smith</p>
                              <p className="text-xs text-muted-foreground">mike@example.com</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Remove</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
