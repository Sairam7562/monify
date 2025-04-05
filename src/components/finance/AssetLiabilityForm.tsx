
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useDatabase } from '@/hooks/useDatabase';
import { Spinner } from '@/components/ui/spinner';

interface Asset {
  id: number;
  name: string;
  type: string;
  value: string;
  ownershipPercentage?: string;
  address?: string;
  description?: string;
  saved?: boolean;
}

interface Liability {
  id: number;
  name: string;
  type: string;
  amount: string;
  interestRate: string;
  ownershipPercentage?: string;
  associatedAssetId?: number; // To link liabilities to specific assets
  saved?: boolean;
}

interface AssetLiabilityFormProps {
  persistDataOnTabChange?: boolean;
}

const TEMPORARY_STORAGE_KEY = 'temp_asset_liability_form_data';

const AssetLiabilityForm = ({ persistDataOnTabChange = false }: AssetLiabilityFormProps) => {
  const { user } = useAuth();
  const { 
    saveAssets, 
    saveLiabilities, 
    fetchAssets, 
    fetchLiabilities,
    loading 
  } = useDatabase();
  
  const [assets, setAssets] = useState<Asset[]>([
    { id: 1, name: '', type: 'cash', value: '', saved: false },
  ]);
  
  const [liabilities, setLiabilities] = useState<Liability[]>([
    { id: 1, name: '', type: 'credit_card', amount: '', interestRate: '', saved: false },
  ]);

  const [activeTab, setActiveTab] = useState<string>("assets");
  const [isSavingAsset, setIsSavingAsset] = useState<{[key: number]: boolean}>({});
  const [isSavingLiability, setIsSavingLiability] = useState<{[key: number]: boolean}>({});
  const [calculatedAssetValue, setCalculatedAssetValue] = useState<{[key: number]: string}>({});
  const [calculatedLiabilityAmount, setCalculatedLiabilityAmount] = useState<{[key: number]: string}>({});
  const [formLoading, setFormLoading] = useState(true);
  const [allDataSaved, setAllDataSaved] = useState(false);

  // Load existing data on component mount
  useEffect(() => {
    loadExistingData();
    
    // Check for temporarily stored data (for tab switching persistence)
    const tempData = localStorage.getItem(TEMPORARY_STORAGE_KEY);
    if (tempData && persistDataOnTabChange) {
      try {
        const parsedData = JSON.parse(tempData);
        if (parsedData.assets && parsedData.assets.length > 0) {
          setAssets(parsedData.assets);
        }
        if (parsedData.liabilities && parsedData.liabilities.length > 0) {
          setLiabilities(parsedData.liabilities);
        }
        localStorage.removeItem(TEMPORARY_STORAGE_KEY);
      } catch (error) {
        console.error("Error parsing temporary stored form data:", error);
      }
    }
    
    // Save form data when user navigates away from page
    const handleBeforeUnload = () => {
      if (persistDataOnTabChange) {
        localStorage.setItem(TEMPORARY_STORAGE_KEY, JSON.stringify({ 
          assets,
          liabilities,
          timestamp: new Date().toISOString()
        }));
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  // Save form data when tab changes
  const handleTabChange = (value: string) => {
    if (persistDataOnTabChange) {
      // Store the current state before changing tabs to prevent data loss
      localStorage.setItem(TEMPORARY_STORAGE_KEY, JSON.stringify({ 
        assets,
        liabilities,
        lastTab: activeTab,
        timestamp: new Date().toISOString()
      }));
    }
    setActiveTab(value);
  };

  const loadExistingData = async () => {
    if (!user) return;
    
    setFormLoading(true);
    try {
      const assetsResult = await fetchAssets();
      if (assetsResult.data && assetsResult.data.length > 0) {
        const formattedAssets = assetsResult.data.map((asset: any, index: number) => ({
          id: index + 1,
          name: asset.name,
          type: asset.type,
          value: asset.value.toString(),
          ownershipPercentage: asset.ownership_percentage?.toString(),
          description: asset.description,
          saved: true
        }));
        setAssets(formattedAssets);
      }

      const liabilitiesResult = await fetchLiabilities();
      if (liabilitiesResult.data && liabilitiesResult.data.length > 0) {
        const formattedLiabilities = liabilitiesResult.data.map((liability: any, index: number) => ({
          id: index + 1,
          name: liability.name,
          type: liability.type,
          amount: liability.amount.toString(),
          interestRate: liability.interest_rate?.toString() || '0',
          ownershipPercentage: liability.ownership_percentage?.toString(),
          associatedAssetId: liability.associated_asset_id ? parseInt(liability.associated_asset_id) : undefined,
          saved: true
        }));
        setLiabilities(formattedLiabilities);
      }
      
      setAllDataSaved(true);
    } catch (error) {
      console.error("Error loading existing data:", error);
      toast.error("Failed to load your existing financial data");
    } finally {
      setFormLoading(false);
    }
  };

  useEffect(() => {
    const calculated: {[key: number]: string} = {};
    
    assets.forEach(asset => {
      if (asset.type === 'real_estate' || asset.type === 'business') {
        const value = parseFloat(asset.value) || 0;
        const percentage = parseFloat(asset.ownershipPercentage || '100') / 100;
        calculated[asset.id] = (value * percentage).toFixed(2);
      } else {
        calculated[asset.id] = asset.value;
      }
    });
    
    setCalculatedAssetValue(calculated);
    
    // Automatically save to temporary storage when assets change
    if (persistDataOnTabChange && assets.length > 0) {
      localStorage.setItem(TEMPORARY_STORAGE_KEY, JSON.stringify({ 
        assets,
        liabilities,
        lastTab: activeTab,
        timestamp: new Date().toISOString()
      }));
    }
  }, [assets]);

  useEffect(() => {
    const calculated: {[key: number]: string} = {};
    
    liabilities.forEach(liability => {
      if (liability.type === 'mortgage' || liability.type === 'business_loan' || liability.type === 'real_estate') {
        const amount = parseFloat(liability.amount) || 0;
        const percentage = parseFloat(liability.ownershipPercentage || '100') / 100;
        calculated[liability.id] = (amount * percentage).toFixed(2);
      } else {
        calculated[liability.id] = liability.amount;
      }
    });
    
    setCalculatedLiabilityAmount(calculated);
    
    // Automatically save to temporary storage when liabilities change
    if (persistDataOnTabChange && liabilities.length > 0) {
      localStorage.setItem(TEMPORARY_STORAGE_KEY, JSON.stringify({ 
        assets,
        liabilities,
        lastTab: activeTab,
        timestamp: new Date().toISOString()
      }));
    }
  }, [liabilities]);

  useEffect(() => {
    const allAssetsSaved = assets.every(asset => asset.saved);
    const allLiabilitiesSaved = liabilities.every(liability => liability.saved);
    setAllDataSaved(allAssetsSaved && allLiabilitiesSaved);
  }, [assets, liabilities]);

  const addAsset = () => {
    const newId = assets.length > 0 ? Math.max(...assets.map(a => a.id)) + 1 : 1;
    setAssets([...assets, { id: newId, name: '', type: 'cash', value: '', saved: false }]);
    setAllDataSaved(false);
  };

  const removeAsset = (id: number) => {
    if (assets.length > 1) {
      setAssets(assets.filter(asset => asset.id !== id));
      setLiabilities(liabilities.filter(liability => liability.associatedAssetId !== id));
      setAllDataSaved(false);
    }
  };

  const updateAsset = (id: number, field: keyof Asset, value: string) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, [field]: value, saved: false } : asset
    ));
    
    if (field === 'type' && (value === 'real_estate' || value === 'business')) {
      setAssets(assets.map(asset => 
        asset.id === id ? { 
          ...asset, 
          [field]: value,
          ownershipPercentage: asset.ownershipPercentage || '100',
          description: asset.description || '',
          saved: false
        } : asset
      ));
    }
    
    setAllDataSaved(false);
  };

  const saveAsset = async (id: number) => {
    if (!user) {
      toast.error("You must be logged in to save financial information");
      return;
    }
    
    setIsSavingAsset(prev => ({ ...prev, [id]: true }));
    
    try {
      console.log("Saving asset with ID:", id);
      const assetToSave = assets.find(asset => asset.id === id);
      if (!assetToSave) {
        throw new Error("Asset not found");
      }
      
      if (!assetToSave.name.trim()) {
        toast.error("Asset name is required");
        setIsSavingAsset(prev => ({ ...prev, [id]: false }));
        return;
      }
      
      if (!assetToSave.value || isNaN(Number(assetToSave.value))) {
        toast.error("Please enter a valid asset value");
        setIsSavingAsset(prev => ({ ...prev, [id]: false }));
        return;
      }
      
      const backupKey = `asset_backup_${id}_${user.id}`;
      localStorage.setItem(backupKey, JSON.stringify(assetToSave));
      
      // Also save to financial statements data for persistence
      const financialStatementsData = JSON.parse(localStorage.getItem('financial_statements_data') || '{}');
      if (!financialStatementsData.assets) {
        financialStatementsData.assets = [];
      }
      
      // Update or add this asset to financial statements data
      const existingIndex = financialStatementsData.assets.findIndex((a: any) => a.id === assetToSave.id);
      if (existingIndex >= 0) {
        financialStatementsData.assets[existingIndex] = assetToSave;
      } else {
        financialStatementsData.assets.push(assetToSave);
      }
      
      localStorage.setItem('financial_statements_data', JSON.stringify(financialStatementsData));
      
      const result = await saveAssets([assetToSave]);
      
      if (result.error) {
        console.error("Error from saveAssets:", result.error);
        throw new Error(result.error);
      }
      
      setAssets(prevAssets => 
        prevAssets.map(asset => 
          asset.id === id ? { ...asset, saved: true } : asset
        )
      );
      
      toast.success(`Asset "${assetToSave.name || 'Unnamed Asset'}" saved successfully!`);
    } catch (error) {
      console.error("Error saving asset:", error);
      toast.error("Failed to save asset. Please try again or refresh the page.");
    } finally {
      setIsSavingAsset(prev => ({ ...prev, [id]: false }));
    }
  };

  const addLiability = () => {
    const newId = liabilities.length > 0 ? Math.max(...liabilities.map(l => l.id)) + 1 : 1;
    setLiabilities([...liabilities, { id: newId, name: '', type: 'credit_card', amount: '', interestRate: '', saved: false }]);
    setAllDataSaved(false);
  };

  const removeLiability = (id: number) => {
    if (liabilities.length > 1) {
      setLiabilities(liabilities.filter(liability => liability.id !== id));
      setAllDataSaved(false);
    }
  };

  const updateLiability = (id: number, field: keyof Liability, value: string | number) => {
    setLiabilities(liabilities.map(liability => 
      liability.id === id ? { ...liability, [field]: value, saved: false } : liability
    ));

    if (field === 'type' && (value === 'real_estate' || value === 'mortgage' || value === 'business_loan')) {
      setLiabilities(liabilities.map(liability => 
        liability.id === id ? { 
          ...liability, 
          [field]: value as string,
          ownershipPercentage: liability.ownershipPercentage || '100',
          saved: false
        } : liability
      ));
    }
    
    setAllDataSaved(false);
  };

  const saveLiability = async (id: number) => {
    if (!user) {
      toast.error("You must be logged in to save financial information");
      return;
    }
    
    setIsSavingLiability(prev => ({ ...prev, [id]: true }));
    
    try {
      console.log("Saving liability with ID:", id);
      const liabilityToSave = liabilities.find(liability => liability.id === id);
      if (!liabilityToSave) {
        throw new Error("Liability not found");
      }
      
      if (!liabilityToSave.name.trim()) {
        toast.error("Liability name is required");
        setIsSavingLiability(prev => ({ ...prev, [id]: false }));
        return;
      }
      
      if (!liabilityToSave.amount || isNaN(Number(liabilityToSave.amount))) {
        toast.error("Please enter a valid liability amount");
        setIsSavingLiability(prev => ({ ...prev, [id]: false }));
        return;
      }
      
      const backupKey = `liability_backup_${id}_${user.id}`;
      localStorage.setItem(backupKey, JSON.stringify(liabilityToSave));
      
      // Also save to financial statements data for persistence
      const financialStatementsData = JSON.parse(localStorage.getItem('financial_statements_data') || '{}');
      if (!financialStatementsData.liabilities) {
        financialStatementsData.liabilities = [];
      }
      
      // Update or add this liability to financial statements data
      const existingIndex = financialStatementsData.liabilities.findIndex((l: any) => l.id === liabilityToSave.id);
      if (existingIndex >= 0) {
        financialStatementsData.liabilities[existingIndex] = liabilityToSave;
      } else {
        financialStatementsData.liabilities.push(liabilityToSave);
      }
      
      localStorage.setItem('financial_statements_data', JSON.stringify(financialStatementsData));
      
      const result = await saveLiabilities([liabilityToSave]);
      
      if (result.error) {
        console.error("Error from saveLiabilities:", result.error);
        throw new Error(result.error);
      }
      
      setLiabilities(prevLiabilities => 
        prevLiabilities.map(liability => 
          liability.id === id ? { ...liability, saved: true } : liability
        )
      );
      
      toast.success(`Liability "${liabilityToSave.name || 'Unnamed Liability'}" saved successfully!`);
    } catch (error) {
      console.error("Error saving liability:", error);
      toast.error("Failed to save liability. Please try again or refresh the page.");
    } finally {
      setIsSavingLiability(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to save financial information");
      return;
    }
    
    const hasEmptyAssets = assets.some(asset => !asset.name.trim() || !asset.value);
    const hasEmptyLiabilities = liabilities.some(liability => !liability.name.trim() || !liability.amount);
    
    if (hasEmptyAssets || hasEmptyLiabilities) {
      toast.error("Please complete all required fields before saving");
      return;
    }
    
    try {
      setAllDataSaved(false);
      
      console.log("Saving all assets and liabilities");
      
      // Save to financial statements data for persistence and cross-component usage
      const financialStatementsData = JSON.parse(localStorage.getItem('financial_statements_data') || '{}');
      financialStatementsData.assets = assets;
      financialStatementsData.liabilities = liabilities;
      financialStatementsData.lastUpdated = new Date().toISOString();
      localStorage.setItem('financial_statements_data', JSON.stringify(financialStatementsData));
      
      const assetsResult = await saveAssets(assets);
      const liabilitiesResult = await saveLiabilities(liabilities);
      
      if (assetsResult.error || liabilitiesResult.error) {
        if (assetsResult.error) console.error("Assets save error:", assetsResult.error);
        if (liabilitiesResult.error) console.error("Liabilities save error:", liabilitiesResult.error);
        
        if (assetsResult.localSaved || liabilitiesResult.localSaved) {
          toast.info("Data saved locally and will be synced when connection is restored");
        } else {
          throw new Error(assetsResult.error || liabilitiesResult.error);
        }
      } else {
        setAssets(prevAssets => prevAssets.map(asset => ({ ...asset, saved: true })));
        setLiabilities(prevLiabilities => prevLiabilities.map(liability => ({ ...liability, saved: true })));
        setAllDataSaved(true);
        
        toast.success("All financial information saved successfully!");
      }
    } catch (error: any) {
      console.error("Error saving financial data:", error);
      toast.error("Failed to save all financial information. Please try again.");
    }
  };

  const getAssetOptions = () => {
    const options = assets.filter(asset => 
      asset.type === 'real_estate' || asset.type === 'business'
    ).map(asset => ({
      id: asset.id,
      name: asset.name || (asset.type === 'real_estate' ? 'Real Estate Property' : 'Business') + ` #${asset.id}`
    }));
    
    return [{ id: 0, name: 'None (General Liability)' }, ...options];
  };

  if (formLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" />
        <span className="ml-2">Loading your financial data...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="assets" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assets" className="space-y-4 mt-4">
          <div className="space-y-4">
            {assets.map((asset, index) => (
              <div key={asset.id} className="p-4 border rounded-lg bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Asset #{index + 1}</h4>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => saveAsset(asset.id)}
                      disabled={isSavingAsset[asset.id]}
                      className={asset.saved ? "bg-green-50 border-green-200 text-green-700" : ""}
                    >
                      {isSavingAsset[asset.id] ? <Spinner size="sm" className="mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                      {asset.saved ? "Saved" : "Save Asset"}
                    </Button>
                    {assets.length > 1 && (
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeAsset(asset.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`asset-name-${asset.id}`}>Asset Name</Label>
                      <Input
                        id={`asset-name-${asset.id}`}
                        value={asset.name}
                        onChange={(e) => updateAsset(asset.id, 'name', e.target.value)}
                        placeholder="e.g., Checking Account"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`asset-type-${asset.id}`}>Asset Type</Label>
                      <Select 
                        value={asset.type} 
                        onValueChange={(value) => updateAsset(asset.id, 'type', value)}
                      >
                        <SelectTrigger id={`asset-type-${asset.id}`}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash & Bank Accounts</SelectItem>
                          <SelectItem value="investment">Investments</SelectItem>
                          <SelectItem value="real_estate">Real Estate</SelectItem>
                          <SelectItem value="vehicle">Vehicles</SelectItem>
                          <SelectItem value="business">Business Ownership</SelectItem>
                          <SelectItem value="personal">Personal Property</SelectItem>
                          <SelectItem value="other">Other Assets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {(asset.type === 'real_estate' || asset.type === 'business') && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`asset-description-${asset.id}`}>
                          {asset.type === 'real_estate' ? 'Property Address' : 'Business Description'}
                        </Label>
                        <Input
                          id={`asset-description-${asset.id}`}
                          value={asset.description || ''}
                          onChange={(e) => updateAsset(asset.id, 'description', e.target.value)}
                          placeholder={asset.type === 'real_estate' ? 
                            "123 Main Street, City, State, ZIP" : 
                            "Description of business"}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`asset-value-${asset.id}`}>Total Value ($)</Label>
                          <Input
                            id={`asset-value-${asset.id}`}
                            type="number"
                            value={asset.value}
                            onChange={(e) => updateAsset(asset.id, 'value', e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`asset-ownership-${asset.id}`}>Ownership Percentage (%)</Label>
                          <Input
                            id={`asset-ownership-${asset.id}`}
                            type="number"
                            value={asset.ownershipPercentage || '100'}
                            onChange={(e) => updateAsset(asset.id, 'ownershipPercentage', e.target.value)}
                            placeholder="100"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </div>
                      </div>
                      
                      {calculatedAssetValue[asset.id] && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-500">Your portion based on ownership percentage:</p>
                          <p className="font-medium text-lg">${parseFloat(calculatedAssetValue[asset.id]).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {asset.type !== 'real_estate' && asset.type !== 'business' && (
                    <div className="space-y-2">
                      <Label htmlFor={`asset-value-${asset.id}`}>Current Value ($)</Label>
                      <Input
                        id={`asset-value-${asset.id}`}
                        type="number"
                        value={asset.value}
                        onChange={(e) => updateAsset(asset.id, 'value', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={addAsset} className="w-full">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Another Asset
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="liabilities" className="space-y-4 mt-4">
          <div className="space-y-4">
            {liabilities.map((liability, index) => (
              <div key={liability.id} className="p-4 border rounded-lg bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Liability #{index + 1}</h4>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => saveLiability(liability.id)}
                      disabled={isSavingLiability[liability.id]}
                      className={liability.saved ? "bg-green-50 border-green-200 text-green-700" : ""}
                    >
                      {isSavingLiability[liability.id] ? <Spinner size="sm" className="mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                      {liability.saved ? "Saved" : "Save Liability"}
                    </Button>
                    {liabilities.length > 1 && (
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeLiability(liability.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`liability-name-${liability.id}`}>Liability Name</Label>
                      <Input
                        id={`liability-name-${liability.id}`}
                        value={liability.name}
                        onChange={(e) => updateLiability(liability.id, 'name', e.target.value)}
                        placeholder="e.g., Credit Card"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`liability-type-${liability.id}`}>Liability Type</Label>
                      <Select 
                        value={liability.type} 
                        onValueChange={(value) => updateLiability(liability.id, 'type', value)}
                      >
                        <SelectTrigger id={`liability-type-${liability.id}`}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="mortgage">Mortgage</SelectItem>
                          <SelectItem value="loan">Personal Loan</SelectItem>
                          <SelectItem value="student_loan">Student Loan</SelectItem>
                          <SelectItem value="auto_loan">Auto Loan</SelectItem>
                          <SelectItem value="real_estate">Real Estate Liability</SelectItem>
                          <SelectItem value="business_loan">Business Loan</SelectItem>
                          <SelectItem value="tax">Tax Debt</SelectItem>
                          <SelectItem value="other">Other Debt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {(liability.type === 'mortgage' || liability.type === 'business_loan' || liability.type === 'real_estate') && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`liability-asset-${liability.id}`}>Associated Asset</Label>
                        <Select 
                          value={liability.associatedAssetId?.toString() || "0"} 
                          onValueChange={(value) => updateLiability(liability.id, 'associatedAssetId', parseInt(value))}
                        >
                          <SelectTrigger id={`liability-asset-${liability.id}`}>
                            <SelectValue placeholder="Select associated asset" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAssetOptions().map(option => (
                              <SelectItem key={option.id} value={option.id.toString()}>{option.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`liability-ownership-${liability.id}`}>Ownership Percentage (%)</Label>
                        <Input
                          id={`liability-ownership-${liability.id}`}
                          type="number"
                          value={liability.ownershipPercentage || '100'}
                          onChange={(e) => updateLiability(liability.id, 'ownershipPercentage', e.target.value)}
                          placeholder="100"
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`liability-amount-${liability.id}`}>Outstanding Amount ($)</Label>
                      <Input
                        id={`liability-amount-${liability.id}`}
                        type="number"
                        value={liability.amount}
                        onChange={(e) => updateLiability(liability.id, 'amount', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`liability-interest-${liability.id}`}>Interest Rate (%)</Label>
                      <Input
                        id={`liability-interest-${liability.id}`}
                        type="number"
                        value={liability.interestRate}
                        onChange={(e) => updateLiability(liability.id, 'interestRate', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  {(liability.type === 'mortgage' || liability.type === 'business_loan' || liability.type === 'real_estate') && 
                    calculatedLiabilityAmount[liability.id] && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500">Your portion based on ownership percentage:</p>
                      <p className="font-medium text-lg">${parseFloat(calculatedLiabilityAmount[liability.id]).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={addLiability} className="w-full">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Another Liability
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6">
        <Button 
          type="submit" 
          className="w-full bg-navido-blue-500 hover:bg-navido-blue-600"
          disabled={loading || allDataSaved}
        >
          {loading ? "Saving..." : allDataSaved ? "All Data Saved" : "Save All Financial Information"}
        </Button>
      </div>
    </form>
  );
};

export default AssetLiabilityForm;
