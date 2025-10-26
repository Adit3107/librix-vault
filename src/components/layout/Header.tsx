import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-lg sm:text-xl font-bold text-foreground hidden sm:block">
            Library Management
          </h1>
          {/* Mobile-only logo without text */}
          <div className="sm:hidden w-6" />
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop user info */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{user?.name}</span>
            <span className="text-muted-foreground">({user?.department})</span>
          </div>

          {/* Mobile-only user icon */}
          <div className="sm:hidden">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Logout button - responsive */}
          <Button onClick={handleLogout} variant="outline" size="sm" className="text-xs sm:text-sm">
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
