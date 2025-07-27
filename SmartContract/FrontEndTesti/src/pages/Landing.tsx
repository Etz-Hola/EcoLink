import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Recycle, TrendingUp, Users, Shield, Award } from 'lucide-react';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';

const Landing: React.FC = () => {
  const features = [
    {
      icon: <Recycle className="h-6 w-6" />,
      title: 'Smart Material Upload',
      description: 'Upload photos, get instant pricing, and track your recyclable materials with our AI-powered system.'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Real-time Pricing',
      description: 'Get market-based pricing for different material types, conditions, and quality grades.'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Connected Network',
      description: 'Join collectors, processing branches, and buyers in one integrated platform.'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Quality Assurance',
      description: 'Professional quality grading and transparent tracking from collection to processing.'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Active Collectors' },
    { value: '500+', label: 'Processing Branches' },
    { value: '2.5M kg', label: 'Materials Recycled' },
    { value: '₦45M+', label: 'Payments Made' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                  Turn Your
                  <span className="block text-green-600">Waste Into Wealth</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Connect with Nigeria's largest recycling network. Upload materials, get instant pricing, and earn money while saving the planet.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  <Link to="/register">Get Started Free</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg"
                >
                  <Link to="/how-it-works">How It Works</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">Trusted Platform</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Secure Payments</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8 transform rotate-3">
                <img
                  src="https://images.pexels.com/photos/3850512/pexels-photo-3850512.jpeg?auto=compress&cs=tinysrgb&w=500"
                  alt="Recycling materials"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Plastic Bottles</span>
                    <span className="text-green-600 font-bold">₦150/kg</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg">
                <div className="text-2xl font-bold">₦1,250</div>
                <div className="text-sm opacity-90">Earned Today</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Start Recycling
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform makes it easy to turn your recyclable materials into income while contributing to a sustainable future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple. Smart. Sustainable.
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just 3 easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Upload Materials
              </h3>
              <p className="text-gray-600">
                Take photos of your recyclable materials and upload them to our platform with weight and condition details.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get Pricing
              </h3>
              <p className="text-gray-600">
                Receive instant, market-based pricing for your materials based on type, quality, and current demand.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get Paid
              </h3>
              <p className="text-gray-600">
                Schedule pickup or drop-off at nearby branches, and get paid directly to your account or mobile wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <Leaf className="h-16 w-16 text-white mx-auto" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Join thousands of Nigerians who are earning money while creating a cleaner, more sustainable future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="px-8 py-4 text-lg bg-white text-green-600 hover:bg-gray-100"
              >
                <Link to="/register">Start Recycling Today</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-green-600"
              >
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;