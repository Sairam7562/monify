
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, Users, CreditCard, BarChart2,
  Download, Calendar, RefreshCcw, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// Mock data for user statistics
const userStatsData = [
  { name: 'Jan', newUsers: 65, activeUsers: 120, churned: 4 },
  { name: 'Feb', newUsers: 78, activeUsers: 150, churned: 5 },
  { name: 'Mar', newUsers: 90, activeUsers: 180, churned: 8 },
  { name: 'Apr', newUsers: 81, activeUsers: 220, churned: 10 },
  { name: 'May', newUsers: 95, activeUsers: 250, churned: 12 },
  { name: 'Jun', newUsers: 110, activeUsers: 280, churned: 9 },
  { name: 'Jul', newUsers: 120, activeUsers: 310, churned: 8 },
  { name: 'Aug', newUsers: 130, activeUsers: 350, churned: 7 },
  { name: 'Sep', newUsers: 145, activeUsers: 380, churned: 11 },
  { name: 'Oct', newUsers: 160, activeUsers: 400, churned: 13 },
  { name: 'Nov', newUsers: 175, activeUsers: 420, churned: 15 },
  { name: 'Dec', newUsers: 190, activeUsers: 450, churned: 10 },
];

// Mock data for revenue statistics
const revenueData = [
  { name: 'Jan', revenue: 12500, costs: 4200, profit: 8300 },
  { name: 'Feb', revenue: 14200, costs: 4500, profit: 9700 },
  { name: 'Mar', revenue: 15800, costs: 4800, profit: 11000 },
  { name: 'Apr', revenue: 16900, costs: 5100, profit: 11800 },
  { name: 'May', revenue: 18200, costs: 5300, profit: 12900 },
  { name: 'Jun', revenue: 19500, costs: 5600, profit: 13900 },
  { name: 'Jul', revenue: 21000, costs: 5900, profit: 15100 },
  { name: 'Aug', revenue: 22500, costs: 6200, profit: 16300 },
  { name: 'Sep', revenue: 24000, costs: 6500, profit: 17500 },
  { name: 'Oct', revenue: 25800, costs: 6800, profit: 19000 },
  { name: 'Nov', revenue: 27500, costs: 7100, profit: 20400 },
  { name: 'Dec', revenue: 29200, costs: 7400, profit: 21800 },
];

// Mock data for subscription plans distribution
const subscriptionData = [
  { name: 'Basic', value: 125, color: '#A3E635' },
  { name: 'Premium', value: 85, color: '#3B82F6' },
  { name: 'Business', value: 40, color: '#8B5CF6' },
  { name: 'Enterprise', value: 15, color: '#EC4899' },
];

// Mock data for top users by activity
const topUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', activity: 'High', sessions: 48, lastActive: '2023-11-28' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', activity: 'High', sessions: 42, lastActive: '2023-11-28' },
  { id: 3, name: 'Michael Brown', email: 'michael@example.com', activity: 'Medium', sessions: 36, lastActive: '2023-11-27' },
  { id: 4, name: 'Emma Wilson', email: 'emma@example.com', activity: 'Medium', sessions: 29, lastActive: '2023-11-28' },
  { id: 5, name: 'Alex Johnson', email: 'alex@example.com', activity: 'High', sessions: 44, lastActive: '2023-11-28' },
];

const AdminAnalytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Analytics & Reporting</h2>
        <div className="flex items-center gap-2">
          <Select defaultValue="last30days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
              <SelectItem value="year2023">Year 2023</SelectItem>
              <SelectItem value="alltime">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">2,845</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-green-600">
              <ArrowUpRight className="h-3 w-3" />
              <span>12% increase</span>
              <span className="text-gray-400 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
                <p className="text-2xl font-bold">265</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-green-600">
              <ArrowUpRight className="h-3 w-3" />
              <span>8.5% increase</span>
              <span className="text-gray-400 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-bold">$29,200</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-green-600">
              <ArrowUpRight className="h-3 w-3" />
              <span>6.2% increase</span>
              <span className="text-gray-400 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Churn Rate</p>
                <p className="text-2xl font-bold">3.2%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <BarChart2 className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-red-600">
              <ArrowDownRight className="h-3 w-3" />
              <span>0.8% decrease</span>
              <span className="text-gray-400 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="users">User Stats</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly new and active users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userStatsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="newUsers" stackId="1" stroke="#8884d8" fill="#8884d8" name="New Users" />
                    <Area type="monotone" dataKey="activeUsers" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Active Users" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
                <CardDescription>Users by subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={subscriptionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {subscriptionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Most Active Users</CardTitle>
              <CardDescription>Top users by activity level in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Activity Level</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.activity === 'High' ? 'bg-green-100 text-green-800' : 
                          user.activity === 'Medium' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.activity}
                        </span>
                      </TableCell>
                      <TableCell>{user.sessions}</TableCell>
                      <TableCell>{user.lastActive}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue, costs and profit over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                    <Bar dataKey="costs" name="Costs" fill="#d88884" />
                    <Bar dataKey="profit" name="Profit" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
                <CardDescription>Revenue distribution by subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Basic', value: 1875, color: '#A3E635' },
                        { name: 'Premium', value: 8490, color: '#3B82F6' },
                        { name: 'Business', value: 11960, color: '#8B5CF6' },
                        { name: 'Enterprise', value: 6875, color: '#EC4899' },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {subscriptionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Annual revenue growth and projection</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={revenueData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                  <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-end mt-4">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Revenue Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Analytics</CardTitle>
              <CardDescription>Usage statistics for platform features</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Personal Finance', usage: 85 },
                    { name: 'Business Finance', usage: 65 },
                    { name: 'Financial Statements', usage: 78 },
                    { name: 'Assets Tracking', usage: 92 },
                    { name: 'Liabilities', usage: 88 },
                    { name: 'AI Advisor', usage: 72 },
                    { name: 'Income Tracking', usage: 95 },
                    { name: 'Expense Tracking', usage: 98 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="usage" name="Usage %" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Features</CardTitle>
                <CardDescription>Most frequently used platform features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Expense Tracking', percentage: 98 },
                    { name: 'Income Tracking', percentage: 95 },
                    { name: 'Assets Tracking', percentage: 92 },
                    { name: 'Liabilities Tracking', percentage: 88 },
                    { name: 'Personal Finance Dashboard', percentage: 85 },
                  ].map((feature, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{feature.name}</span>
                        <span className="text-sm font-medium">{feature.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${feature.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Underutilized Features</CardTitle>
                <CardDescription>Features with lower usage rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Investment Forecasting', percentage: 45 },
                    { name: 'Budget Categories', percentage: 52 },
                    { name: 'Financial Goals', percentage: 58 },
                    { name: 'Currency Conversion', percentage: 35 },
                    { name: 'Retirement Planning', percentage: 42 },
                  ].map((feature, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{feature.name}</span>
                        <span className="text-sm font-medium">{feature.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-amber-500 h-2.5 rounded-full" 
                          style={{ width: `${feature.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>Generate and download detailed analytics reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'User Growth Report', description: 'Detailed user acquisition and retention metrics' },
                  { name: 'Revenue Analysis', description: 'In-depth revenue breakdown by plans and periods' },
                  { name: 'Feature Usage Report', description: 'User engagement with platform features' },
                  { name: 'Churn Analysis', description: 'Detailed analysis of user churn and retention' },
                  { name: 'User Demographics', description: 'Breakdown of user base by demographics' },
                  { name: 'Financial Projections', description: 'Revenue and growth projections' },
                ].map((report, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{report.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{report.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Reports scheduled for automatic generation and distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Last Generated</TableHead>
                    <TableHead>Next Generation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: 'Weekly User Growth', frequency: 'Weekly', recipients: 'Growth Team', lastGen: '2023-11-21', nextGen: '2023-11-28' },
                    { name: 'Monthly Revenue Summary', frequency: 'Monthly', recipients: 'Exec Team', lastGen: '2023-10-31', nextGen: '2023-11-30' },
                    { name: 'Quarterly Business Review', frequency: 'Quarterly', recipients: 'All Stakeholders', lastGen: '2023-09-30', nextGen: '2023-12-31' },
                  ].map((report, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.frequency}</TableCell>
                      <TableCell>{report.recipients}</TableCell>
                      <TableCell>{report.lastGen}</TableCell>
                      <TableCell>{report.nextGen}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button variant="outline">Schedule New Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
