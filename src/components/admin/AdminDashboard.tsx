import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BookOpen } from 'lucide-react';
import UserRecords from './UserRecords';
import BookManagement from './BookManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage users and monitor book issuance</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            User Records
          </TabsTrigger>
          <TabsTrigger value="books" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Book Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserRecords />
        </TabsContent>

        <TabsContent value="books" className="space-y-4">
          <BookManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
