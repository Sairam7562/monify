
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AIAdvisor from '@/components/ai/AIAdvisor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AIAdvisorPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">AI Financial Advisor</h1>
          <p className="text-muted-foreground">
            Get personalized financial advice powered by artificial intelligence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2 h-[calc(100vh-240px)]">
            <CardHeader className="pb-2">
              <CardTitle>Chat with Your Financial Advisor</CardTitle>
              <CardDescription>
                Ask questions about your finances, investments, debt management, and more.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-100px)]">
              <AIAdvisor />
            </CardContent>
          </Card>
          
          <div className="col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Ask a specific financial question</li>
                  <li>Get AI-powered personalized advice</li>
                  <li>Follow up with additional questions</li>
                  <li>Save insights for future reference</li>
                </ol>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Popular Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-navido-blue-500"></div>
                    <span>Debt Management Strategies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-navido-blue-500"></div>
                    <span>Investment Recommendations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-navido-blue-500"></div>
                    <span>Retirement Planning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-navido-blue-500"></div>
                    <span>Tax Optimization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-navido-blue-500"></div>
                    <span>Emergency Fund Planning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-navido-blue-500"></div>
                    <span>Financial Goal Setting</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AIAdvisorPage;
