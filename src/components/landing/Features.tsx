
import React from 'react';
import { ChartBar, FileText, PieChart, CircleDollarSign, MessageSquare, Download } from 'lucide-react';

const features = [
  {
    title: "Financial Dashboards",
    description: "View your complete financial picture with customizable dashboards that give you insights at a glance.",
    icon: <ChartBar className="h-10 w-10 text-navido-blue-500" />,
  },
  {
    title: "Statement Generation",
    description: "Create professional financial statements automatically based on your input data.",
    icon: <FileText className="h-10 w-10 text-navido-blue-500" />,
  },
  {
    title: "Business Performance",
    description: "Track and analyze your business performance with detailed metrics and visualizations.",
    icon: <PieChart className="h-10 w-10 text-navido-blue-500" />,
  },
  {
    title: "Affordability Analysis",
    description: "Calculate what you can afford for home loans, business investments, and major purchases.",
    icon: <CircleDollarSign className="h-10 w-10 text-navido-blue-500" />,
  },
  {
    title: "AI Financial Advisor",
    description: "Get personalized financial advice and recommendations from our AI-powered system.",
    icon: <MessageSquare className="h-10 w-10 text-navido-blue-500" />,
  },
  {
    title: "Export & Download",
    description: "Download your financial statements as professional PDF documents for offline use.",
    icon: <Download className="h-10 w-10 text-navido-blue-500" />,
  },
];

const Features = () => {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Financial Tools
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to manage your personal and business finances in one place.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="navido-feature-card hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
