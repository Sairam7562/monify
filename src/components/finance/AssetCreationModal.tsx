
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AssetCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetCreated: () => void;
  userId: string;
}

const assetTypes = [
  "Cash & Bank Accounts",
  "Investments",
  "Real Estate",
  "Vehicles",
  "Personal Property",
  "Business Ownership",
  "Retirement Accounts",
  "Other Assets"
];

const AssetCreationModal: React.FC<AssetCreationModalProps> = ({ 
  isOpen, 
  onClose,
  onAssetCreated,
  userId
}) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState(assetTypes[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !value || !type) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Try saving to Supabase first
      const numericValue = parseFloat(value);
      
      const { data, error } = await supabase
        .from('assets')
        .insert([
          { 
            name,
            value: numericValue,
            type,
            description: description || null,
            user_id: userId
          }
        ]);
      
      if (error) {
        console.error("Error saving asset to database:", error);
        
        // If failed, save to localStorage as backup
        const localAssets = JSON.parse(localStorage.getItem('local_assets') || '[]');
        localAssets.push({
          id: `local-${Date.now()}`,
          name,
          value: numericValue,
          type,
          description: description || null,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        localStorage.setItem('local_assets', JSON.stringify(localAssets));
        
        toast.info("Asset saved locally due to connection issues");
      } else {
        toast.success("Asset created successfully!");
      }
      
      // Reset form
      setName('');
      setValue('');
      setType(assetTypes[0]);
      setDescription('');
      
      // Notify parent component
      onAssetCreated();
      onClose();
    } catch (error) {
      console.error("Error creating asset:", error);
      toast.error("Failed to create asset. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Checking Account, Home, Car"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Value ($) *</Label>
                <Input
                  id="value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Asset Type *</Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details about this asset"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-monify-purple-500 hover:bg-monify-purple-600"
            >
              {isSubmitting ? "Saving..." : "Save Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssetCreationModal;
