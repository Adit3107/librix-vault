import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BookOpen, Receipt } from 'lucide-react';
import UserRecords from './UserRecords';
import BookManagement from './BookManagement';
import TransactionManagement from './TransactionManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage users, books, and analyze transactions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto sm:mx-0">
          <TabsTrigger value="users" className="gap-2 text-xs sm:text-sm">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">User Records</span>
            <span className="sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="books" className="gap-2 text-xs sm:text-sm">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Book Management</span>
            <span className="sm:hidden">Books</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2 text-xs sm:text-sm">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Transaction Management</span>
            <span className="sm:hidden">Transactions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserRecords />
        </TabsContent>

        <TabsContent value="books" className="space-y-4">
          <BookManagement />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
