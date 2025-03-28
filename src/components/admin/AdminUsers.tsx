
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Search, RefreshCw, UserPlus, Trash2, Ban, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Mock user data
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', plan: 'Premium', lastLogin: '2023-11-28', role: 'User' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active', plan: 'Basic', lastLogin: '2023-11-27', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', plan: 'Premium', lastLogin: '2023-11-20', role: 'User' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'active', plan: 'Enterprise', lastLogin: '2023-11-28', role: 'User' },
  { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', status: 'suspended', plan: 'Basic', lastLogin: '2023-11-15', role: 'User' },
];

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [users, setUsers] = useState(mockUsers);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'User', plan: 'Basic' });
  const { toast } = useToast();

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = () => {
    setUsers(users.filter(user => user.id !== userToDelete.id));
    setIsDeleteModalOpen(false);
    toast({
      title: "User Deleted",
      description: `${userToDelete.name} has been removed from the system.`,
      variant: "destructive",
    });
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        toast({
          title: `User ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
          description: `${user.name}'s account is now ${newStatus}.`,
          variant: newStatus === 'active' ? "default" : "destructive",
        });
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  const handleAddUser = () => {
    const newId = Math.max(...users.map(u => u.id)) + 1;
    const currentDate = new Date().toISOString().split('T')[0];
    
    const userToAdd = {
      id: newId,
      name: newUser.name,
      email: newUser.email,
      status: 'active',
      plan: newUser.plan,
      lastLogin: currentDate,
      role: newUser.role
    };
    
    setUsers([...users, userToAdd]);
    setIsAddUserModalOpen(false);
    setNewUser({ name: '', email: '', role: 'User', plan: 'Basic' });
    
    toast({
      title: "User Added",
      description: `${newUser.name} has been added successfully.`,
    });
  };

  const getStatusColor = (status) => {
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
          <Button variant="outline" size="icon">
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleUserStatus(user.id)}
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
                    <Button className="w-full">Access Dashboard in View Mode</Button>
                    <Button variant="outline" className="w-full">Send Password Reset Link</Button>
                    <Button variant="outline" className="w-full">Send Support Message</Button>
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
              Create a new user account for the platform.
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={!newUser.name || !newUser.email}>Add User</Button>
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
