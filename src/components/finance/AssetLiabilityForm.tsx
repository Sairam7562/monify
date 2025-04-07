
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Edit, Trash2, DollarSign, Percent, Info, Calendar, Tag } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner';
import { useDatabase } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// Define asset types
const assetTypes = [
  { value: "cash", label: "Cash & Bank Accounts" },
  { value: "investment", label: "Investment Accounts" },
  { value: "real_estate", label: "Real Estate Property" },
  { value: "vehicle", label: "Vehicles" },
  { value: "business", label: "Business Ownership" },
  { value: "personal", label: "Personal Property" },
  { value: "retirement", label: "Retirement Accounts" },
  { value: "other", label: "Other Assets" }
];

// Define liability types
const liabilityTypes = [
  { value: "mortgage", label: "Mortgage Loans" },
  { value: "auto", label: "Auto Loans" },
  { value: "student", label: "Student Loans" },
  { value: "credit_card", label: "Credit Card Debt" },
  { value: "personal", label: "Personal Loans" },
  { value: "business", label: "Business Loans" },
  { value: "tax", label: "Tax Debt" },
  { value: "medical", label: "Medical Debt" },
  { value: "other", label: "Other Liabilities" }
];

// Define the schema for assets and liabilities
const assetLiabilitySchema = z.object({
  assets: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, { message: "Asset name is required." }),
      type: z.string().optional(),
      value: z.string().refine(value => !isNaN(parseFloat(value)), {
        message: "Value must be a number.",
      }),
      description: z.string().optional(),
      ownership_percentage: z.string().optional(),
      includeInNetWorth: z.boolean().default(true),
    })
  ),
  liabilities: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, { message: "Liability name is required." }),
      type: z.string().optional(),
      amount: z.string().refine(value => !isNaN(parseFloat(value)), {
        message: "Amount must be a number.",
      }),
      interest_rate: z.string().optional(),
      description: z.string().optional(),
      ownership_percentage: z.string().optional(),
      includeInNetWorth: z.boolean().default(true),
    })
  ),
});

type AssetLiabilityFormValues = z.infer<typeof assetLiabilitySchema>;

interface AssetLiabilityFormProps {
  persistDataOnTabChange?: boolean;
}

const AssetLiabilityForm: React.FC<AssetLiabilityFormProps> = ({ persistDataOnTabChange }) => {
  const { user } = useAuth();
  const { saveAssets, saveLiabilities, fetchAssets, fetchLiabilities } = useDatabase();
  const [assets, setAssets] = useState<AssetLiabilityFormValues["assets"]>([]);
  const [liabilities, setLiabilities] = useState<AssetLiabilityFormValues["liabilities"]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [type, setType] = useState<'asset' | 'liability'>('asset');
  const [activeTab, setActiveTab] = useState<'assets' | 'liabilities'>('assets');

  const assetLiabilityForm = useForm<AssetLiabilityFormValues>({
    resolver: zodResolver(assetLiabilitySchema),
    defaultValues: {
      assets: [{ name: '', value: '', includeInNetWorth: true }],
      liabilities: [{ name: '', amount: '', includeInNetWorth: true }],
    },
  });

  const { fields: assetFields, append: assetAppend, remove: assetRemove, update: assetUpdate } = useFieldArray({
    control: assetLiabilityForm.control,
    name: "assets"
  });

  const { fields: liabilityFields, append: liabilityAppend, remove: liabilityRemove, update: liabilityUpdate } = useFieldArray({
    control: assetLiabilityForm.control,
    name: "liabilities"
  });

  const userId = user?.id?.toString();

  // At the top of the file, add localStorage persistence logic to persist form state between tab changes

  // When initializing the form state in the component:
  useEffect(() => {
    if (persistDataOnTabChange && userId) {
      // Load saved form data from localStorage if available
      const savedData = localStorage.getItem(`asset_liability_form_${userId}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setAssets(parsedData.assets || []);
          setLiabilities(parsedData.liabilities || []);
          // If we have loaded data from localStorage, mark as not dirty
          // since we don't want to prompt for unsaved changes when it's already saved to localStorage
          setIsDirty(false);
        } catch (e) {
          console.error("Error parsing saved asset/liability data:", e);
        }
      }
    }
  }, [userId, persistDataOnTabChange]);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;

      try {
        const assetsData = await fetchAssets();
        const liabilitiesData = await fetchLiabilities();

        if (assetsData.data) {
          setAssets(assetsData.data);
        }

        if (liabilitiesData.data) {
          setLiabilities(liabilitiesData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load initial data.");
      }
    };

    loadInitialData();
  }, [user, fetchAssets, fetchLiabilities]);

  // When form values change:
  useEffect(() => {
    if (persistDataOnTabChange && userId && (assets.length > 0 || liabilities.length > 0)) {
      // Save to localStorage whenever the form data changes
      localStorage.setItem(`asset_liability_form_${userId}`, JSON.stringify({
        assets,
        liabilities,
        timestamp: new Date().toISOString()
      }));
    }
  }, [assets, liabilities, userId, persistDataOnTabChange]);

  const handleAddAsset = () => {
    setType('asset');
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleAddLiability = () => {
    setType('liability');
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEditAsset = (asset: any) => {
    setType('asset');
    setEditingItem(asset);
    setModalOpen(true);
  };

  const handleEditLiability = (liability: any) => {
    setType('liability');
    setEditingItem(liability);
    setModalOpen(true);
  };

  const handleDeleteAsset = (assetId: string) => {
    const updatedAssets = assets.filter(asset => asset.id !== assetId);
    handleSaveAssets(updatedAssets);
  };

  const handleDeleteLiability = (liabilityId: string) => {
    const updatedLiabilities = liabilities.filter(liability => liability.id !== liabilityId);
    handleSaveLiabilities(updatedLiabilities);
  };

  const handleSaveAsset = async (asset: any) => {
    const updatedAssets = editingItem
      ? assets.map(a => (a.id === editingItem.id ? asset : a))
      : [...assets, asset];
    handleSaveAssets(updatedAssets);
  };

  const handleSaveLiability = async (liability: any) => {
    const updatedLiabilities = editingItem
      ? liabilities.map(l => (l.id === editingItem.id ? liability : l))
      : [...liabilities, liability];
    handleSaveLiabilities(updatedLiabilities);
  };

  const handleSaveAssets = async (updatedAssets: any) => {
    if (!user) {
      toast.error("You must be logged in to save assets.");
      return;
    }

    try {
      const response = await saveAssets(updatedAssets);

      if (response.success) {
        toast.success(`${isEditing ? "Updated" : "Added"} ${type} successfully!`);

        // Close the modal and reset form
        setModalOpen(false);
        resetForm();

        // Also clear from localStorage since it's now saved to database
        if (persistDataOnTabChange && userId) {
          const savedData = localStorage.getItem(`asset_liability_form_${userId}`);
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              // Update saved data with the new state
              parsedData.assets = updatedAssets;
              localStorage.setItem(`asset_liability_form_${userId}`, JSON.stringify(parsedData));
            } catch (e) {
              console.error("Error updating saved asset/liability data:", e);
            }
          }
        }

        // Update the UI
        setIsDirty(false);
        setAssets(updatedAssets);
      } else {
        toast.error(response.error || "Failed to save asset.");
      }
    } catch (error) {
      console.error("Error saving asset:", error);
      toast.error("An error occurred while saving the asset.");
    }
  };

  const handleSaveLiabilities = async (updatedLiabilities: any) => {
    if (!user) {
      toast.error("You must be logged in to save liabilities.");
      return;
    }

    try {
      const response = await saveLiabilities(updatedLiabilities);

      if (response.success) {
        toast.success(`${isEditing ? "Updated" : "Added"} ${type} successfully!`);

        // Close the modal and reset form
        setModalOpen(false);
        resetForm();

        // Also clear from localStorage since it's now saved to database
        if (persistDataOnTabChange && userId) {
          const savedData = localStorage.getItem(`asset_liability_form_${userId}`);
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              // Update saved data with the new state
              parsedData.liabilities = updatedLiabilities;
              localStorage.setItem(`asset_liability_form_${userId}`, JSON.stringify(parsedData));
            } catch (e) {
              console.error("Error updating saved asset/liability data:", e);
            }
          }
        }

        // Update the UI
        setIsDirty(false);
        setLiabilities(updatedLiabilities);
      } else {
        toast.error(response.error || "Failed to save liability.");
      }
    } catch (error) {
      console.error("Error saving liability:", error);
      toast.error("An error occurred while saving the liability.");
    }
  };

  const handleSaveAll = async () => {
    if (!user) {
      toast.error("You must be logged in to save.");
      return;
    }

    try {
      const assetsResponse = await saveAssets(assets);
      const liabilitiesResponse = await saveLiabilities(liabilities);

      const allSuccessful = assetsResponse.success && liabilitiesResponse.success;

      if (allSuccessful) {
        toast.success("All items saved successfully!");
        setIsDirty(false);

        // Clear from localStorage since it's now saved to database
        if (persistDataOnTabChange && userId) {
          localStorage.removeItem(`asset_liability_form_${userId}`);
        }
      } else {
        // If not all were successful, update localStorage with current state
        if (persistDataOnTabChange && userId) {
          localStorage.setItem(`asset_liability_form_${userId}`, JSON.stringify({
            assets,
            liabilities,
            timestamp: new Date().toISOString()
          }));
        }
      }
    } catch (error) {
      console.error("Error saving all:", error);
      toast.error("An error occurred while saving all items.");
    }
  };

  const resetForm = () => {
    setEditingItem(null);
  };

  const isEditing = !!editingItem;

  const formatCurrency = (value: string | number) => {
    if (!value) return '$0.00';
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numberValue);
  };

  const getAssetTypeLabel = (typeValue: string) => {
    const assetType = assetTypes.find(type => type.value === typeValue);
    return assetType ? assetType.label : typeValue;
  };

  const getLiabilityTypeLabel = (typeValue: string) => {
    const liabilityType = liabilityTypes.find(type => type.value === typeValue);
    return liabilityType ? liabilityType.label : typeValue;
  };

  const totalAssetValue = assets.reduce((sum, asset) => {
    return sum + (parseFloat(asset.value) || 0);
  }, 0);

  const totalLiabilityAmount = liabilities.reduce((sum, liability) => {
    return sum + (parseFloat(liability.amount) || 0);
  }, 0);

  const AssetLiabilityModal = () => {
    const [name, setName] = useState(editingItem?.name || '');
    const [value, setValue] = useState(editingItem?.value || editingItem?.amount || '');
    const [assetType, setAssetType] = useState(editingItem?.type || '');
    const [description, setDescription] = useState(editingItem?.description || '');
    const [ownershipPercentage, setOwnershipPercentage] = useState(editingItem?.ownership_percentage || '100');
    const [interestRate, setInterestRate] = useState(editingItem?.interest_rate || '');
    const [includeInNetWorth, setIncludeInNetWorth] = useState(editingItem?.includeInNetWorth !== undefined ? editingItem.includeInNetWorth : true);

    const handleSave = () => {
      if (!name || !value) {
        toast.error("Please fill in all required fields.");
        return;
      }

      if (type === 'asset') {
        const newAsset = {
          id: editingItem?.id || Math.random().toString(36).substring(7),
          name,
          type: assetType,
          value,
          description,
          ownership_percentage: ownershipPercentage,
          includeInNetWorth,
        };
        handleSaveAsset(newAsset);
      } else {
        const newLiability = {
          id: editingItem?.id || Math.random().toString(36).substring(7),
          name,
          type: assetType, // Reusing assetType field for liability type
          amount: value,
          interest_rate: interestRate,
          description,
          ownership_percentage: ownershipPercentage,
          includeInNetWorth,
        };
        handleSaveLiability(newLiability);
      }
    };

    return (
      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
        <AlertDialogContent className="max-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{isEditing ? `Edit ${type}` : `Add ${type}`}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center">
                  Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={type === 'asset' ? "Home, Car, 401(k), etc." : "Mortgage, Car Loan, etc."} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value" className="flex items-center">
                  {type === 'asset' ? 'Value' : 'Amount'} <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input 
                    id="value" 
                    value={value} 
                    onChange={(e) => setValue(e.target.value)} 
                    placeholder="0.00" 
                    className="pl-8" 
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={assetType} onValueChange={setAssetType}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${type} type`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(type === 'asset' ? assetTypes : liabilityTypes).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownershipPercentage">Ownership Percentage</Label>
                <div className="relative">
                  <Input 
                    id="ownershipPercentage" 
                    value={ownershipPercentage} 
                    onChange={(e) => setOwnershipPercentage(e.target.value)} 
                    type="number" 
                    min="0" 
                    max="100" 
                    className="pr-8"
                  />
                  <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                </div>
              </div>
            </div>
            
            {type === 'liability' && (
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate</Label>
                <div className="relative">
                  <Input 
                    id="interestRate" 
                    value={interestRate} 
                    onChange={(e) => setInterestRate(e.target.value)} 
                    type="number" 
                    step="0.01"
                    min="0" 
                    max="100" 
                    className="pr-8"
                    placeholder="0.00"
                  />
                  <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Add any additional details"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="include" checked={includeInNetWorth} onCheckedChange={(checked) => setIncludeInNetWorth(checked)} />
              <Label htmlFor="include" className="font-normal text-sm">
                Include in Net Worth Calculation
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Toggle this to include or exclude this item from your net worth calculations.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setModalOpen(false);
              resetForm();
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave} className="bg-monify-purple-500 hover:bg-monify-purple-600">{isEditing ? 'Update' : 'Save'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <Button
          variant={activeTab === 'assets' ? "default" : "outline"}
          onClick={() => setActiveTab('assets')}
          className={`flex-1 ${activeTab === 'assets' ? 'bg-monify-purple-500 hover:bg-monify-purple-600' : ''}`}
        >
          Assets ({assets.length})
        </Button>
        <Button
          variant={activeTab === 'liabilities' ? "default" : "outline"}
          onClick={() => setActiveTab('liabilities')}
          className={`flex-1 ${activeTab === 'liabilities' ? 'bg-monify-purple-500 hover:bg-monify-purple-600' : ''}`}
        >
          Liabilities ({liabilities.length})
        </Button>
      </div>

      {/* Assets Section */}
      {activeTab === 'assets' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Assets</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                Total: {formatCurrency(totalAssetValue)}
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Assets are things you own that have value, like property, investments, or cash.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assets.length === 0 ? (
                <div className="border border-dashed rounded-md p-6 text-center text-gray-500">
                  <h3 className="font-medium">No Assets Added Yet</h3>
                  <p className="text-sm mt-2">Add your first asset to start tracking your net worth</p>
                </div>
              ) : (
                assets.map((asset) => (
                  <div key={asset.id} className="flex flex-col md:flex-row md:items-center justify-between border rounded-md p-4 hover:bg-gray-50 transition-colors">
                    <div className="space-y-1 mb-3 md:mb-0">
                      <div className="flex items-center">
                        <h3 className="font-medium">{asset.name}</h3>
                        {asset.type && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {getAssetTypeLabel(asset.type)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-monify-purple-600 font-semibold">{formatCurrency(asset.value)}</p>
                      {asset.description && (
                        <p className="text-sm text-gray-500">{asset.description}</p>
                      )}
                      {asset.ownership_percentage && asset.ownership_percentage !== '100' && (
                        <p className="text-xs text-gray-500">Ownership: {asset.ownership_percentage}%</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditAsset(asset)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-red-200 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{asset.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteAsset(asset.id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}
              
              <Button onClick={handleAddAsset} className="w-full bg-monify-purple-500 hover:bg-monify-purple-600">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liabilities Section */}
      {activeTab === 'liabilities' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Liabilities</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                Total: {formatCurrency(totalLiabilityAmount)}
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Liabilities are debts or obligations you owe to others, like loans or credit card balances.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {liabilities.length === 0 ? (
                <div className="border border-dashed rounded-md p-6 text-center text-gray-500">
                  <h3 className="font-medium">No Liabilities Added Yet</h3>
                  <p className="text-sm mt-2">Add your liabilities to calculate your true net worth</p>
                </div>
              ) : (
                liabilities.map((liability) => (
                  <div key={liability.id} className="flex flex-col md:flex-row md:items-center justify-between border rounded-md p-4 hover:bg-gray-50 transition-colors">
                    <div className="space-y-1 mb-3 md:mb-0">
                      <div className="flex items-center">
                        <h3 className="font-medium">{liability.name}</h3>
                        {liability.type && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {getLiabilityTypeLabel(liability.type)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-red-600 font-semibold">{formatCurrency(liability.amount)}</p>
                      {liability.description && (
                        <p className="text-sm text-gray-500">{liability.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-1">
                        {liability.interest_rate && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            Interest: {liability.interest_rate}%
                          </span>
                        )}
                        {liability.ownership_percentage && liability.ownership_percentage !== '100' && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            Ownership: {liability.ownership_percentage}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditLiability(liability)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-red-200 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Liability</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{liability.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteLiability(liability.id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}
              
              <Button onClick={handleAddLiability} className="w-full bg-monify-purple-500 hover:bg-monify-purple-600">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Liability
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Net Worth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-white rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Total Assets</p>
                <p className="text-xl font-bold text-monify-purple-600">{formatCurrency(totalAssetValue)}</p>
              </div>
              <div className="p-4 bg-white rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Total Liabilities</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalLiabilityAmount)}</p>
              </div>
              <div className="p-4 bg-monify-purple-50 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Net Worth</p>
                <p className={`text-xl font-bold ${totalAssetValue - totalLiabilityAmount >= 0 ? 'text-monify-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalAssetValue - totalLiabilityAmount)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveAll} disabled={!isDirty} className="w-full bg-monify-purple-500 hover:bg-monify-purple-600">
            Save All Changes
          </Button>
        </CardFooter>
      </Card>

      <AssetLiabilityModal />
    </div>
  );
};

export default AssetLiabilityForm;
