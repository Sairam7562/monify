
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const featureCategories = [
  {
    name: 'Core Platform Features',
    features: [
      { id: 'personal_finance', name: 'Personal Finance Module', enabled: true, description: 'Personal financial management features' },
      { id: 'business_finance', name: 'Business Finance Module', enabled: true, description: 'Business financial management and tracking' },
      { id: 'statements', name: 'Financial Statements', enabled: true, description: 'Generate financial statements and reports' },
      { id: 'ai_advisor', name: 'AI Financial Advisor', enabled: true, description: 'AI-powered financial advice and insights' },
    ]
  },
  {
    name: 'Specialized Features',
    features: [
      { id: 'debt_tracker', name: 'Debt Tracker', enabled: true, description: 'Track and manage debts and loans' },
      { id: 'investment_tracker', name: 'Investment Tracker', enabled: true, description: 'Track investment performance and portfolio' },
      { id: 'budget_planner', name: 'Budget Planner', enabled: true, description: 'Create and manage budgets' },
      { id: 'expense_categorization', name: 'Expense Categorization', enabled: false, description: 'Automatic categorization of expenses' },
    ]
  },
  {
    name: 'Reporting & Analytics',
    features: [
      { id: 'financial_ratios', name: 'Financial Ratios', enabled: true, description: 'Calculate and display financial ratios' },
      { id: 'trend_analysis', name: 'Trend Analysis', enabled: true, description: 'Analyze financial trends over time' },
      { id: 'net_worth_tracking', name: 'Net Worth Tracking', enabled: true, description: 'Track net worth over time' },
      { id: 'forecast_projections', name: 'Financial Forecasting', enabled: false, description: 'Project future financial scenarios' },
    ]
  }
];

const pricingPlans = [
  { id: 'basic', name: 'Basic', price: 0, enabled: true },
  { id: 'premium', name: 'Premium', price: 9.99, enabled: true },
  { id: 'business', name: 'Business', price: 19.99, enabled: true },
  { id: 'enterprise', name: 'Enterprise', price: 49.99, enabled: true },
];

const AdminFeatures = () => {
  const [features, setFeatures] = useState(featureCategories);
  const [plans, setPlans] = useState(pricingPlans);

  const handleFeatureToggle = (categoryIndex, featureIndex, checked) => {
    const newFeatures = [...features];
    newFeatures[categoryIndex].features[featureIndex].enabled = checked;
    setFeatures(newFeatures);
  };

  const handlePlanToggle = (planIndex, checked) => {
    const newPlans = [...plans];
    newPlans[planIndex].enabled = checked;
    setPlans(newPlans);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Feature Controls</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((category, categoryIndex) => (
          <Card key={category.name}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
              <CardDescription>Control visibility and access to these features</CardDescription>
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
      
      <Card>
        <CardHeader>
          <CardTitle>Pricing Plans</CardTitle>
          <CardDescription>Manage available subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {plans.map((plan, index) => (
              <div key={plan.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
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
                <p className="text-sm text-gray-500">
                  {plan.id === 'basic' ? 'Free tier with basic features' : 
                   plan.id === 'premium' ? 'Individual advanced features' :
                   plan.id === 'business' ? 'Small business features' :
                   'Enterprise-grade solutions'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFeatures;
