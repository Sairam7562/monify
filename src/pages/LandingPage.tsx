
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Testimonials from '@/components/landing/Testimonials';
import CTASection from '@/components/landing/CTASection';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-monify-purple-600 to-monify-pink-600">
              Monify
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-monify-purple-600 transition-colors">
              Features
            </a>
            <a href="#testimonials" className="text-sm font-medium text-gray-700 hover:text-monify-purple-600 transition-colors">
              Testimonials
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-700 hover:text-monify-purple-600 transition-colors">
              Pricing
            </a>
            <a href="#contact" className="text-sm font-medium text-gray-700 hover:text-monify-purple-600 transition-colors">
              Contact
            </a>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="hidden md:inline-flex">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-monify-purple-500 hover:bg-monify-purple-600">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main>
        <Hero />
        
        <section id="features">
          <Features />
        </section>
        
        <section id="testimonials">
          <Testimonials />
        </section>
        
        <section id="pricing" className="py-20 px-4 md:px-6 lg:px-8 bg-gray-50">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-gray-600">
                Choose the plan that's right for your financial journey.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Free</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="text-gray-600 mb-6">Perfect for individuals just getting started with financial planning.</p>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-monify-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Basic Net Worth Tracking
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-monify-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Income & Expense Tracking
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-monify-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Basic Financial Statements
                    </li>
                  </ul>
                  
                  <Link to="/register">
                    <Button variant="outline" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Pro Plan */}
              <div className="rounded-xl border-2 border-monify-purple-500 bg-white shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 bg-monify-purple-500 text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
                  POPULAR
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Pro</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$9.99</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="text-gray-600 mb-6">Ideal for individuals and small business owners seeking comprehensive financial tools.</p>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-monify-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      All Free Features
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-monify-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Advanced Financial Analysis
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-monify-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Business Performance Tracking
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-monify-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      PDF Export
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-monify-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      AI Financial Advisor (10 queries/mo)
                    </li>
                  </ul>
                  
                  <Link to="/register">
                    <Button className="w-full bg-monify-purple-500 hover:bg-monify-purple-600">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Business Plan */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Business</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$24.99</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="text-gray-600 mb-6">Powerful tools for businesses with multiple income streams and complex finances.</p>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-monify-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      All Pro Features
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-monify-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Multiple Business Management
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-monify-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Unlimited AI Financial Advisor
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-monify-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Advanced Tax Planning
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-monify-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Priority Support
                    </li>
                  </ul>
                  
                  <Link to="/register">
                    <Button variant="outline" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="contact">
          <CTASection />
        </section>
      </main>
      
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Monify</h3>
              <p className="text-gray-400 text-sm">
                Empowering individuals and businesses with powerful financial tools and insights.
              </p>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Webinars</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Monify. All rights reserved.
            </p>
            
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
