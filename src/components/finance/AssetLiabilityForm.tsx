
import React, { useState } from 'react';
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
import { PlusCircle, Trash2 } from 'lucide-react';

interface Asset {
  id: number;
  name: string;
  type: string;
  value: string;
}

interface Liability {
  id: number;
  name: string;
  type: string;
  amount: string;
  interestRate: string;
}

const AssetLiabilityForm = () => {
  const [assets, setAssets] = useState<Asset[]>([
    { id: 1, name: '', type: 'cash', value: '' },
  ]);
  
  const [liabilities, setLiabilities] = useState<Liability[]>([
    { id: 1, name: '', type: 'credit_card', amount: '', interestRate: '' },
  ]);

  const addAsset = () => {
    const newId = assets.length > 0 ? Math.max(...assets.map(a => a.id)) + 1 : 1;
    setAssets([...assets, { id: newId, name: '', type: 'cash', value: '' }]);
  };

  const removeAsset = (id: number) => {
    if (assets.length > 1) {
      setAssets(assets.filter(asset => asset.id !== id));
    }
  };

  const updateAsset = (id: number, field: keyof Asset, value: string) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, [field]: value } : asset
    ));
  };

  const addLiability = () => {
    const newId = liabilities.length > 0 ? Math.max(...liabilities.map(l => l.id)) + 1 : 1;
    setLiabilities([...liabilities, { id: newId, name: '', type: 'credit_card', amount: '', interestRate: '' }]);
  };

  const removeLiability = (id: number) => {
    if (liabilities.length > 1) {
      setLiabilities(liabilities.filter(liability => liability.id !== id));
    }
  };

  const updateLiability = (id: number, field: keyof Liability, value: string) => {
    setLiabilities(liabilities.map(liability => 
      liability.id === id ? { ...liability, [field]: value } : liability
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ assets, liabilities });
    // Here you would typically send this data to your API
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="assets">
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
                          <SelectItem value="business_loan">Business Loan</SelectItem>
                          <SelectItem value="tax">Tax Debt</SelectItem>
                          <SelectItem value="other">Other Debt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
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
        <Button type="submit" className="w-full bg-navido-blue-500 hover:bg-navido-blue-600">
          Save Financial Information
        </Button>
      </div>
    </form>
  );
};

export default AssetLiabilityForm;
