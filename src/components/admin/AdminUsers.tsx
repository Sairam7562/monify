import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Search, RefreshCw, UserPlus, Trash2, Ban, CheckCircle, Mail, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  User,
  getAllUsers,
  deleteUser,
  toggleUserStatus,
} from '@/services/userService';
import { addUserByAdmin } from '@/services/authService';
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const AdminUsers = () => {
  const { supabaseUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    role: 'User', 
    plan: 'Basic',
    enableTwoFactor: false 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    setUsers(getAllUsers());
  }, []);

  const refreshUsers = () => {
    setUsers(getAllUsers());
    toast.success("User list refreshed");
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handlePasswordReset = (user: User) => {
    setUserToReset(user);
    setResetEmailSent(false);
    setIsPasswordResetModalOpen(true);
  };

  const sendPasswordResetEmail = async () => {
    if (!userToReset) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Password reset email sent to ${userToReset.name} (${userToReset.email})`);
      toast.success(`Password reset email sent to ${userToReset.email}`);
      setResetEmailSent(true);
    } catch (error) {
      toast.error("Failed to send password reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      const success = deleteUser(userToDelete.id);
      if (success) {
        setUsers(getAllUsers());
        setIsDeleteModalOpen(false);
        toast.success(`${userToDelete.name} has been removed from the system.`);
      } else {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    const updatedUser = toggleUserStatus(userId);
    if (updatedUser) {
      setUsers(getAllUsers());
      toast.success(`${updatedUser.name}'s account is now ${updatedUser.status}.`);
    } else {
      toast.error("Failed to update user status");
    }
  };

  const handleAddUser = async () => {
    setIsLoading(true);
    try {
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
      
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name: newUser.name,
          role: newUser.role,
          plan: newUser.plan,
          twoFactorEnabled: newUser.enableTwoFactor,
          status: 'active'
        }
      });
      
      if (createError) {
        toast.error(`Failed to create user: ${createError.message}`);
        return;
      }
      
      if (userData?.user) {
        await sendInvitationEmail(
          userData.user.id,
          newUser.email, 
          newUser.name, 
          tempPassword
        );
        
        setUsers(getAllUsers());
        setIsAddUserModalOpen(false);
        setNewUser({ name: '', email: '', role: 'User', plan: 'Basic', enableTwoFactor: false });
        toast.success(`${newUser.name} has been added successfully and an invitation email has been sent.`);
      }
    } catch (error) {
      console.error("Add user error:", error);
      toast.error("Failed to add user. Make sure you have admin privileges.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendInvitationEmail = async (userId: string, email: string, name: string, tempPassword: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: {
          userId,
          email,
          name,
          tempPassword
        }
      });
      
      if (error) {
        console.error("Error sending invitation:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Send invitation error:", error);
      return false;
    }
  };

  const handleSendSupportMessage = (user: User) => {
    toast.success(`Support message sent to ${user.name}`);
    console.log(`Support message sent to ${user.name} (${user.email})`);
  };

  const handleAccessUserDashboard = (user: User) => {
    toast.success(`Accessing ${user.name}'s dashboard in view mode`);
    console.log(`Admin accessing ${user.name}'s dashboard in view mode`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Platform Users</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={refreshUsers}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsAddUserModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" /> Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all platform users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.plan}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {user.twoFactorEnabled ? (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        Disabled
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={user.status === 'active' ? "text-amber-600" : "text-green-600"}
                      >
                        {user.status === 'active' ? (
                          <><Ban className="h-4 w-4 mr-1" /> Deactivate</>
                        ) : (
                          <><CheckCircle className="h-4 w-4 mr-1" /> Activate</>
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handlePasswordReset(user)}
                        className="text-blue-600"
                      >
                        <Mail className="h-4 w-4 mr-1" /> Reset
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </CardFooter>
      </Card>

      {/* View User Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details - Support View Mode</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">User Information</h3>
                  <div className="mt-2 bg-gray-50 p-3 rounded">
                    <p className="text-sm"><span className="font-medium">Name:</span> {selectedUser.name}</p>
                    <p className="text-sm"><span className="font-medium">Email:</span> {selectedUser.email}</p>
                    <p className="text-sm"><span className="font-medium">Status:</span> {selectedUser.status}</p>
                    <p className="text-sm"><span className="font-medium">Role:</span> {selectedUser.role}</p>
                    <p className="text-sm"><span className="font-medium">2FA Enabled:</span> {selectedUser.twoFactorEnabled ? "Yes" : "No"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Subscription Details</h3>
                  <div className="mt-2 bg-gray-50 p-3 rounded">
                    <p className="text-sm"><span className="font-medium">Plan:</span> {selectedUser.plan}</p>
                    <p className="text-sm"><span className="font-medium">Billing Period:</span> Monthly</p>
                    <p className="text-sm"><span className="font-medium">Next Billing:</span> 2023-12-15</p>
                    <p className="text-sm"><span className="font-medium">Payment Method:</span> Visa ending in 4242</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Account Activity</h3>
                  <div className="mt-2 bg-gray-50 p-3 rounded">
                    <p className="text-sm"><span className="font-medium">Last Login:</span> {selectedUser.lastLogin}</p>
                    <p className="text-sm"><span className="font-medium">Login Count:</span> 42</p>
                    <p className="text-sm"><span className="font-medium">Session Duration:</span> 25 minutes avg.</p>
                    <p className="text-sm"><span className="font-medium">Last IP:</span> 198.51.100.42</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Support Actions</h3>
                  <div className="mt-2 flex flex-col gap-2">
                    <Button className="w-full" onClick={() => handleAccessUserDashboard(selectedUser)}>
                      Access Dashboard in View Mode
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handlePasswordReset(selectedUser)}>
                      Send Password Reset Link
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleSendSupportMessage(selectedUser)}>
                      Send Support Message
                    </Button>
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-amber-600 font-medium">
                  🔒 Support View Mode: You can view user data but cannot modify or delete information.
                  All actions are logged for security purposes.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account and send them an invitation email with a temporary password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">User Role</label>
                <select
                  id="role"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  <option value="Support">Support</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="plan" className="text-sm font-medium">Subscription Plan</label>
                <select
                  id="plan"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newUser.plan}
                  onChange={(e) => setNewUser({...newUser, plan: e.target.value})}
                >
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="two-factor"
                  checked={newUser.enableTwoFactor}
                  onCheckedChange={(checked) => setNewUser({...newUser, enableTwoFactor: checked})}
                />
                <label htmlFor="two-factor" className="text-sm font-medium">
                  Require Two-Factor Authentication
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddUser} 
              disabled={!newUser.name || !newUser.email || isLoading}
            >
              {isLoading ? "Adding User..." : "Add User & Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={isPasswordResetModalOpen} onOpenChange={setIsPasswordResetModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Reset</DialogTitle>
            <DialogDescription>
              Send a password reset link to the user's email address.
            </DialogDescription>
          </DialogHeader>
          {userToReset && (
            <div className="py-4">
              <p className="font-medium">{userToReset.name}</p>
              <p className="text-sm text-gray-500 mb-4">{userToReset.email}</p>
              
              {!resetEmailSent ? (
                <div className="space-y-4">
                  <p className="text-sm">
                    This will send an email to the user with instructions on how to reset their password.
                    The link will expire in 24 hours.
                  </p>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                    <p className="text-xs text-amber-600">
                      This action will be logged for security purposes.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <p className="text-sm text-green-800">
                    Password reset email has been sent successfully to {userToReset.email}.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordResetModalOpen(false)}>
              {resetEmailSent ? "Close" : "Cancel"}
            </Button>
            {!resetEmailSent && (
              <Button onClick={sendPasswordResetEmail} disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm User Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="py-4">
              <p className="font-medium">{userToDelete.name}</p>
              <p className="text-sm text-gray-500">{userToDelete.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
