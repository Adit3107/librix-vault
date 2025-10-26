import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserDashboard from '@/components/user/UserDashboard';
import Header from '@/components/layout/Header';

const Dashboard = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {isAdmin ? <AdminDashboard /> : <UserDashboard />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
