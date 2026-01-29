import { Router, Request, Response } from 'express';

const router = Router();

// Mock data for theory materials
const theoryMaterials = [
  {
    id: 'theory-1',
    title: 'Introduction to Data Structures',
    description: 'Learn the fundamentals of data structures including arrays, linked lists, stacks, and queues.',
    type: 'slide',
    topic: 'Data Structures',
    week: 1,
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
    fileUrl: '/uploads/slides/intro-ds.pdf',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    views: 245,
    downloads: 89
  },
  {
    id: 'theory-2',
    title: 'Algorithm Analysis and Big O',
    description: 'Understanding time and space complexity, Big O notation, and how to analyze algorithm efficiency.',
    type: 'pdf',
    topic: 'Algorithms',
    week: 2,
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
    fileUrl: '/uploads/pdfs/big-o.pdf',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-22T14:30:00Z',
    views: 312,
    downloads: 156
  },
  {
    id: 'theory-3',
    title: 'Binary Trees and BST',
    description: 'Comprehensive guide to binary trees, binary search trees, and tree traversal methods.',
    type: 'slide',
    topic: 'Trees',
    week: 3,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
    fileUrl: '/uploads/slides/binary-trees.pdf',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z',
    views: 189,
    downloads: 67
  },
  {
    id: 'theory-4',
    title: 'Graph Algorithms Notes',
    description: 'Detailed notes on BFS, DFS, Dijkstra algorithm, and minimum spanning trees.',
    type: 'notes',
    topic: 'Graphs',
    week: 4,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
    fileUrl: '/uploads/notes/graph-algorithms.md',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-03T16:00:00Z',
    views: 423,
    downloads: 234
  },
  {
    id: 'theory-5',
    title: 'Dynamic Programming Guide',
    description: 'Introduction to dynamic programming, memoization, tabulation, and solving optimization problems.',
    type: 'pdf',
    topic: 'Dynamic Programming',
    week: 5,
    thumbnail: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400',
    fileUrl: '/uploads/pdfs/dynamic-programming.pdf',
    createdAt: '2024-02-05T10:00:00Z',
    updatedAt: '2024-02-05T10:00:00Z',
    views: 276,
    downloads: 145
  },
  {
    id: 'theory-6',
    title: 'Sorting Algorithms Reference',
    description: 'Quick reference guide for all major sorting algorithms with complexity analysis.',
    type: 'reference',
    topic: 'Sorting',
    week: 2,
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
    fileUrl: '/uploads/reference/sorting-ref.pdf',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-12T09:00:00Z',
    views: 567,
    downloads: 321
  }
];

// Mock data for lab materials
const labMaterials = [
  {
    id: 'lab-1',
    title: 'linked_list_implementation.py',
    description: 'Complete implementation of singly and doubly linked lists with all operations.',
    language: 'python',
    difficulty: 'beginner',
    topic: 'Data Structures',
    week: 1,
    code: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
    
    def display(self):
        elements = []
        current = self.head
        while current:
            elements.append(current.data)
            current = current.next
        return elements`,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    downloads: 156
  },
  {
    id: 'lab-2',
    title: 'binary_search_tree.py',
    description: 'BST implementation with insert, delete, search, and traversal operations.',
    language: 'python',
    difficulty: 'intermediate',
    topic: 'Trees',
    week: 3,
    code: `class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None
    
    def insert(self, val):
        if not self.root:
            self.root = TreeNode(val)
            return
        self._insert_recursive(self.root, val)
    
    def _insert_recursive(self, node, val):
        if val < node.val:
            if node.left is None:
                node.left = TreeNode(val)
            else:
                self._insert_recursive(node.left, val)
        else:
            if node.right is None:
                node.right = TreeNode(val)
            else:
                self._insert_recursive(node.right, val)`,
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-26T14:00:00Z',
    downloads: 203
  },
  {
    id: 'lab-3',
    title: 'SortingAlgorithms.java',
    description: 'Java implementation of bubble sort, merge sort, and quick sort.',
    language: 'java',
    difficulty: 'intermediate',
    topic: 'Sorting',
    week: 2,
    code: `public class SortingAlgorithms {
    
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n-1; i++) {
            for (int j = 0; j < n-i-1; j++) {
                if (arr[j] > arr[j+1]) {
                    int temp = arr[j];
                    arr[j] = arr[j+1];
                    arr[j+1] = temp;
                }
            }
        }
    }
    
    public static void mergeSort(int[] arr, int l, int r) {
        if (l < r) {
            int m = l + (r - l) / 2;
            mergeSort(arr, l, m);
            mergeSort(arr, m + 1, r);
            merge(arr, l, m, r);
        }
    }
}`,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    downloads: 178
  },
  {
    id: 'lab-4',
    title: 'graph_traversal.py',
    description: 'Implementation of BFS and DFS graph traversal algorithms.',
    language: 'python',
    difficulty: 'advanced',
    topic: 'Graphs',
    week: 4,
    code: `from collections import deque

class Graph:
    def __init__(self):
        self.adjacency_list = {}
    
    def add_vertex(self, vertex):
        if vertex not in self.adjacency_list:
            self.adjacency_list[vertex] = []
    
    def add_edge(self, v1, v2):
        self.adjacency_list[v1].append(v2)
        self.adjacency_list[v2].append(v1)
    
    def bfs(self, start):
        visited = set()
        queue = deque([start])
        result = []
        
        while queue:
            vertex = queue.popleft()
            if vertex not in visited:
                visited.add(vertex)
                result.append(vertex)
                queue.extend(self.adjacency_list[vertex])
        
        return result
    
    def dfs(self, start, visited=None):
        if visited is None:
            visited = set()
        visited.add(start)
        result = [start]
        
        for neighbor in self.adjacency_list[start]:
            if neighbor not in visited:
                result.extend(self.dfs(neighbor, visited))
        
        return result`,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-02T11:00:00Z',
    downloads: 245
  },
  {
    id: 'lab-5',
    title: 'dynamic_programming.cpp',
    description: 'C++ solutions for classic DP problems: Fibonacci, Knapsack, and LCS.',
    language: 'cpp',
    difficulty: 'advanced',
    topic: 'Dynamic Programming',
    week: 5,
    code: `#include <iostream>
#include <vector>
using namespace std;

// Fibonacci with memoization
int fib(int n, vector<int>& memo) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];
    memo[n] = fib(n-1, memo) + fib(n-2, memo);
    return memo[n];
}

// 0/1 Knapsack
int knapsack(int W, vector<int>& wt, vector<int>& val, int n) {
    vector<vector<int>> dp(n+1, vector<int>(W+1, 0));
    
    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= W; w++) {
            if (wt[i-1] <= w)
                dp[i][w] = max(val[i-1] + dp[i-1][w-wt[i-1]], dp[i-1][w]);
            else
                dp[i][w] = dp[i-1][w];
        }
    }
    return dp[n][W];
}`,
    createdAt: '2024-02-05T10:00:00Z',
    updatedAt: '2024-02-06T15:00:00Z',
    downloads: 134
  },
  {
    id: 'lab-6',
    title: 'hash_table.ts',
    description: 'TypeScript hash table implementation with collision handling.',
    language: 'typescript',
    difficulty: 'intermediate',
    topic: 'Data Structures',
    week: 3,
    code: `class HashTable<K, V> {
    private buckets: Array<Array<[K, V]>>;
    private size: number;
    
    constructor(size: number = 53) {
        this.buckets = new Array(size).fill(null).map(() => []);
        this.size = size;
    }
    
    private hash(key: K): number {
        const str = String(key);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 31 + str.charCodeAt(i)) % this.size;
        }
        return hash;
    }
    
    set(key: K, value: V): void {
        const index = this.hash(key);
        const bucket = this.buckets[index];
        const existing = bucket.find(([k]) => k === key);
        if (existing) {
            existing[1] = value;
        } else {
            bucket.push([key, value]);
        }
    }
    
    get(key: K): V | undefined {
        const index = this.hash(key);
        const pair = this.buckets[index].find(([k]) => k === key);
        return pair ? pair[1] : undefined;
    }
}`,
    createdAt: '2024-01-28T10:00:00Z',
    updatedAt: '2024-01-29T09:00:00Z',
    downloads: 98
  }
];

/**
 * @route   GET /api/content/theory
 * @desc    Get all theory materials with optional filters
 * @access  Public
 */
router.get('/theory', (req: Request, res: Response) => {
  try {
    let materials = [...theoryMaterials];
    
    // Apply filters
    const { type, topic, week, search } = req.query;
    
    if (type && type !== 'all') {
      materials = materials.filter(m => m.type === type);
    }
    
    if (topic && topic !== 'all') {
      materials = materials.filter(m => m.topic.toLowerCase() === (topic as string).toLowerCase());
    }
    
    if (week) {
      materials = materials.filter(m => m.week === parseInt(week as string));
    }
    
    if (search) {
      const searchLower = (search as string).toLowerCase();
      materials = materials.filter(m => 
        m.title.toLowerCase().includes(searchLower) ||
        m.description.toLowerCase().includes(searchLower) ||
        m.topic.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({ success: true, materials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/content/theory/:id
 * @desc    Get theory material by ID
 * @access  Public
 */
router.get('/theory/:id', (req: Request, res: Response) => {
  try {
    const material = theoryMaterials.find(m => m.id === req.params.id);
    
    if (!material) {
      res.status(404).json({ success: false, message: 'Material not found' });
      return;
    }
    
    res.json({ success: true, material });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/content/theory
 * @desc    Create new theory material
 * @access  Private (Admin)
 */
router.post('/theory', (req: Request, res: Response) => {
  try {
    const newMaterial = {
      id: `theory-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      downloads: 0
    };
    
    theoryMaterials.push(newMaterial);
    res.status(201).json({ success: true, material: newMaterial });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/content/theory/:id
 * @desc    Update theory material
 * @access  Private (Admin)
 */
router.put('/theory/:id', (req: Request, res: Response) => {
  try {
    const index = theoryMaterials.findIndex(m => m.id === req.params.id);
    
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Material not found' });
      return;
    }
    
    theoryMaterials[index] = {
      ...theoryMaterials[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json({ success: true, material: theoryMaterials[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/content/theory/:id
 * @desc    Delete theory material
 * @access  Private (Admin)
 */
router.delete('/theory/:id', (req: Request, res: Response) => {
  try {
    const index = theoryMaterials.findIndex(m => m.id === req.params.id);
    
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Material not found' });
      return;
    }
    
    theoryMaterials.splice(index, 1);
    res.json({ success: true, message: 'Material deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/content/lab
 * @desc    Get all lab materials with optional filters
 * @access  Public
 */
router.get('/lab', (req: Request, res: Response) => {
  try {
    let materials = [...labMaterials];
    
    // Apply filters
    const { language, difficulty, topic, week, search } = req.query;
    
    if (language && language !== 'all') {
      materials = materials.filter(m => m.language === language);
    }
    
    if (difficulty && difficulty !== 'all') {
      materials = materials.filter(m => m.difficulty === difficulty);
    }
    
    if (topic && topic !== 'all') {
      materials = materials.filter(m => m.topic.toLowerCase() === (topic as string).toLowerCase());
    }
    
    if (week) {
      materials = materials.filter(m => m.week === parseInt(week as string));
    }
    
    if (search) {
      const searchLower = (search as string).toLowerCase();
      materials = materials.filter(m => 
        m.title.toLowerCase().includes(searchLower) ||
        m.description.toLowerCase().includes(searchLower) ||
        m.topic.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({ success: true, materials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/content/lab/:id
 * @desc    Get lab material by ID
 * @access  Public
 */
router.get('/lab/:id', (req: Request, res: Response) => {
  try {
    const material = labMaterials.find(m => m.id === req.params.id);
    
    if (!material) {
      res.status(404).json({ success: false, message: 'Material not found' });
      return;
    }
    
    res.json({ success: true, material });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/content/lab
 * @desc    Create new lab material
 * @access  Private (Admin)
 */
router.post('/lab', (req: Request, res: Response) => {
  try {
    const newMaterial = {
      id: `lab-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      downloads: 0
    };
    
    labMaterials.push(newMaterial as any);
    res.status(201).json({ success: true, material: newMaterial });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/content/lab/:id
 * @desc    Update lab material
 * @access  Private (Admin)
 */
router.put('/lab/:id', (req: Request, res: Response) => {
  try {
    const index = labMaterials.findIndex(m => m.id === req.params.id);
    
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Material not found' });
      return;
    }
    
    labMaterials[index] = {
      ...labMaterials[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json({ success: true, material: labMaterials[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/content/lab/:id
 * @desc    Delete lab material
 * @access  Private (Admin)
 */
router.delete('/lab/:id', (req: Request, res: Response) => {
  try {
    const index = labMaterials.findIndex(m => m.id === req.params.id);
    
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Material not found' });
      return;
    }
    
    labMaterials.splice(index, 1);
    res.json({ success: true, message: 'Material deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/content/stats
 * @desc    Get content statistics
 * @access  Public
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = {
      totalTheory: theoryMaterials.length,
      totalLab: labMaterials.length,
      totalViews: theoryMaterials.reduce((sum, m) => sum + (m.views || 0), 0),
      totalDownloads: 
        theoryMaterials.reduce((sum, m) => sum + (m.downloads || 0), 0) +
        labMaterials.reduce((sum, m) => sum + (m.downloads || 0), 0),
      recentUploads: 5
    };
    
    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/content/topics
 * @desc    Get all unique topics
 * @access  Public
 */
router.get('/topics', (req: Request, res: Response) => {
  try {
    const topics = new Set<string>();
    
    theoryMaterials.forEach(m => topics.add(m.topic));
    labMaterials.forEach(m => topics.add(m.topic));
    
    res.json({ success: true, topics: Array.from(topics) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export { router as contentRoutes };
