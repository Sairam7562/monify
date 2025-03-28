
import React from 'react';

const testimonials = [
  {
    quote: "Finance Navido has transformed how I manage my business finances. The insights and reports are invaluable.",
    author: "Sarah Johnson",
    role: "Small Business Owner",
    image: "https://placehold.co/100/0087C3/FFFFFF/png?text=SJ"
  },
  {
    quote: "The AI advisor helped me make better investment decisions. It's like having a financial planner at my fingertips.",
    author: "Michael Chen",
    role: "Investor",
    image: "https://placehold.co/100/0087C3/FFFFFF/png?text=MC"
  },
  {
    quote: "Creating professional financial statements used to take me hours. Now it's automated and takes minutes.",
    author: "Rachel Patel",
    role: "Freelance Consultant",
    image: "https://placehold.co/100/0087C3/FFFFFF/png?text=RP"
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-white">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of business owners and individuals who have transformed their financial management.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.author} 
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <blockquote className="text-gray-700 italic">"{testimonial.quote}"</blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
