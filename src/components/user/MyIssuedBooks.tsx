import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIssuedBooks } from '@/lib/dummyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

const MyIssuedBooks = () => {
  const { user } = useAuth();
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssuedBooks();
  }, [user]);

  const loadIssuedBooks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const booksData = await getIssuedBooks();
      setIssuedBooks(booksData);
    } catch (error) {
      console.error('Error loading issued books:', error);
      toast.error('Failed to load issued books');
    } finally {
      setLoading(false);
    }
  };

  const myBooks = issuedBooks.filter((ib) => ib.user_id === user?.id);

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

  const totalFine = myBooks.reduce((total, book) => {
    return total + calculateFine(book.due_date, book.return_date);
  }, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Issued Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading your books...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Issued Books</CardTitle>
          {totalFine > 0 && (
            <Badge variant="destructive" className="text-base">
              Total Fine: ₹{totalFine}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {myBooks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No books issued</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Title</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fine</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myBooks.map((book) => {
                const fine = calculateFine(book.due_date, book.return_date);
                const isOverdue = fine > 0 && !book.return_date;

                return (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.book_title}</TableCell>
                    <TableCell>{book.quantity}</TableCell>
                    <TableCell>{new Date(book.issue_date).toLocaleDateString()}</TableCell>
                    <TableCell className={isOverdue ? 'text-destructive font-medium' : ''}>
                      {new Date(book.due_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {book.return_date ? (
                        <Badge variant="secondary">Returned</Badge>
                      ) : isOverdue ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {fine > 0 && (
                        <Badge variant="destructive">₹{fine}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MyIssuedBooks;
