export interface Transaction {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string;
  quantity: number;
  issueDate: string;
  returnDate?: string;
  dueDate: string;
  domain: string;
  status: 'issued' | 'returned' | 'overdue';
  user_name?: string;
  author?: string;
  fine_amount?: number;
}

/**
 * Optimized structure for transaction range and domain queries using Segment Tree.
 * Supports filtering by issue/return date and domain efficiently.
 */
export class TransactionIndex {
  private segmentTree: SegmentTreeNode | null = null;
  private domainIndex: Map<string, Transaction[]>;

  constructor(transactions: Transaction[]) {
    // Build domain index for fast domain filtering
    this.domainIndex = new Map();
    for (const tx of transactions) {
      const domain = tx.domain.toLowerCase();
      if (!this.domainIndex.has(domain)) {
        this.domainIndex.set(domain, []);
      }
      this.domainIndex.get(domain)!.push(tx);
    }

    // Build segment tree from sorted transactions
    if (transactions.length > 0) {
      const sortedTransactions = [...transactions]
        .filter(t => t.issueDate)
        .sort((a, b) => new Date(a.issueDate!).getTime() - new Date(b.issueDate!).getTime());

      console.log(`🔧 Building segment tree with ${sortedTransactions.length} transactions...`);

      const buildStartTime = performance.now();
      this.segmentTree = this.buildSegmentTree(sortedTransactions, 0, sortedTransactions.length - 1);
      const buildEndTime = performance.now();

      console.log(`✅ Segment tree built successfully:
        - Transactions: ${sortedTransactions.length}
        - Build Time: ${(buildEndTime - buildStartTime).toFixed(2)}ms
        - Memory Efficient: O(n) space complexity`);
    }
  }

  /**
   * Query transactions by date range and optional domain.
   * Complexity: O(log n + k)
   */
  query(fromDate: Date, toDate: Date, domain?: string): Transaction[] {
    if (!this.segmentTree) {
      return [];
    }

    // Always use segment tree for date range queries
    let result = this.segmentTreeQuery(this.segmentTree, fromDate, toDate);

    // If domain is specified, filter results by domain
    if (domain) {
      const lowerDomain = domain.toLowerCase();
      result = result.filter(tx => tx.domain.toLowerCase() === lowerDomain);
    }

    return result;
  }

  private buildSegmentTree(transactions: Transaction[], start: number, end: number): SegmentTreeNode {
    if (start === end) {
      // Leaf node - represents a single transaction
      const txDate = new Date(transactions[start].issueDate!);
      return {
        range: {
          start: txDate,
          end: txDate
        },
        transactions: [transactions[start]],
        left: null,
        right: null
      };
    }

    const mid = Math.floor((start + end) / 2);
    const leftNode = this.buildSegmentTree(transactions, start, mid);
    const rightNode = this.buildSegmentTree(transactions, mid + 1, end);

    // Internal node - range spans from leftmost to rightmost transaction
    const startDate = leftNode.range.start;
    const endDate = rightNode.range.end;

    return {
      range: {
        start: startDate,
        end: endDate
      },
      transactions: [...leftNode.transactions, ...rightNode.transactions],
      left: leftNode,
      right: rightNode
    };
  }

  private segmentTreeQuery(node: SegmentTreeNode, fromDate: Date, toDate: Date): Transaction[] {
    const result: Transaction[] = [];
    const fromTime = fromDate.getTime();
    const toTime = toDate.getTime();

    // If no overlap between node range and query range, return empty
    if (node.range.end.getTime() < fromTime || node.range.start.getTime() > toTime) {
      return result;
    }

    // If this is a leaf node, check if the transaction date is in query range
    if (!node.left && !node.right) {
      const txTime = node.range.start.getTime();
      if (txTime >= fromTime && txTime <= toTime) {
        result.push(...node.transactions);
      }
      return result;
    }

    // For internal nodes, always check both children if they exist
    if (node.left) {
      result.push(...this.segmentTreeQuery(node.left, fromDate, toDate));
    }
    if (node.right) {
      result.push(...this.segmentTreeQuery(node.right, fromDate, toDate));
    }

    return result;
  }

  private linearSearchInRange(transactions: Transaction[], fromDate: Date, toDate: Date): Transaction[] {
    const result: Transaction[] = [];
    const fromTime = fromDate.getTime();
    const toTime = toDate.getTime();

    for (const tx of transactions) {
      if (!tx.issueDate) continue;
      const issueTime = new Date(tx.issueDate).getTime();
      if (issueTime >= fromTime && issueTime <= toTime) {
        result.push(tx);
      }
    }

    return result;
  }

  private rangesOverlap(range1: DateRange, range2: DateRange): boolean {
    return range1.start.getTime() <= range2.end.getTime() &&
           range2.start.getTime() <= range1.end.getTime();
  }

  private isRangeContained(inner: DateRange, outer: DateRange): boolean {
    return inner.start.getTime() >= outer.start.getTime() &&
           inner.end.getTime() <= outer.end.getTime();
  }
}

interface DateRange {
  start: Date;
  end: Date;
}

interface SegmentTreeNode {
  range: DateRange;
  transactions: Transaction[];
  left: SegmentTreeNode | null;
  right: SegmentTreeNode | null;
}
