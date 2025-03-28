
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <section className="navido-hero py-16 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Take Control of Your Financial Future?
          </h2>
          <p className="text-lg md:text-xl mb-8 text-white/90">
            Join Finance Navido today and start your journey toward financial clarity and success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto bg-white text-navido-blue-700 hover:bg-gray-100">
                Create Free Account
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
