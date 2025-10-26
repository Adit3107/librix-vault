import { useState, useEffect } from 'react';
import { getBooks, getDomains } from '@/lib/dummyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';
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

const BookManagement = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [booksData, domainsData] = await Promise.all([
        getBooks(),
        getDomains()
      ]);
      setBooks(booksData);
      setDomains(domainsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load books and domains');
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = selectedDomain === 'all' || book.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Book Inventory</CardTitle>
          <p className="text-sm text-muted-foreground">Manage and search through the library book collection</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-center py-8 gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading books...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Book Inventory</CardTitle>
        <p className="text-sm text-muted-foreground">Manage and search through the library book collection</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {domains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead className="min-w-[150px]">Author</TableHead>
                  <TableHead className="min-w-[120px]">Domain</TableHead>
                  <TableHead className="min-w-[100px]">ISBN</TableHead>
                  <TableHead className="min-w-[80px]">Total</TableHead>
                  <TableHead className="min-w-[100px]">Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm || selectedDomain !== 'all'
                        ? 'No books match your search criteria'
                        : 'No books found'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium max-w-[200px] truncate" title={book.title}>
                        {book.title}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate" title={book.author}>
                        {book.author}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{book.domain}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {book.isbn}
                      </TableCell>
                      <TableCell className="text-center">{book.quantity}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={book.available > 0 ? 'default' : 'destructive'}>
                          {book.available}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {filteredBooks.length > 0 && (
          <div className="text-sm text-muted-foreground text-center sm:text-right">
            Showing {filteredBooks.length} of {books.length} books
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookManagement;
