import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserDashboard from '@/components/user/UserDashboard';
import Header from '@/components/layout/Header';

const Dashboard = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {isAdmin ? <AdminDashboard /> : <UserDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;
