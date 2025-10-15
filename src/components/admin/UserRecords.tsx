import { useState, useEffect } from 'react';
import { getUsers, getIssuedBooks, returnBook, getBooks } from '@/lib/dummyData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  isAdmin: boolean;
  created_at: string;
  updated_at: string;
}

interface IssuedBook {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string;
  quantity: number;
  issue_date: string;
  due_date: string;
  return_date?: string;
  fine_amount: number;
  status: 'issued' | 'returned' | 'overdue';
  created_at: string;
  updated_at: string;
  user_name?: string;
  department?: string;
  author?: string;
}

const UserRecords = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [returning, setReturning] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, issuedBooksData] = await Promise.all([
        getUsers(),
        getIssuedBooks()
      ]);
      setUsers(usersData);
      setIssuedBooks(issuedBooksData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load user records');
    } finally {
      setLoading(false);
    }
  };

  const getUserIssuedBooks = (userId: string) => {
    return issuedBooks.filter((ib) => ib.user_id === userId);
  };

  const calculateFine = (dueDate: string, returnDate?: string) => {
    const due = new Date(dueDate);
    const today = returnDate ? new Date(returnDate) : new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    if (today > due) {
      const diffTime = Math.abs(today.getTime() - due.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays * 50;
    }
    return 0;
  };

  const handleReturn = async (issuedBookId: string) => {
    try {
      setReturning(issuedBookId);
      await returnBook(issuedBookId);

      // Refresh data after successful return
      await loadData();
      toast.success('Book returned successfully');
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error('Failed to return book');
    } finally {
      setReturning(null);
    }
  };

  const getTotalFine = (userId: string) => {
    return getUserIssuedBooks(userId).reduce((total, ib) => {
      return total + calculateFine(ib.due_date, ib.return_date);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading user records...</span>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {users.map((user) => {
          const userBooks = getUserIssuedBooks(user.id);
          const totalFine = getTotalFine(user.id);

          return (
            <Card key={user.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedUser(user)}>
              <CardHeader>
                <CardTitle className="text-lg">{user.name}</CardTitle>
                <CardDescription>{user.department}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Books Issued:</span>
                  <Badge variant={userBooks.length > 0 ? 'default' : 'secondary'}>
                    {userBooks.length}
                  </Badge>
                </div>
                {totalFine > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fine:</span>
                    <Badge variant="destructive">₹{totalFine}</Badge>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedUser?.name} - Issued Books</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {getUserIssuedBooks(selectedUser?.id || '').length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No books issued</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Title</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Fine</TableHead>
                    <TableHead>Return</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getUserIssuedBooks(selectedUser?.id || '').map((issued) => {
                    const fine = calculateFine(issued.due_date, issued.return_date);
                    const isOverdue = fine > 0 && !issued.return_date;

                    return (
                      <TableRow key={issued.id}>
                        <TableCell className="font-medium">{issued.book_title}</TableCell>
                        <TableCell>{issued.quantity}</TableCell>
                        <TableCell>{new Date(issued.issue_date).toLocaleDateString()}</TableCell>
                        <TableCell className={isOverdue ? 'text-destructive font-medium' : ''}>
                          {new Date(issued.due_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {fine > 0 && (
                            <Badge variant="destructive">₹{fine}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={!!issued.return_date}
                            disabled={!!issued.return_date || returning === issued.id}
                            onCheckedChange={() => handleReturn(issued.id)}
                          />
                          {returning === issued.id && (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserRecords;
