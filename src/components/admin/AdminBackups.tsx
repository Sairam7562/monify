
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
import { 
  Database, CloudCog, DownloadCloud, CheckCircle, 
  AlertCircle, Calendar, RotateCcw, ArrowUpFromLine, FileDown, 
  Clock, HardDrive, FileLock2, Layers, Settings2
} from 'lucide-react';

// Mock backup history data
const mockBackups = [
  { id: 1, name: 'Weekly Backup', timestamp: '2023-11-27 01:00:00', type: 'Automated', status: 'Completed', size: '485 MB', retention: '90 days' },
  { id: 2, name: 'Daily Backup', timestamp: '2023-11-28 01:00:00', type: 'Automated', status: 'Completed', size: '492 MB', retention: '30 days' },
  { id: 3, name: 'Pre-Update Backup', timestamp: '2023-11-26 14:22:15', type: 'Manual', status: 'Completed', size: '480 MB', retention: '180 days' },
  { id: 4, name: 'Emergency Backup', timestamp: '2023-11-25 09:15:32', type: 'Manual', status: 'Completed', size: '478 MB', retention: '365 days' },
  { id: 5, name: 'Daily Backup', timestamp: '2023-11-24 01:00:00', type: 'Automated', status: 'Failed', size: '0 MB', retention: '30 days' },
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

  const handleBackup = () => {
    setIsBackupInProgress(true);
    setBackupProgress(0);
    
    // Simulate backup progress
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackupInProgress(false);
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

  const handleSettingChange = (setting, value) => {
    setBackupSettings(prev => ({
      ...prev,
      [setting]: value
    }));
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
                    <Button variant="outline">
                      <FileDown className="h-4 w-4 mr-2" />
                      Download Latest
                    </Button>
                    <Button variant="outline">
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
            
            <Button className="w-full">Save Configuration</Button>
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
                  <TableHead>Retention</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBackups.map((backup) => (
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
                    <TableCell>{backup.retention}</TableCell>
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
            <Button variant="destructive">
              I Understand, Restore System
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBackups;
