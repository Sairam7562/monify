
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle, Edit, Trash2, Save } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const initialFeatureCategories = [
  {
    id: 1,
    name: 'Core Platform Features',
    features: [
      { id: 'personal_finance', name: 'Personal Finance Module', enabled: true, description: 'Personal financial management features' },
      { id: 'business_finance', name: 'Business Finance Module', enabled: true, description: 'Business financial management and tracking' },
      { id: 'statements', name: 'Financial Statements', enabled: true, description: 'Generate financial statements and reports' },
      { id: 'ai_advisor', name: 'AI Financial Advisor', enabled: true, description: 'AI-powered financial advice and insights' },
    ]
  },
  {
    id: 2,
    name: 'Specialized Features',
    features: [
      { id: 'debt_tracker', name: 'Debt Tracker', enabled: true, description: 'Track and manage debts and loans' },
      { id: 'investment_tracker', name: 'Investment Tracker', enabled: true, description: 'Track investment performance and portfolio' },
      { id: 'budget_planner', name: 'Budget Planner', enabled: true, description: 'Create and manage budgets' },
      { id: 'expense_categorization', name: 'Expense Categorization', enabled: false, description: 'Automatic categorization of expenses' },
    ]
  },
  {
    id: 3,
    name: 'Reporting & Analytics',
    features: [
      { id: 'financial_ratios', name: 'Financial Ratios', enabled: true, description: 'Calculate and display financial ratios' },
      { id: 'trend_analysis', name: 'Trend Analysis', enabled: true, description: 'Analyze financial trends over time' },
      { id: 'net_worth_tracking', name: 'Net Worth Tracking', enabled: true, description: 'Track net worth over time' },
      { id: 'forecast_projections', name: 'Financial Forecasting', enabled: false, description: 'Project future financial scenarios' },
    ]
  }
];

const initialPricingPlans = [
  { id: 'basic', name: 'Basic', price: 0, enabled: true, features: ['personal_finance', 'budget_planner', 'net_worth_tracking'] },
  { id: 'premium', name: 'Premium', price: 9.99, enabled: true, features: ['personal_finance', 'business_finance', 'statements', 'debt_tracker', 'investment_tracker', 'budget_planner', 'financial_ratios', 'trend_analysis', 'net_worth_tracking'] },
  { id: 'business', name: 'Business', price: 19.99, enabled: true, features: ['personal_finance', 'business_finance', 'statements', 'ai_advisor', 'debt_tracker', 'investment_tracker', 'budget_planner', 'expense_categorization', 'financial_ratios', 'trend_analysis', 'net_worth_tracking'] },
  { id: 'enterprise', name: 'Enterprise', price: 49.99, enabled: true, features: ['personal_finance', 'business_finance', 'statements', 'ai_advisor', 'debt_tracker', 'investment_tracker', 'budget_planner', 'expense_categorization', 'financial_ratios', 'trend_analysis', 'net_worth_tracking', 'forecast_projections'] },
];

const AdminFeatures = () => {
  const [featureCategories, setFeatureCategories] = useState(initialFeatureCategories);
  const [plans, setPlans] = useState(initialPricingPlans);
  const [isAddFeatureModalOpen, setIsAddFeatureModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [newFeature, setNewFeature] = useState({ name: '', description: '', enabled: true });
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newPlan, setNewPlan] = useState({ name: '', price: 0, enabled: true, features: [] });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      saveChangesToStorage();
    }
  }, [hasUnsavedChanges]);

  // Load data from localStorage on initial load
  useEffect(() => {
    const savedFeatureCategories = localStorage.getItem('featureCategories');
    const savedPlans = localStorage.getItem('pricingPlans');
    
    if (savedFeatureCategories) {
      setFeatureCategories(JSON.parse(savedFeatureCategories));
    }
    
    if (savedPlans) {
      setPlans(JSON.parse(savedPlans));
    }
  }, []);

  const saveChangesToStorage = () => {
    localStorage.setItem('featureCategories', JSON.stringify(featureCategories));
    localStorage.setItem('pricingPlans', JSON.stringify(plans));
    
    toast({
      title: "Changes Saved",
      description: "Your changes have been saved successfully.",
    });
    
    setHasUnsavedChanges(false);
  };

  const handleFeatureToggle = (categoryIndex, featureIndex, checked) => {
    const newFeatures = [...featureCategories];
    newFeatures[categoryIndex].features[featureIndex].enabled = checked;
    setFeatureCategories(newFeatures);
    setHasUnsavedChanges(true);
    
    toast({
      title: checked ? "Feature Enabled" : "Feature Disabled",
      description: `${newFeatures[categoryIndex].features[featureIndex].name} has been ${checked ? 'enabled' : 'disabled'}.`,
    });
  };

  const handlePlanToggle = (planIndex, checked) => {
    const newPlans = [...plans];
    newPlans[planIndex].enabled = checked;
    setPlans(newPlans);
    setHasUnsavedChanges(true);
    
    toast({
      title: checked ? "Plan Enabled" : "Plan Disabled",
      description: `${newPlans[planIndex].name} plan has been ${checked ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleAddFeature = () => {
    if (!newFeature.name || !selectedCategoryId) return;
    
    const categoryIndex = featureCategories.findIndex(cat => cat.id === selectedCategoryId);
    if (categoryIndex === -1) return;
    
    const newFeatureObj = {
      id: newFeature.name.toLowerCase().replace(/\s+/g, '_'),
      name: newFeature.name,
      description: newFeature.description,
      enabled: newFeature.enabled
    };
    
    const newCategories = [...featureCategories];
    newCategories[categoryIndex].features.push(newFeatureObj);
    setFeatureCategories(newCategories);
    setHasUnsavedChanges(true);
    
    setNewFeature({ name: '', description: '', enabled: true });
    setIsAddFeatureModalOpen(false);
    
    toast({
      title: "Feature Added",
      description: `${newFeatureObj.name} has been added to ${featureCategories[categoryIndex].name}.`,
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.name) return;
    
    const newCategoryObj = {
      id: featureCategories.length + 1,
      name: newCategory.name,
      features: []
    };
    
    setFeatureCategories([...featureCategories, newCategoryObj]);
    setNewCategory({ name: '' });
    setIsAddCategoryModalOpen(false);
    setHasUnsavedChanges(true);
    
    toast({
      title: "Category Added",
      description: `${newCategoryObj.name} category has been created.`,
    });
  };

  const handleAddPlan = () => {
    if (!newPlan.name) return;
    
    const planId = newPlan.name.toLowerCase().replace(/\s+/g, '_');
    
    const newPlanObj = {
      id: planId,
      name: newPlan.name,
      price: parseFloat(newPlan.price.toString()),
      enabled: newPlan.enabled,
      features: newPlan.features
    };
    
    setPlans([...plans, newPlanObj]);
    setNewPlan({ name: '', price: 0, enabled: true, features: [] });
    setIsAddPlanModalOpen(false);
    setHasUnsavedChanges(true);
    
    toast({
      title: "Plan Added",
      description: `${newPlanObj.name} plan has been created.`,
    });
  };

  const handleEditPlan = () => {
    if (!selectedPlan) return;
    
    const planIndex = plans.findIndex(p => p.id === selectedPlan.id);
    if (planIndex === -1) return;
    
    const updatedPlan = {
      ...selectedPlan,
      price: typeof selectedPlan.price === 'string' 
        ? parseFloat(selectedPlan.price) 
        : selectedPlan.price
    };
    
    const updatedPlans = [...plans];
    updatedPlans[planIndex] = updatedPlan;
    setPlans(updatedPlans);
    setHasUnsavedChanges(true);
    
    setSelectedPlan(null);
    setIsEditPlanModalOpen(false);
    
    toast({
      title: "Plan Updated",
      description: `${updatedPlan.name} plan has been updated.`,
    });
  };

  const deletePlan = (planId) => {
    setPlans(plans.filter(p => p.id !== planId));
    setHasUnsavedChanges(true);
    
    toast({
      title: "Plan Deleted",
      description: "The pricing plan has been removed.",
      variant: "destructive",
    });
  };

  const allFeatures = featureCategories.flatMap(category => 
    category.features.map(feature => ({ 
      id: feature.id, 
      name: feature.name, 
      category: category.name 
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Feature Controls</h2>
        <div className="flex gap-2">
          <Button onClick={saveChangesToStorage} disabled={!hasUnsavedChanges} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
          <Button onClick={() => setIsAddCategoryModalOpen(true)} variant="outline">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Category
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featureCategories.map((category, categoryIndex) => (
          <Card key={category.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>{category.name}</CardTitle>
                <CardDescription>Control visibility and access to these features</CardDescription>
              </div>
              <Button 
                onClick={() => {
                  setSelectedCategoryId(category.id);
                  setIsAddFeatureModalOpen(true);
                }}
                variant="ghost"
                size="sm"
              >
                <PlusCircle className="h-4 w-4 mr-1" /> Add Feature
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.features.map((feature, featureIndex) => (
                  <div key={feature.id} className="flex items-center justify-between space-x-2">
                    <div>
                      <Label htmlFor={feature.id} className="font-medium">{feature.name}</Label>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                    <Switch
                      id={feature.id}
                      checked={feature.enabled}
                      onCheckedChange={(checked) => handleFeatureToggle(categoryIndex, featureIndex, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex items-center justify-between mt-8">
        <h2 className="text-xl font-semibold">Pricing Plans</h2>
        <Button onClick={() => setIsAddPlanModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Plan
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Subscription Plans</CardTitle>
          <CardDescription>Configure pricing plans and included features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan, index) => (
              <div key={plan.id} className="border rounded-lg p-4 relative">
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => {
                      setSelectedPlan({...plan});
                      setIsEditPlanModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-red-500" 
                    onClick={() => deletePlan(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mb-2 mt-3">
                  <h3 className="font-medium">{plan.name}</h3>
                  <Switch
                    id={`plan-${plan.id}`}
                    checked={plan.enabled}
                    onCheckedChange={(checked) => handlePlanToggle(index, checked)}
                  />
                </div>
                <p className="text-2xl font-bold mb-2">
                  ${plan.price.toFixed(2)}
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  {plan.id === 'basic' ? 'Free tier with basic features' : 
                   plan.id === 'premium' ? 'Individual advanced features' :
                   plan.id === 'business' ? 'Small business features' :
                   'Enterprise-grade solutions'}
                </p>
                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-1">Included Features:</h4>
                  <div className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                    {plan.features.map(featureId => {
                      const feature = allFeatures.find(f => f.id === featureId);
                      return feature ? (
                        <div key={featureId} className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span>{feature.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddFeatureModalOpen} onOpenChange={setIsAddFeatureModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Feature</DialogTitle>
            <DialogDescription>
              Add a new feature to the selected category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="feature-name">Feature Name</Label>
              <Input
                id="feature-name"
                placeholder="e.g. Budget Analyzer"
                value={newFeature.name}
                onChange={(e) => setNewFeature({...newFeature, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feature-description">Description</Label>
              <Textarea
                id="feature-description"
                placeholder="Describe what this feature does"
                value={newFeature.description}
                onChange={(e) => setNewFeature({...newFeature, description: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="feature-enabled"
                checked={newFeature.enabled}
                onCheckedChange={(checked) => setNewFeature({...newFeature, enabled: checked})}
              />
              <Label htmlFor="feature-enabled">Enable Feature</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFeatureModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddFeature} disabled={!newFeature.name}>Add Feature</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddCategoryModalOpen} onOpenChange={setIsAddCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Feature Category</DialogTitle>
            <DialogDescription>
              Create a new category to group related features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="e.g. Advanced Analytics"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCategory} disabled={!newCategory.name}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddPlanModalOpen} onOpenChange={setIsAddPlanModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Pricing Plan</DialogTitle>
            <DialogDescription>
              Create a new subscription plan with selected features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input
                id="plan-name"
                placeholder="e.g. Professional"
                value={newPlan.name}
                onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-price">Monthly Price ($)</Label>
              <Input
                id="plan-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="29.99"
                value={newPlan.price}
                onChange={(e) => setNewPlan({...newPlan, price: parseFloat(e.target.value || '0')})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="plan-enabled"
                checked={newPlan.enabled}
                onCheckedChange={(checked) => setNewPlan({...newPlan, enabled: checked})}
              />
              <Label htmlFor="plan-enabled">Enable Plan</Label>
            </div>
            <div className="space-y-2">
              <Label>Included Features</Label>
              <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
                {allFeatures.map(feature => (
                  <div key={feature.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      id={`feature-${feature.id}`}
                      checked={newPlan.features.includes(feature.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewPlan({...newPlan, features: [...newPlan.features, feature.id]});
                        } else {
                          setNewPlan({
                            ...newPlan, 
                            features: newPlan.features.filter(id => id !== feature.id)
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <Label htmlFor={`feature-${feature.id}`} className="text-sm">
                      {feature.name} <span className="text-gray-500">({feature.category})</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPlanModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPlan} disabled={!newPlan.name}>Add Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditPlanModalOpen} onOpenChange={setIsEditPlanModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pricing Plan</DialogTitle>
            <DialogDescription>
              Modify the subscription plan and its features.
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-plan-name">Plan Name</Label>
                <Input
                  id="edit-plan-name"
                  value={selectedPlan.name}
                  onChange={(e) => setSelectedPlan({...selectedPlan, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-plan-price">Monthly Price ($)</Label>
                <Input
                  id="edit-plan-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={selectedPlan.price}
                  onChange={(e) => setSelectedPlan({
                    ...selectedPlan, 
                    price: parseFloat(e.target.value || '0')
                  })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-plan-enabled"
                  checked={selectedPlan.enabled}
                  onCheckedChange={(checked) => setSelectedPlan({...selectedPlan, enabled: checked})}
                />
                <Label htmlFor="edit-plan-enabled">Enable Plan</Label>
              </div>
              <div className="space-y-2">
                <Label>Included Features</Label>
                <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
                  {allFeatures.map(feature => (
                    <div key={feature.id} className="flex items-center py-1">
                      <input
                        type="checkbox"
                        id={`edit-feature-${feature.id}`}
                        checked={selectedPlan.features.includes(feature.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlan({
                              ...selectedPlan, 
                              features: [...selectedPlan.features, feature.id]
                            });
                          } else {
                            setSelectedPlan({
                              ...selectedPlan, 
                              features: selectedPlan.features.filter(id => id !== feature.id)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <Label htmlFor={`edit-feature-${feature.id}`} className="text-sm">
                        {feature.name} <span className="text-gray-500">({feature.category})</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPlanModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditPlan}>Update Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeatures;
