import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="space-y-6">
          {/* 404 Illustration */}
          <div className="space-y-4">
            <h1 className="text-9xl font-bold text-green-600">404</h1>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
              <p className="text-gray-600">
                Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Go Back
            </Button>
            <Button leftIcon={<Home className="h-4 w-4" />}>
              <Link to="/">Go Home</Link>
            </Button>
          </div>

          {/* Help Links */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">Need help? Try these links:</p>
            <div className="space-x-6 text-sm">
              <Link to="/about" className="text-green-600 hover:text-green-500">
                About Us
              </Link>
              <Link to="/contact" className="text-green-600 hover:text-green-500">
                Contact
              </Link>
              <Link to="/help" className="text-green-600 hover:text-green-500">
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;