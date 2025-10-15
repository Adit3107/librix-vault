import { useState, useEffect } from 'react';
import { getDomains } from '@/lib/dummyData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import DomainBooks from './DomainBooks';
import MyIssuedBooks from './MyIssuedBooks';

const UserDashboard = () => {
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDomain, setActiveDomain] = useState<string>('');

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const domainsData = await getDomains();
      setDomains(domainsData);
      if (domainsData.length > 0) {
        setActiveDomain(domainsData[0]);
      }
    } catch (error) {
      console.error('Error loading domains:', error);
      toast.error('Failed to load domains');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading library catalog...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Library Catalog</h2>
        <p className="text-muted-foreground">Browse books by domain and manage your issued books</p>
      </div>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">Browse Books</TabsTrigger>
          <TabsTrigger value="my-books">My Issued Books</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <Tabs value={activeDomain} onValueChange={setActiveDomain}>
            <TabsList className={`grid w-full ${domains.length === 5 ? 'grid-cols-5' : domains.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {domains.map((domain: string) => (
                <TabsTrigger key={domain} value={domain}>
                  {domain}
                </TabsTrigger>
              ))}
            </TabsList>
            {domains.map((domain: string) => (
              <TabsContent key={domain} value={domain}>
                <DomainBooks domain={domain} />
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="my-books">
          <MyIssuedBooks />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
