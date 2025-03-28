
import React from 'react';

const testimonials = [
  {
    quote: "Monify turned my dreaded monthly budget review into something I actually look forward to!",
    author: "Sarah Johnson",
    role: "Small Business Owner",
    image: "https://placehold.co/100/8B5CF6/FFFFFF/png?text=SJ",
    bgColor: "bg-monify-purple-50",
    borderColor: "border-monify-purple-200"
  },
  {
    quote: "The colorful charts and celebration animations make tracking my savings goals addictive - in a good way!",
    author: "Michael Chen",
    role: "Investor",
    image: "https://placehold.co/100/EC4899/FFFFFF/png?text=MC",
    bgColor: "bg-monify-pink-50",
    borderColor: "border-monify-pink-200"
  },
  {
    quote: "As a freelancer, I never thought I'd say this: I'm actually having fun organizing my finances with Monify!",
    author: "Rachel Patel",
    role: "Freelance Consultant",
    image: "https://placehold.co/100/06B6D4/FFFFFF/png?text=RP",
    bgColor: "bg-monify-cyan-50",
    borderColor: "border-monify-cyan-200"
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-white">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Happy Money, Happy People
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands who've transformed their relationship with money!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={`rounded-xl p-6 ${testimonial.bgColor} ${testimonial.borderColor} border shadow-sm hover:shadow-md transition-shadow`}
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
