import { useState, useEffect } from 'react';
import { getBooks, getDomains, getIssuedBooks } from '@/lib/dummyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Filter, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { Transaction, TransactionIndex } from '@/shared/schema';

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

const TransactionManagement = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Transaction filtering state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionIndex, setTransactionIndex] = useState<TransactionIndex | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [filterDomain, setFilterDomain] = useState<string>('all');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [queryTime, setQueryTime] = useState<number | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Try to load from API first (since backend is running)
      console.log('🔄 Loading transaction data from API...');
      const [booksData, domainsData, issuedBooksData] = await Promise.all([
        getBooks(),
        getDomains(),
        getIssuedBooks()
      ]);

      console.log(`📊 API Data Loaded:
        - Books: ${booksData.length}
        - Domains: ${domainsData.length}
        - Transactions: ${issuedBooksData.length}`);

      setBooks(booksData);
      setDomains(domainsData);

      // Convert IssuedBook to Transaction format with proper domain mapping
      const transactionData: Transaction[] = issuedBooksData.map(issued => {
        // Find the book to get the domain
        const book = booksData.find(b => b.id === issued.book_id);
        return {
          id: issued.id,
          user_id: issued.user_id,
          book_id: issued.book_id,
          book_title: issued.book_title,
          quantity: issued.quantity,
          issueDate: issued.issue_date,
          returnDate: issued.return_date,
          dueDate: issued.due_date,
          domain: book?.domain || 'Unknown',
          status: issued.status,
          user_name: issued.user_name,
          author: issued.author,
          fine_amount: issued.fine_amount
        };
      });

      setTransactions(transactionData);

      // Build segment tree with performance logging
      if (transactionData.length > 0) {
        const treeStartTime = performance.now();
        const treeIndex = new TransactionIndex(transactionData);
        const treeEndTime = performance.now();

        setTransactionIndex(treeIndex);

        console.log(`🌳 Segment Tree Performance:
          - Total Transactions: ${transactionData.length}
          - Tree Build Time: ${(treeEndTime - treeStartTime).toFixed(2)}ms
          - Expected Query Time: O(log ${transactionData.length})`);

        toast.success(`Loaded ${transactionData.length.toLocaleString()} transactions from database`);
      } else {
        console.warn('⚠️ No transactions found in database. API returned empty result.');
        toast.warning('No transactions found in database');
        setTransactionIndex(null);
      }
    } catch (error) {
      console.error('❌ Error loading transaction data:', error);
      toast.error(`Failed to load transaction data: ${error.message}`);
      setTransactionIndex(null);
    } finally {
      setLoading(false);
    }
  };

  // Transaction filtering functions
  const handleApplyTransactionFilter = () => {
    if (!transactionIndex) {
      toast.error('Transaction data not loaded');
      return;
    }

    if (!fromDate || !toDate) {
      toast.error('Please select both from and to dates');
      return;
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (from > to) {
      toast.error('From date cannot be after to date');
      return;
    }

    setIsQuerying(true);
    const startTime = performance.now();

    try {
      const filtered = transactionIndex.query(
        from,
        to,
        filterDomain === 'all' ? undefined : filterDomain
      );

      const endTime = performance.now();
      const queryDuration = endTime - startTime;

      setFilteredTransactions(filtered);
      setQueryTime(queryDuration);

      toast.success(`Found ${filtered.length} transactions in ${queryDuration.toFixed(2)}ms`);
    } catch (error) {
      console.error('Error filtering transactions:', error);
      toast.error('Failed to filter transactions');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleClearTransactionFilter = () => {
    setFromDate('');
    setToDate('');
    setFilterDomain('all');
    setFilteredTransactions([]);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Receipt className="h-5 w-5" />
            Transaction Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">Filter and analyze book transactions by date range and domain</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-center py-8 gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading transaction data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Receipt className="h-5 w-5" />
          Transaction Management
        </CardTitle>
        <p className="text-sm text-muted-foreground">Filter and analyze book transactions by date range and domain</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4" />
            <h3 className="text-sm font-medium">Transaction Filter</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">From Date</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">To Date</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Domain (Optional)</label>
              <Select value={filterDomain} onValueChange={setFilterDomain}>
                <SelectTrigger>
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

            <div className="flex gap-2 items-end">
              <Button onClick={handleApplyTransactionFilter} className="flex-1" disabled={isQuerying}>
                {isQuerying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Apply Filter
              </Button>
              <Button variant="outline" onClick={handleClearTransactionFilter}>
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Dataset Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Oct 2024 - Oct 2025</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Segment Tree Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">O(log n)</div>
              <p className="text-xs text-muted-foreground">Query complexity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Query Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredTransactions.length.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {queryTime ? `${queryTime.toFixed(2)}ms` : 'No query yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Active Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs">
                  {fromDate && toDate ? `${fromDate} to ${toDate}` : 'No date range'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {filterDomain !== 'all' ? filterDomain : 'All domains'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold">Transaction Results</h3>
              <Badge variant="secondary">
                {filteredTransactions.length} transactions found
              </Badge>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Book Title</TableHead>
                      <TableHead className="min-w-[120px]">User</TableHead>
                      <TableHead className="min-w-[80px]">Qty</TableHead>
                      <TableHead className="min-w-[100px]">Issue Date</TableHead>
                      <TableHead className="min-w-[100px]">Return Date</TableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                      <TableHead className="min-w-[100px]">Domain</TableHead>
                      <TableHead className="min-w-[80px]">Fine</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium max-w-[200px] truncate" title={transaction.book_title}>
                          {transaction.book_title}
                        </TableCell>
                        <TableCell className="max-w-[120px] truncate" title={transaction.user_name || 'Unknown'}>
                          {transaction.user_name || 'Unknown'}
                        </TableCell>
                        <TableCell>{transaction.quantity}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(transaction.issueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {transaction.returnDate
                            ? new Date(transaction.returnDate).toLocaleDateString()
                            : <span className="text-muted-foreground">Not returned</span>
                          }
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.status === 'returned' ? 'default' :
                              transaction.status === 'overdue' ? 'destructive' : 'secondary'
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.domain}</Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.fine_amount && transaction.fine_amount > 0 ? (
                            <Badge variant="destructive">₹{transaction.fine_amount}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select date range and domain to filter transactions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionManagement;
