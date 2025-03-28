
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, CloudCog, DownloadCloud, CheckCircle, 
  AlertCircle, Calendar, RotateCcw, ArrowUpFromLine, FileDown, 
  Clock, HardDrive, FileLock2, Layers, Settings2, Shield, Lock
} from 'lucide-react';

// Mock backup history data
const mockBackups = [
  { id: 1, name: 'Weekly Backup', timestamp: '2023-11-27 01:00:00', type: 'Automated', status: 'Completed', size: '485 MB', retention: '90 days', encrypted: true },
  { id: 2, name: 'Daily Backup', timestamp: '2023-11-28 01:00:00', type: 'Automated', status: 'Completed', size: '492 MB', retention: '30 days', encrypted: true },
  { id: 3, name: 'Pre-Update Backup', timestamp: '2023-11-26 14:22:15', type: 'Manual', status: 'Completed', size: '480 MB', retention: '180 days', encrypted: true },
  { id: 4, name: 'Emergency Backup', timestamp: '2023-11-25 09:15:32', type: 'Manual', status: 'Completed', size: '478 MB', retention: '365 days', encrypted: true },
  { id: 5, name: 'Daily Backup', timestamp: '2023-11-24 01:00:00', type: 'Automated', status: 'Failed', size: '0 MB', retention: '30 days', encrypted: false },
];

// Mock regions
const regions = [
  { value: 'us-east', label: 'US East (N. Virginia)' },
  { value: 'us-west', label: 'US West (Oregon)' },
  { value: 'eu-central', label: 'EU Central (Frankfurt)' },
  { value: 'ap-southeast', label: 'Asia Pacific (Singapore)' },
];

const AdminBackups = () => {
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [backupSettings, setBackupSettings] = useState({
    dailyBackup: true,
    weeklyBackup: true,
    monthlyBackup: true,
    primaryRegion: 'us-east',
    secondaryRegion: 'eu-central',
    retentionDays: 90,
    encryption: true,
    autoRollback: true
  });
  const [backups, setBackups] = useState(mockBackups);
  const [isAdminVerificationModalOpen, setIsAdminVerificationModalOpen] = useState(false);
  const [adminVerification, setAdminVerification] = useState({ password: '' });
  const [backupAction, setBackupAction] = useState({ type: '', backup: null });
  const { toast } = useToast();

  const handleBackup = () => {
    setIsBackupInProgress(true);
    setBackupProgress(0);
    
    // Simulate backup progress
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackupInProgress(false);
          
          // Add new backup to list
          const currentDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
          const newBackup = {
            id: backups.length + 1,
            name: 'Manual Backup',
            timestamp: currentDate,
            type: 'Manual',
            status: 'Completed',
            size: '496 MB',
            retention: '180 days',
            encrypted: backupSettings.encryption
          };
          
          setBackups([newBackup, ...backups]);
          
          toast({
            title: "Backup Complete",
            description: "Manual backup has been created successfully.",
          });
          
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleRestoreClick = (backup) => {
    setSelectedBackup(backup);
    setShowRestoreConfirm(true);
  };

  const handleDownloadClick = (backup) => {
    setBackupAction({ type: 'download', backup });
    setIsAdminVerificationModalOpen(true);
  };

  const handleSettingChange = (setting, value) => {
    setBackupSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    toast({
      title: "Backup Setting Updated",
      description: `The ${setting} setting has been updated.`,
    });
  };

  const verifyAdminAndProceed = () => {
    // In a real app, this would verify the admin's credentials
    setIsAdminVerificationModalOpen(false);
    
    if (backupAction.type === 'download') {
      toast({
        title: "Download Started",
        description: `${backupAction.backup.name} (${backupAction.backup.size}) is being prepared for download.`,
      });
      
      // Simulate download delay
      setTimeout(() => {
        toast({
          title: "Download Complete",
          description: `${backupAction.backup.name} has been downloaded.`,
        });
      }, 2000);
    } else if (backupAction.type === 'restore') {
      setShowRestoreConfirm(true);
    }
    
    setAdminVerification({ password: '' });
  };

  const handleBackupConfigSave = () => {
    toast({
      title: "Backup Configuration Saved",
      description: "Your backup settings have been updated successfully.",
    });
  };

  const performSystemRestore = () => {
    if (!selectedBackup) return;
    
    toast({
      title: "System Restore Initiated",
      description: "The system is being restored. Users have been notified of maintenance.",
      variant: "destructive",
    });
    
    // Simulate restore process
    setTimeout(() => {
      toast({
        title: "System Restore Complete",
        description: "The system has been successfully restored to the selected backup point.",
      });
      setShowRestoreConfirm(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Backup & Rollback System</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-monify-purple-600" />
              <span>Backup Status</span>
            </CardTitle>
            <CardDescription>Current backup status and manual controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Last Backup Status: Healthy</span>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">Success</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">Latest: Daily Backup completed on 2023-11-28 01:00:00</p>
                <div className="flex items-center justify-between text-sm">
                  <span>Next scheduled backup: 2023-11-29 01:00:00</span>
                  <span>Size: 492 MB</span>
                </div>
                {backupSettings.encryption && (
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <FileLock2 className="h-3 w-3 mr-1" /> 
                    Encrypted with AES-256
                  </div>
                )}
              </div>
              
              {isBackupInProgress ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Backup in progress...</span>
                    <span className="text-sm">{backupProgress}%</span>
                  </div>
                  <Progress value={backupProgress} />
                  <p className="text-xs text-gray-500">Backing up database and file storage. Please wait...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button onClick={handleBackup}>
                    <ArrowUpFromLine className="h-4 w-4 mr-2" />
                    Create Manual Backup
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        if (backups.length > 0) {
                          handleDownloadClick(backups[0]);
                        } else {
                          toast({
                            title: "No Backups Available",
                            description: "There are no backups to download.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Download Latest
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Verification Started",
                          description: "Verifying backup integrity. This may take a few minutes.",
                        });
                        
                        // Simulate verification
                        setTimeout(() => {
                          toast({
                            title: "Verification Complete",
                            description: "All backups are intact and valid.",
                          });
                        }, 2000);
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Verify Backups
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudCog className="h-5 w-5 text-monify-purple-600" />
              <span>Backup Configuration</span>
            </CardTitle>
            <CardDescription>Configure automatic backup settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="daily-backup" className="font-medium">Daily Backups</Label>
                <p className="text-xs text-gray-500">Every day at 1:00 AM UTC</p>
              </div>
              <Switch
                id="daily-backup"
                checked={backupSettings.dailyBackup}
                onCheckedChange={(checked) => handleSettingChange('dailyBackup', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-backup" className="font-medium">Weekly Backups</Label>
                <p className="text-xs text-gray-500">Every Sunday at 2:00 AM UTC</p>
              </div>
              <Switch
                id="weekly-backup"
                checked={backupSettings.weeklyBackup}
                onCheckedChange={(checked) => handleSettingChange('weeklyBackup', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="monthly-backup" className="font-medium">Monthly Backups</Label>
                <p className="text-xs text-gray-500">1st day of month at 3:00 AM UTC</p>
              </div>
              <Switch
                id="monthly-backup"
                checked={backupSettings.monthlyBackup}
                onCheckedChange={(checked) => handleSettingChange('monthlyBackup', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="primary-region" className="font-medium">Primary Backup Region</Label>
              <Select 
                value={backupSettings.primaryRegion}
                onValueChange={(value) => handleSettingChange('primaryRegion', value)}
              >
                <SelectTrigger id="primary-region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondary-region" className="font-medium">Secondary Backup Region</Label>
              <Select 
                value={backupSettings.secondaryRegion}
                onValueChange={(value) => handleSettingChange('secondaryRegion', value)}
              >
                <SelectTrigger id="secondary-region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="encryption-toggle" className="font-medium">Encryption (AES-256)</Label>
                <p className="text-xs text-gray-500">Encrypt all backup data</p>
              </div>
              <Switch
                id="encryption-toggle"
                checked={backupSettings.encryption}
                onCheckedChange={(checked) => handleSettingChange('encryption', checked)}
              />
            </div>
            
            <Button className="w-full" onClick={handleBackupConfigSave}>Save Configuration</Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-monify-purple-600" />
            <span>Backup History</span>
          </CardTitle>
          <CardDescription>View past backups and restore points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Backup Name</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Security</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell className="font-medium">{backup.name}</TableCell>
                    <TableCell>{backup.timestamp}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={backup.type === 'Automated' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                        {backup.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{backup.size}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {backup.status === 'Completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        {backup.status}
                      </div>
                    </TableCell>
                    <TableCell>
                      {backup.encrypted ? (
                        <div className="flex items-center text-green-600 text-xs">
                          <FileLock2 className="h-3 w-3 mr-1" />
                          Encrypted
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">Standard</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRestoreClick(backup)}
                          disabled={backup.status !== 'Completed'}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" /> Restore
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={backup.status !== 'Completed'}
                          onClick={() => handleDownloadClick(backup)}
                        >
                          <DownloadCloud className="h-4 w-4 mr-1" /> Download
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
      
      {/* System Restore Confirmation Dialog */}
      <Dialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-amber-600">Confirm System Restore</DialogTitle>
            <DialogDescription>
              This action will restore the entire system to a previous state. All data changes since this backup will be lost.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBackup && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="font-medium mb-2">Restore Details:</h3>
                <p className="text-sm">Backup: <span className="font-medium">{selectedBackup.name}</span></p>
                <p className="text-sm">Date: <span className="font-medium">{selectedBackup.timestamp}</span></p>
                <p className="text-sm">Size: <span className="font-medium">{selectedBackup.size}</span></p>
              </div>
              
              <div className="p-4 bg-gray-50 border rounded-lg">
                <h3 className="font-medium mb-2">Important Notes:</h3>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li>All users will be logged out during restoration</li>
                  <li>The system will be in maintenance mode for approximately 5-10 minutes</li>
                  <li>Email notifications will be sent to all administrators</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={performSystemRestore}>
              I Understand, Restore System
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Admin Verification Dialog for Download */}
      <Dialog open={isAdminVerificationModalOpen} onOpenChange={setIsAdminVerificationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-monify-purple-600" />
              <span>Master Admin Verification</span>
            </DialogTitle>
            <DialogDescription>
              Only Master Administrators can download backup files for security reasons.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="p-4 bg-gray-50 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-5 w-5 text-amber-600" />
                <p className="font-medium text-amber-600">Security Notice</p>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                Backup files contain sensitive user data. Only Master Administrators are authorized to download these files.
              </p>
              <p className="text-sm text-gray-700">
                All download attempts are logged for security audit purposes.
              </p>
            </div>
            
            {backupAction.backup && (
              <div className="space-y-2">
                <Label htmlFor="master-password">Master Admin Password</Label>
                <Input
                  id="master-password"
                  type="password"
                  placeholder="Enter your password"
                  value={adminVerification.password}
                  onChange={(e) => setAdminVerification({...adminVerification, password: e.target.value})}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdminVerificationModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={verifyAdminAndProceed}
              disabled={!adminVerification.password}
            >
              Verify and Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBackups;
