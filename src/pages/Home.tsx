import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, LogIn, UserPlus, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        {/* Logo/Icon */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <BookOpen className="h-20 w-20 text-blue-600" />
            <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-xl scale-150"></div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Welcome to
            </span>
          </h1>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Library Management System
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Manage your library books, users, and track issuances with ease. 
          Your digital solution for modern library management.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link to="/login" className="w-full sm:w-auto">
            <Button 
              className="w-full sm:w-auto gap-3 text-lg px-8 py-4 h-auto bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <LogIn className="h-5 w-5" />
              Login to Your Account
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          
          <Link to="/register" className="w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto gap-3 text-lg px-8 py-4 h-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-300"
              size="lg"
            >
              <UserPlus className="h-5 w-5" />
              Create New Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Home;
