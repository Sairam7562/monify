
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';
import { useDatabase } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';

// Define the schema for assets and liabilities
const assetLiabilitySchema = z.object({
  assets: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, { message: "Asset name is required." }),
      value: z.string().refine(value => !isNaN(parseFloat(value)), {
        message: "Value must be a number.",
      }),
      includeInNetWorth: z.boolean().default(true),
    })
  ),
  liabilities: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, { message: "Liability name is required." }),
      amount: z.string().refine(value => !isNaN(parseFloat(value)), {
        message: "Amount must be a number.",
      }),
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

  const AssetLiabilityModal = () => {
    const [name, setName] = useState(editingItem?.name || '');
    const [value, setValue] = useState(editingItem?.value || editingItem?.amount || '');
    const [includeInNetWorth, setIncludeInNetWorth] = useState(editingItem?.includeInNetWorth !== undefined ? editingItem.includeInNetWorth : true);

    const handleSave = () => {
      if (!name || !value) {
        toast.error("Please fill in all fields.");
        return;
      }

      const newItem = {
        id: editingItem?.id || Math.random().toString(36).substring(7),
        name,
        value: type === 'asset' ? value : undefined,
        amount: type === 'liability' ? value : undefined,
        includeInNetWorth,
      };

      if (type === 'asset') {
        handleSaveAsset(newItem);
      } else {
        handleSaveLiability(newItem);
      }
    };

    return (
      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isEditing ? `Edit ${type}` : `Add ${type}`}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} className="col-span-3" onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Value
              </Label>
              <Input id="value" value={value} className="col-span-3" onChange={(e) => setValue(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="include" className="text-right">
                Include in Net Worth
              </Label>
              <Switch id="include" checked={includeInNetWorth} onCheckedChange={(checked) => setIncludeInNetWorth(checked)} />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setModalOpen(false);
              resetForm();
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>{isEditing ? 'Update' : 'Save'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between border rounded-md p-4">
                <div>
                  <p className="font-medium">{asset.name}</p>
                  <p className="text-sm text-gray-500">${asset.value}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditAsset(asset)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the asset from your account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteAsset(asset.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            <Button variant="secondary" onClick={handleAddAsset} className="w-full">
              Add Asset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {liabilities.map((liability) => (
              <div key={liability.id} className="flex items-center justify-between border rounded-md p-4">
                <div>
                  <p className="font-medium">{liability.name}</p>
                  <p className="text-sm text-gray-500">${liability.amount}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditLiability(liability)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the liability from your account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteLiability(liability.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            <Button variant="secondary" onClick={handleAddLiability} className="w-full">
              Add Liability
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveAll} disabled={!isDirty} className="w-full">
        Save All
      </Button>

      <AssetLiabilityModal />
    </div>
  );
};

export default AssetLiabilityForm;
