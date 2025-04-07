
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import AssetCreationModal from '@/components/finance/AssetCreationModal';

// Define types for assets and liabilities
type Asset = {
  id: string;
  name: string;
  value: string;
  type: string;
  description?: string;
  isNew?: boolean;
  isDeleted?: boolean;
  isModified?: boolean;
};

type Liability = {
  id: string;
  name: string;
  amount: string;
  type: string;
  interest_rate?: number | null;
  associated_asset_id?: string | null;
  ownership_percentage?: number | null;
  description?: string; // Add this as optional since it's not in the DB schema
  isNew?: boolean;
  isDeleted?: boolean;
  isModified?: boolean;
};

interface AssetLiabilityFormProps {
  persistDataOnTabChange?: boolean;
}

const AssetLiabilityForm: React.FC<AssetLiabilityFormProps> = ({ persistDataOnTabChange = false }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assets');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

  // Asset form state
  const [assetName, setAssetName] = useState('');
  const [assetValue, setAssetValue] = useState('');
  const [assetType, setAssetType] = useState('Cash & Bank Accounts');
  const [assetDescription, setAssetDescription] = useState('');

  // Liability form state
  const [liabilityName, setLiabilityName] = useState('');
  const [liabilityAmount, setLiabilityAmount] = useState('');
  const [liabilityType, setLiabilityType] = useState('Mortgage');
  const [liabilityDescription, setLiabilityDescription] = useState('');

  // Load assets and liabilities from database
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Fetch assets
        const { data: assetData, error: assetError } = await supabase
          .from('assets')
          .select('*')
          .eq('user_id', user.id);
          
        if (assetError) throw assetError;
        
        // Fetch liabilities
        const { data: liabilityData, error: liabilityError } = await supabase
          .from('liabilities')
          .select('*')
          .eq('user_id', user.id);
          
        if (liabilityError) throw liabilityError;
        
        // Format asset data
        const formattedAssets = assetData.map(asset => ({
          id: asset.id,
          name: asset.name,
          value: asset.value.toString(),
          type: asset.type,
          description: asset.description || '',
        }));
        
        // Format liability data
        const formattedLiabilities = liabilityData.map(liability => ({
          id: liability.id,
          name: liability.name,
          amount: liability.amount.toString(),
          type: liability.type,
          // We'll store description in memory even if it's not in the DB schema
          description: '',
          interest_rate: liability.interest_rate,
          associated_asset_id: liability.associated_asset_id,
          ownership_percentage: liability.ownership_percentage
        }));
        
        setAssets(formattedAssets);
        setLiabilities(formattedLiabilities);
        
        // Check for local data that might need to be synced
        const localAssets = JSON.parse(localStorage.getItem('local_assets') || '[]');
        const localLiabilities = JSON.parse(localStorage.getItem('local_liabilities') || '[]');
        
        if (localAssets.length > 0 || localLiabilities.length > 0) {
          toast.info("Found locally saved data. Syncing with database...");
          // Handle syncing logic here
        }
      } catch (error) {
        console.error('Error fetching assets and liabilities:', error);
        toast.error('Failed to load your financial data');
        
        // Try to load from local storage as fallback
        const localAssets = JSON.parse(localStorage.getItem('local_assets') || '[]');
        const localLiabilities = JSON.parse(localStorage.getItem('local_liabilities') || '[]');
        
        if (localAssets.length > 0 || localLiabilities.length > 0) {
          setAssets(localAssets);
          setLiabilities(localLiabilities);
          toast.info("Loaded data from local storage due to connection issues");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Calculate totals
  const totalAssets = assets
    .filter(asset => !asset.isDeleted)
    .reduce((sum, asset) => sum + (parseFloat(asset.value) || 0), 0);
    
  const totalLiabilities = liabilities
    .filter(liability => !liability.isDeleted)
    .reduce((sum, liability) => sum + (parseFloat(liability.amount) || 0), 0);
    
  const netWorth = totalAssets - totalLiabilities;

  // Handle tab change
  const handleTabChange = (value: string) => {
    if (persistDataOnTabChange) {
      // Save current tab data before switching
      if (activeTab === 'assets' && assetName && assetValue) {
        handleAddAsset();
      } else if (activeTab === 'liabilities' && liabilityName && liabilityAmount) {
        handleAddLiability();
      }
    }
    
    setActiveTab(value);
  };

  // Asset handlers
  const handleAddAsset = () => {
    if (!assetName || !assetValue) {
      toast.error('Please enter both name and value for the asset');
      return;
    }
    
    const newAsset: Asset = {
      id: uuidv4(),
      name: assetName,
      value: assetValue,
      type: assetType,
      description: assetDescription,
      isNew: true
    };
    
    setAssets(prev => [...prev, newAsset]);
    
    // Reset form
    setAssetName('');
    setAssetValue('');
    setAssetType('Cash & Bank Accounts');
    setAssetDescription('');
    
    toast.success('Asset added successfully!');
  };

  const handleOpenAssetModal = () => {
    setIsAssetModalOpen(true);
  };

  const handleAssetCreated = () => {
    // Refresh assets after a new one is created
    if (user) {
      setIsLoading(true);
      supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching assets:', error);
            return;
          }
          
          const formattedAssets = data.map(asset => ({
            id: asset.id,
            name: asset.name,
            value: asset.value.toString(),
            type: asset.type,
            description: asset.description || '',
          }));
          
          setAssets(formattedAssets);
          setIsLoading(false);
        });
    }
  };

  const handleUpdateAsset = (id: string, field: keyof Asset, value: string) => {
    setAssets(prev => 
      prev.map(asset => 
        asset.id === id 
          ? { ...asset, [field]: value, isModified: true } 
          : asset
      )
    );
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(prev => 
      prev.map(asset => 
        asset.id === id 
          ? { ...asset, isDeleted: true } 
          : asset
      )
    );
    
    toast.success('Asset marked for deletion');
  };

  const handleSaveAsset = async (id: string) => {
    const asset = assets.find(a => a.id === id);
    if (!asset || !user) return;
    
    setIsSaving(true);
    
    try {
      if (asset.isNew) {
        // Create new asset
        const { error } = await supabase
          .from('assets')
          .insert([{
            name: asset.name,
            value: parseFloat(asset.value),
            type: asset.type,
            description: asset.description,
            user_id: user.id
          }]);
          
        if (error) throw error;
        
        // Update local state to remove isNew flag
        setAssets(prev => 
          prev.map(a => 
            a.id === id 
              ? { ...a, isNew: false, isModified: false } 
              : a
          )
        );
        
        toast.success('Asset saved to database');
      } else if (asset.isModified) {
        // Update existing asset
        const { error } = await supabase
          .from('assets')
          .update({
            name: asset.name,
            value: parseFloat(asset.value),
            type: asset.type,
            description: asset.description
          })
          .eq('id', id);
          
        if (error) throw error;
        
        // Update local state to remove isModified flag
        setAssets(prev => 
          prev.map(a => 
            a.id === id 
              ? { ...a, isModified: false } 
              : a
          )
        );
        
        toast.success('Asset updated successfully');
      }
    } catch (error) {
      console.error('Error saving asset:', error);
      toast.error('Failed to save asset. Saving locally instead.');
      
      // Save to local storage as fallback
      localStorage.setItem('local_assets', JSON.stringify(assets));
    } finally {
      setIsSaving(false);
    }
  };

  // Liability handlers
  const handleAddLiability = () => {
    if (!liabilityName || !liabilityAmount) {
      toast.error('Please enter both name and amount for the liability');
      return;
    }
    
    const newLiability: Liability = {
      id: uuidv4(),
      name: liabilityName,
      amount: liabilityAmount,
      type: liabilityType,
      description: liabilityDescription,
      isNew: true
    };
    
    setLiabilities(prev => [...prev, newLiability]);
    
    // Reset form
    setLiabilityName('');
    setLiabilityAmount('');
    setLiabilityType('Mortgage');
    setLiabilityDescription('');
    
    toast.success('Liability added successfully!');
  };

  const handleUpdateLiability = (id: string, field: keyof Liability, value: string) => {
    setLiabilities(prev => 
      prev.map(liability => 
        liability.id === id 
          ? { ...liability, [field]: value, isModified: true } 
          : liability
      )
    );
  };

  const handleDeleteLiability = (id: string) => {
    setLiabilities(prev => 
      prev.map(liability => 
        liability.id === id 
          ? { ...liability, isDeleted: true } 
          : liability
      )
    );
    
    toast.success('Liability marked for deletion');
  };

  const handleSaveLiability = async (id: string) => {
    const liability = liabilities.find(l => l.id === id);
    if (!liability || !user) return;
    
    setIsSaving(true);
    
    try {
      if (liability.isNew) {
        // Create new liability - only include fields that exist in the DB schema
        const { error } = await supabase
          .from('liabilities')
          .insert([{
            name: liability.name,
            amount: parseFloat(liability.amount),
            type: liability.type,
            // Don't include description since it's not in the DB schema
            user_id: user.id
          }]);
          
        if (error) throw error;
        
        // Update local state to remove isNew flag
        setLiabilities(prev => 
          prev.map(l => 
            l.id === id 
              ? { ...l, isNew: false, isModified: false } 
              : l
          )
        );
        
        toast.success('Liability saved to database');
      } else if (liability.isModified) {
        // Update existing liability - only include fields that exist in the DB schema
        const { error } = await supabase
          .from('liabilities')
          .update({
            name: liability.name,
            amount: parseFloat(liability.amount),
            type: liability.type,
            // Don't include description since it's not in the DB schema
          })
          .eq('id', id);
          
        if (error) throw error;
        
        // Update local state to remove isModified flag
        setLiabilities(prev => 
          prev.map(l => 
            l.id === id 
              ? { ...l, isModified: false } 
              : l
          )
        );
        
        toast.success('Liability updated successfully');
      }
    } catch (error) {
      console.error('Error saving liability:', error);
      toast.error('Failed to save liability. Saving locally instead.');
      
      // Save to local storage as fallback
      localStorage.setItem('local_liabilities', JSON.stringify(liabilities));
    } finally {
      setIsSaving(false);
    }
  };

  // Save all changes
  const handleSaveAll = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Process assets
      const newAssets = assets.filter(a => a.isNew && !a.isDeleted);
      const modifiedAssets = assets.filter(a => a.isModified && !a.isNew && !a.isDeleted);
      const deletedAssets = assets.filter(a => a.isDeleted && !a.isNew);
      
      // Process liabilities
      const newLiabilities = liabilities.filter(l => l.isNew && !l.isDeleted);
      const modifiedLiabilities = liabilities.filter(l => l.isModified && !l.isNew && !l.isDeleted);
      const deletedLiabilities = liabilities.filter(l => l.isDeleted && !l.isNew);
      
      // Create new assets
      if (newAssets.length > 0) {
        const { error } = await supabase
          .from('assets')
          .insert(
            newAssets.map(a => ({
              name: a.name,
              value: parseFloat(a.value),
              type: a.type,
              description: a.description,
              user_id: user.id
            }))
          );
          
        if (error) throw error;
      }
      
      // Update modified assets
      for (const asset of modifiedAssets) {
        const { error } = await supabase
          .from('assets')
          .update({
            name: asset.name,
            value: parseFloat(asset.value),
            type: asset.type,
            description: asset.description
          })
          .eq('id', asset.id);
          
        if (error) throw error;
      }
      
      // Delete assets
      if (deletedAssets.length > 0) {
        const { error } = await supabase
          .from('assets')
          .delete()
          .in('id', deletedAssets.map(a => a.id));
          
        if (error) throw error;
      }
      
      // Create new liabilities - exclude description field as it's not in the DB schema
      if (newLiabilities.length > 0) {
        const { error } = await supabase
          .from('liabilities')
          .insert(
            newLiabilities.map(l => ({
              name: l.name,
              amount: parseFloat(l.amount),
              type: l.type,
              // Don't include description
              user_id: user.id
            }))
          );
          
        if (error) throw error;
      }
      
      // Update modified liabilities - exclude description field as it's not in the DB schema
      for (const liability of modifiedLiabilities) {
        const { error } = await supabase
          .from('liabilities')
          .update({
            name: liability.name,
            amount: parseFloat(liability.amount),
            type: liability.type,
            // Don't include description
          })
          .eq('id', liability.id);
          
        if (error) throw error;
      }
      
      // Delete liabilities
      if (deletedLiabilities.length > 0) {
        const { error } = await supabase
          .from('liabilities')
          .delete()
          .in('id', deletedLiabilities.map(l => l.id));
          
        if (error) throw error;
      }
      
      // Update local state
      setAssets(prev => 
        prev
          .filter(a => !a.isDeleted)
          .map(a => ({ ...a, isNew: false, isModified: false }))
      );
      
      setLiabilities(prev => 
        prev
          .filter(l => !l.isDeleted)
          .map(l => ({ ...l, isNew: false, isModified: false }))
      );
      
      toast.success('All changes saved successfully!');
      
      // Clear local storage backups
      localStorage.removeItem('local_assets');
      localStorage.removeItem('local_liabilities');
    } catch (error) {
      console.error('Error saving all changes:', error);
      toast.error('Failed to save all changes. Saving locally instead.');
      
      // Save to local storage as fallback
      localStorage.setItem('local_assets', JSON.stringify(assets));
      localStorage.setItem('local_liabilities', JSON.stringify(liabilities));
    } finally {
      setIsSaving(false);
    }
  };

  // Refresh data from database
  const handleRefresh = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Fetch assets
      const { data: assetData, error: assetError } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id);
        
      if (assetError) throw assetError;
      
      // Fetch liabilities
      const { data: liabilityData, error: liabilityError } = await supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', user.id);
        
      if (liabilityError) throw liabilityError;
      
      // Format asset data
      const formattedAssets = assetData.map(asset => ({
        id: asset.id,
        name: asset.name,
        value: asset.value.toString(),
        type: asset.type,
        description: asset.description || '',
      }));
      
      // Format liability data - We don't have description in the DB schema so we initialize it as empty
      const formattedLiabilities = liabilityData.map(liability => ({
        id: liability.id,
        name: liability.name,
        amount: liability.amount.toString(),
        type: liability.type,
        description: '', // Set to empty string as it's not in the DB
        interest_rate: liability.interest_rate,
        associated_asset_id: liability.associated_asset_id,
        ownership_percentage: liability.ownership_percentage
      }));
      
      setAssets(formattedAssets);
      setLiabilities(formattedLiabilities);
      
      toast.success('Data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Net Worth: 
            <span className={`ml-2 ${netWorth >= 0 ? 'text-monify-green-600' : 'text-red-600'}`}>
              ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Assets: ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | 
            Liabilities: ${totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleSaveAll}
            size="sm"
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            Save All
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Asset</CardTitle>
              <CardDescription>
                Record what you own to calculate your net worth.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="asset-name">Asset Name</Label>
                    <Input 
                      id="asset-name" 
                      placeholder="e.g., Checking Account"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asset-value">Value ($)</Label>
                    <Input 
                      id="asset-value" 
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={assetValue}
                      onChange={(e) => setAssetValue(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-type">Asset Type</Label>
                  <Select value={assetType} onValueChange={setAssetType}>
                    <SelectTrigger id="asset-type">
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash & Bank Accounts">Cash & Bank Accounts</SelectItem>
                      <SelectItem value="Investments">Investments</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Vehicles">Vehicles</SelectItem>
                      <SelectItem value="Personal Property">Personal Property</SelectItem>
                      <SelectItem value="Business Ownership">Business Ownership</SelectItem>
                      <SelectItem value="Retirement Accounts">Retirement Accounts</SelectItem>
                      <SelectItem value="Other Assets">Other Assets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-description">Description (Optional)</Label>
                  <Input 
                    id="asset-description" 
                    placeholder="Additional details about this asset"
                    value={assetDescription}
                    onChange={(e) => setAssetDescription(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={handleOpenAssetModal}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add in Modal
              </Button>
              <Button onClick={handleAddAsset}>
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
            </CardFooter>
          </Card>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Assets</h3>
            {isLoading ? (
              <div className="text-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>Loading your assets...</p>
              </div>
            ) : assets.filter(asset => !asset.isDeleted).length === 0 ? (
              <div className="text-center py-4 border rounded-lg">
                <p className="text-muted-foreground">You haven't added any assets yet.</p>
              </div>
            ) : (
              assets
                .filter(asset => !asset.isDeleted)
                .map(asset => (
                  <Card key={asset.id} className={asset.isNew ? 'border-monify-green-300' : asset.isModified ? 'border-amber-300' : ''}>
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{asset.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteAsset(asset.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSaveAsset(asset.id)}
                            disabled={!asset.isNew && !asset.isModified}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{asset.type}</CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`asset-name-${asset.id}`}>Asset Name</Label>
                            <Input 
                              id={`asset-name-${asset.id}`} 
                              value={asset.name}
                              onChange={(e) => handleUpdateAsset(asset.id, 'name', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`asset-value-${asset.id}`}>Value ($)</Label>
                            <Input 
                              id={`asset-value-${asset.id}`} 
                              type="number"
                              min="0"
                              step="0.01"
                              value={asset.value}
                              onChange={(e) => handleUpdateAsset(asset.id, 'value', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`asset-type-${asset.id}`}>Asset Type</Label>
                          <Select 
                            value={asset.type} 
                            onValueChange={(value) => handleUpdateAsset(asset.id, 'type', value)}
                          >
                            <SelectTrigger id={`asset-type-${asset.id}`}>
                              <SelectValue placeholder="Select asset type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cash & Bank Accounts">Cash & Bank Accounts</SelectItem>
                              <SelectItem value="Investments">Investments</SelectItem>
                              <SelectItem value="Real Estate">Real Estate</SelectItem>
                              <SelectItem value="Vehicles">Vehicles</SelectItem>
                              <SelectItem value="Personal Property">Personal Property</SelectItem>
                              <SelectItem value="Business Ownership">Business Ownership</SelectItem>
                              <SelectItem value="Retirement Accounts">Retirement Accounts</SelectItem>
                              <SelectItem value="Other Assets">Other Assets</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`asset-description-${asset.id}`}>Description</Label>
                          <Input 
                            id={`asset-description-${asset.id}`} 
                            value={asset.description || ''}
                            onChange={(e) => handleUpdateAsset(asset.id, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="liabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Liability</CardTitle>
              <CardDescription>
                Record what you owe to calculate your net worth.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="liability-name">Liability Name</Label>
                    <Input 
                      id="liability-name" 
                      placeholder="e.g., Mortgage"
                      value={liabilityName}
                      onChange={(e) => setLiabilityName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="liability-amount">Amount ($)</Label>
                    <Input 
                      id="liability-amount" 
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={liabilityAmount}
                      onChange={(e) => setLiabilityAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="liability-type">Liability Type</Label>
                  <Select value={liabilityType} onValueChange={setLiabilityType}>
                    <SelectTrigger id="liability-type">
                      <SelectValue placeholder="Select liability type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mortgage">Mortgage</SelectItem>
                      <SelectItem value="Auto Loan">Auto Loan</SelectItem>
                      <SelectItem value="Student Loan">Student Loan</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                      <SelectItem value="Medical Debt">Medical Debt</SelectItem>
                      <SelectItem value="Business Loan">Business Loan</SelectItem>
                      <SelectItem value="Tax Debt">Tax Debt</SelectItem>
                      <SelectItem value="Other Debt">Other Debt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="liability-description">Description (Optional)</Label>
                  <Input 
                    id="liability-description" 
                    placeholder="Additional details about this liability"
                    value={liabilityDescription}
                    onChange={(e) => setLiabilityDescription(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleAddLiability}>
                <Plus className="h-4 w-4 mr-2" />
                Add Liability
              </Button>
            </CardFooter>
          </Card>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Liabilities</h3>
            {isLoading ? (
              <div className="text-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>Loading your liabilities...</p>
              </div>
            ) : liabilities.filter(liability => !liability.isDeleted).length === 0 ? (
              <div className="text-center py-4 border rounded-lg">
                <p className="text-muted-foreground">You haven't added any liabilities yet.</p>
              </div>
            ) : (
              liabilities
                .filter(liability => !liability.isDeleted)
                .map(liability => (
                  <Card key={liability.id} className={liability.isNew ? 'border-monify-green-300' : liability.isModified ? 'border-amber-300' : ''}>
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{liability.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteLiability(liability.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSaveLiability(liability.id)}
                            disabled={!liability.isNew && !liability.isModified}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{liability.type}</CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`liability-name-${liability.id}`}>Liability Name</Label>
                            <Input 
                              id={`liability-name-${liability.id}`} 
                              value={liability.name}
                              onChange={(e) => handleUpdateLiability(liability.id, 'name', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`liability-amount-${liability.id}`}>Amount ($)</Label>
                            <Input 
                              id={`liability-amount-${liability.id}`} 
                              type="number"
                              min="0"
                              step="0.01"
                              value={liability.amount}
                              onChange={(e) => handleUpdateLiability(liability.id, 'amount', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`liability-type-${liability.id}`}>Liability Type</Label>
                          <Select 
                            value={liability.type} 
                            onValueChange={(value) => handleUpdateLiability(liability.id, 'type', value)}
                          >
                            <SelectTrigger id={`liability-type-${liability.id}`}>
                              <SelectValue placeholder="Select liability type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mortgage">Mortgage</SelectItem>
                              <SelectItem value="Auto Loan">Auto Loan</SelectItem>
                              <SelectItem value="Student Loan">Student Loan</SelectItem>
                              <SelectItem value="Credit Card">Credit Card</SelectItem>
                              <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                              <SelectItem value="Medical Debt">Medical Debt</SelectItem>
                              <SelectItem value="Business Loan">Business Loan</SelectItem>
                              <SelectItem value="Tax Debt">Tax Debt</SelectItem>
                              <SelectItem value="Other Debt">Other Debt</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`liability-description-${liability.id}`}>Description</Label>
                          <Input 
                            id={`liability-description-${liability.id}`} 
                            value={liability.description || ''}
                            onChange={(e) => handleUpdateLiability(liability.id, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Asset Creation Modal */}
      {isAssetModalOpen && user && (
        <AssetCreationModal 
          isOpen={isAssetModalOpen}
          onClose={() => setIsAssetModalOpen(false)}
          onAssetCreated={handleAssetCreated}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default AssetLiabilityForm;

