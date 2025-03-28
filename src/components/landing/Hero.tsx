
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="monify-hero py-20 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold animate-fade-in">
              Make Money Management Fun!
            </h1>
            <p className="text-lg md:text-xl text-white/90 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Simplify your finances with colorful insights and playful tools that make budgeting enjoyable!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-white text-monify-purple-600 hover:bg-gray-100">
                  Start For Free
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl animate-fade-in" style={{ animationDelay: "0.3s" }}></div>
            <img 
              src="https://placehold.co/600x400/8B5CF6/FFFFFF/png?text=Monify+Dashboard" 
              alt="Financial Dashboard" 
              className="relative rounded-2xl shadow-2xl w-full animate-fade-in" 
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
