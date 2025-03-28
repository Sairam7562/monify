
import React from 'react';
import { ChartBar, FileText, PieChart, CircleDollarSign, MessageSquare, Download } from 'lucide-react';

const features = [
  {
    title: "Colorful Dashboards",
    description: "View your finances with vibrant, easy-to-understand charts that make tracking money actually fun.",
    icon: <ChartBar className="h-10 w-10 text-monify-purple-500" />,
    bgColor: "bg-monify-purple-100",
  },
  {
    title: "Playful Reports",
    description: "Generate eye-catching financial statements that bring your numbers to life.",
    icon: <FileText className="h-10 w-10 text-monify-pink-500" />,
    bgColor: "bg-monify-pink-100",
  },
  {
    title: "Business Insights",
    description: "Track business performance with animated visualizations that celebrate your growth.",
    icon: <PieChart className="h-10 w-10 text-monify-orange-500" />,
    bgColor: "bg-monify-orange-100",
  },
  {
    title: "Smart Budgeting",
    description: "Set and reach financial goals with interactive tools that reward your progress.",
    icon: <CircleDollarSign className="h-10 w-10 text-monify-cyan-500" />,
    bgColor: "bg-monify-cyan-100",
  },
  {
    title: "Friendly AI Advisor",
    description: "Get personalized financial advice from our cheerful AI assistant that speaks human, not finance.",
    icon: <MessageSquare className="h-10 w-10 text-monify-purple-500" />,
    bgColor: "bg-monify-purple-100",
  },
  {
    title: "Share Your Success",
    description: "Download and share your financial wins with beautiful, customizable reports.",
    icon: <Download className="h-10 w-10 text-monify-pink-500" />,
    bgColor: "bg-monify-pink-100",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Finance Made Delightful
          </h2>
          <p className="text-lg text-gray-600">
            Who said money management has to be boring? Not us!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:-translate-y-2 transition-all duration-300"
            >
              <div className={`mb-4 p-3 rounded-full inline-block ${feature.bgColor}`}>{feature.icon}</div>
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
