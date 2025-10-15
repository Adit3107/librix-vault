import { useState, useEffect } from 'react';
import { getBooks, issueBook } from '@/lib/dummyData';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Book {
  id: string;
  title: string;
  author: string;
  domain: string;
  isbn: string;
  quantity: number;
  available: number;
  created_at: string;
  updated_at: string;
}

interface DomainBooksProps {
  domain: string;
}

const DomainBooks = ({ domain }: DomainBooksProps) => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    loadBooks();
  }, [domain]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const booksData = await getBooks(domain);
      setBooks(booksData);
    } catch (error) {
      console.error('Error loading books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const domainBooks = books.filter((book) => book.domain === domain);

  const handleIssue = async () => {
    if (!selectedBook || !dueDate || quantity < 1) {
      toast.error('Please fill all fields correctly');
      return;
    }

    if (quantity > selectedBook.available) {
      toast.error('Requested quantity not available');
      return;
    }

    if (new Date(dueDate) <= new Date(issueDate)) {
      toast.error('Due date must be after issue date');
      return;
    }

    try {
      setIssuing(true);
      await issueBook(selectedBook.id, quantity, dueDate);

      toast.success('Book issued successfully!');

      // Refresh books data
      await loadBooks();

      // Reset form
      setSelectedBook(null);
      setQuantity(1);
      setDueDate('');
    } catch (error) {
      console.error('Error issuing book:', error);
      toast.error('Failed to issue book');
    } finally {
      setIssuing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading books...</span>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {domainBooks.map((book) => (
          <Card key={book.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <BookOpen className="h-8 w-8 text-primary" />
                <Badge variant={book.available > 0 ? 'default' : 'destructive'}>
                  {book.available} available
                </Badge>
              </div>
              <CardTitle className="text-lg mt-2">{book.title}</CardTitle>
              <CardDescription>{book.author}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">ISBN: {book.isbn}</p>
                <p className="text-muted-foreground">Total copies: {book.quantity}</p>
              </div>
              <Button
                onClick={() => setSelectedBook(book)}
                disabled={book.available === 0}
                className="w-full"
              >
                Issue Book
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Book: {selectedBook?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={selectedBook?.available || 1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                disabled={issuing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-date">Issue Date</Label>
              <Input
                id="issue-date"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                disabled={issuing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={issueDate}
                disabled={issuing}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBook(null)} disabled={issuing}>
              Cancel
            </Button>
            <Button onClick={handleIssue} disabled={issuing}>
              {issuing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Issuing...
                </>
              ) : (
                'Confirm Issue'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DomainBooks;
