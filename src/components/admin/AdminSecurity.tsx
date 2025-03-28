
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Lock, Key, UserPlus, Trash2, RefreshCcw, 
  AlertTriangle, CheckCircle, Clock
} from 'lucide-react';

// Mock admin users data
const mockAdmins = [
  { id: 1, name: 'Alex Johnson', email: 'alex@monify.com', role: 'Super Admin', lastActive: '2023-11-28 14:32', status: 'active' },
  { id: 2, name: 'Monica Smith', email: 'monica@monify.com', role: 'Billing Admin', lastActive: '2023-11-28 10:15', status: 'active' },
  { id: 3, name: 'Trevor Wilson', email: 'trevor@monify.com', role: 'Customer Support', lastActive: '2023-11-27 16:45', status: 'active' },
  { id: 4, name: 'Lucy Chang', email: 'lucy@monify.com', role: 'Content Manager', lastActive: '2023-11-28 09:20', status: 'inactive' },
];

// Mock audit log data
const mockAuditLog = [
  { id: 1, action: 'User profile viewed', user: 'Alex Johnson', timestamp: '2023-11-28 14:35:22', details: 'Viewed user ID: 1032', severity: 'info' },
  { id: 2, action: 'Feature toggled', user: 'Monica Smith', timestamp: '2023-11-28 13:22:15', details: 'Disabled Feature: Expense Categorization', severity: 'warning' },
  { id: 3, action: 'Admin added', user: 'Alex Johnson', timestamp: '2023-11-28 11:15:43', details: 'Added new Content Manager: Lucy Chang', severity: 'warning' },
  { id: 4, action: 'Password reset', user: 'Trevor Wilson', timestamp: '2023-11-28 10:42:11', details: 'Reset password for user ID: 2056', severity: 'warning' },
  { id: 5, action: 'Login successful', user: 'Alex Johnson', timestamp: '2023-11-28 09:15:02', details: 'IP: 192.168.1.105', severity: 'info' },
];

const AdminSecurity = () => {
  const [securitySettings, setSecuritySettings] = useState({
    mfaRequired: true,
    passwordPolicy: 'strict',
    sessionTimeout: 30,
    ipRestriction: false,
    auditLogging: true
  });
  
  const handleSecurityChange = (setting, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-amber-100 text-amber-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Security & Compliance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-monify-purple-600" />
              <span>Security Settings</span>
            </CardTitle>
            <CardDescription>Manage platform-wide security configurations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <Label htmlFor="mfa-toggle" className="font-medium">Multi-Factor Authentication</Label>
                <p className="text-sm text-gray-500">Require MFA for all admin users</p>
              </div>
              <Switch
                id="mfa-toggle"
                checked={securitySettings.mfaRequired}
                onCheckedChange={(checked) => handleSecurityChange('mfaRequired', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password-policy" className="font-medium">Password Policy</Label>
              <p className="text-sm text-gray-500">Set the complexity requirements for passwords</p>
              <ToggleGroup 
                type="single" 
                id="password-policy"
                value={securitySettings.passwordPolicy}
                onValueChange={(value) => value && handleSecurityChange('passwordPolicy', value)}
                className="justify-start"
              >
                <ToggleGroupItem value="basic">Basic</ToggleGroupItem>
                <ToggleGroupItem value="standard">Standard</ToggleGroupItem>
                <ToggleGroupItem value="strict">Strict</ToggleGroupItem>
              </ToggleGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="session-timeout" className="font-medium">Session Timeout (minutes)</Label>
              <p className="text-sm text-gray-500">Automatically log out inactive admin users</p>
              <Input 
                id="session-timeout"
                type="number" 
                min="5" 
                max="120"
                value={securitySettings.sessionTimeout}
                onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <div>
                <Label htmlFor="ip-restriction" className="font-medium">IP Restriction</Label>
                <p className="text-sm text-gray-500">Limit admin access to specific IP addresses</p>
              </div>
              <Switch
                id="ip-restriction"
                checked={securitySettings.ipRestriction}
                onCheckedChange={(checked) => handleSecurityChange('ipRestriction', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <div>
                <Label htmlFor="audit-logging" className="font-medium">Detailed Audit Logging</Label>
                <p className="text-sm text-gray-500">Enable comprehensive activity logs</p>
              </div>
              <Switch
                id="audit-logging"
                checked={securitySettings.auditLogging}
                onCheckedChange={(checked) => handleSecurityChange('auditLogging', checked)}
              />
            </div>
            
            <Button className="w-full mt-4">Save Security Settings</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-monify-purple-600" />
              <span>Admin Access Control</span>
            </CardTitle>
            <CardDescription>Manage administrators and their roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <h3 className="text-sm font-medium">Current Administrators</h3>
              <Button size="sm" variant="outline" className="text-xs">
                <UserPlus className="h-3 w-3 mr-1" /> Add Admin
              </Button>
            </div>
            
            <div className="rounded border overflow-hidden mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{admin.name}</p>
                          <p className="text-xs text-gray-500">{admin.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{admin.role}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {admin.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-monify-purple-600" />
            <span>Security Audit Log</span>
          </CardTitle>
          <CardDescription>Track security-related activities and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAuditLog.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">{log.timestamp}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell className="text-sm">{log.details}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" size="sm">
              <RefreshCcw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <div className="flex gap-1">
              <Button variant="outline" size="sm">Export Log</Button>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSecurity;
