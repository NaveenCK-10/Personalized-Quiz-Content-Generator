import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, orderBy, getDocs, limit, startAfter, where, writeBatch, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { BookOpen, HelpCircle, Loader2, Search, Trash, X, CheckSquare, CornerDownLeft, SortAsc, SortDesc } from 'lucide-react';
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';

// --- NEW: Custom hook for debouncing input ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// --- Custom hook for infinite scrolling (Unchanged) ---
const useInfiniteScroll = (fetchMoreData, hasMore, isLoading) => {
    const observer = React.useRef(null);
    return useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchMoreData();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore, fetchMoreData]);
};

// --- UPDATED: Advanced date formatting and grouping utility ---
const groupAndFormatHistory = (history) => {
  const groups = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    'This Month': [],
    Older: [],
  };

  history.forEach(item => {
    if (!item.createdAt) return;
    const date = item.createdAt.toDate();
    if (isToday(date)) groups.Today.push(item);
    else if (isYesterday(date)) groups.Yesterday.push(item);
    else if (isThisWeek(date, { weekStartsOn: 1 })) groups['This Week'].push(item);
    else if (date.getMonth() === new Date().getMonth()) groups['This Month'].push(item);
    else groups.Older.push(item);
  });

  // Filter out empty groups
  for (const key in groups) {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  }
  return groups;
};


export default function History() {
  const [user] = useAuthState(auth);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounce with 500ms delay
  
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState({ field: 'createdAt', direction: 'desc' });
  
  // --- NEW: State for bulk actions ---
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const PAGE_SIZE = 15;

  // --- UPDATED: The main data fetching function ---
  const fetchHistory = useCallback(async (isNewQuery = false) => {
    if (!user || (!hasMore && !isNewQuery)) return;

    setLoading(true);
    if (isNewQuery) {
        setHistory([]);
        setLastDoc(null);
        setHasMore(true);
    }
    
    try {
        let baseQuery = collection(db, 'users', user.uid, 'history');
        let q;

        // Apply filters and search
        const filters = [];
        if (filterType !== 'all') {
            filters.push(where('type', '==', filterType));
        }
        if (debouncedSearchQuery) {
            filters.push(where('title', '>=', debouncedSearchQuery));
            filters.push(where('title', '<=', debouncedSearchQuery + '\uf8ff'));
        }

        q = query(baseQuery, ...filters, orderBy(sortBy.field, sortBy.direction), limit(PAGE_SIZE));
        
        // Handle pagination
        if (!isNewQuery && lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        const querySnapshot = await getDocs(q);
        const newHistoryData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setHistory(prev => isNewQuery ? newHistoryData : [...prev, ...newHistoryData]);
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === PAGE_SIZE);

    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  }, [user, lastDoc, hasMore, debouncedSearchQuery, filterType, sortBy]);

  // Effect to trigger a fresh fetch when query parameters change
  useEffect(() => {
    if(user) fetchHistory(true);
  }, [debouncedSearchQuery, filterType, sortBy, user]);


  const lastElementRef = useInfiniteScroll(fetchHistory, hasMore, loading);

  // --- NEW: Handlers for bulk selection ---
  const toggleSelection = (id) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0 || !user) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) return;

    try {
      const batch = writeBatch(db);
      selectedItems.forEach(id => {
        const docRef = doc(db, 'users', user.uid, 'history', id);
        batch.delete(docRef);
      });
      await batch.commit();

      setHistory(prev => prev.filter(item => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
      setSelectionMode(false);
    } catch (err) {
      console.error("Error performing bulk delete:", err);
    }
  };


  const handleDelete = async (id) => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await doc(db, 'users', user.uid, 'history', id).delete();
      setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };
  
  // --- NEW: Grouped history for rendering ---
  const groupedHistory = useMemo(() => groupAndFormatHistory(history), [history]);

  return (
    <div className="min-h-screen text-white font-sans bg-gradient-to-br from-purple-900 via-black to-pink-900">
      <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl pt-32">
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-shadow-lg text-center md:text-left">Your Learning History</h1>
        
        {/* --- UPDATED: Search and Filter Bar --- */}
        <div className="sticky top-20 bg-black/30 backdrop-blur-lg p-4 rounded-xl z-10 mb-8 border border-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by title..."
                        className="w-full pl-10 pr-4 py-2 rounded-full bg-white/10 text-white placeholder-pink-200/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex w-full sm:w-auto rounded-full bg-white/10 p-1 text-sm">
                    {['all', 'quiz', 'explanation'].map(type => (
                        <button key={type} className={`flex-1 py-1 px-4 rounded-full font-medium transition-colors capitalize ${filterType === type ? 'bg-pink-500 text-white' : 'text-pink-200 hover:bg-white/20'}`} onClick={() => setFilterType(type)}>
                            {type}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* --- NEW: Sort and Bulk Action Controls --- */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
                <div className="flex items-center gap-2 text-sm text-pink-200">
                    <span>Sort by:</span>
                    <select value={`${sortBy.field}-${sortBy.direction}`} onChange={(e) => {
                        const [field, direction] = e.target.value.split('-');
                        setSortBy({ field, direction });
                    }} className="bg-transparent border-0 rounded-md focus:ring-2 focus:ring-pink-400">
                        <option value="createdAt-desc" className="bg-purple-800">Date: Newest</option>
                        <option value="createdAt-asc" className="bg-purple-800">Date: Oldest</option>
                        <option value="title-asc" className="bg-purple-800">Title: A-Z</option>
                        <option value="title-desc" className="bg-purple-800">Title: Z-A</option>
                    </select>
                </div>
                 <button onClick={() => setSelectionMode(!selectionMode)} className={`text-sm font-semibold py-1 px-4 rounded-full transition-colors flex items-center gap-2 ${selectionMode ? 'bg-pink-500' : 'bg-white/20 hover:bg-white/30'}`}>
                    {selectionMode ? <X size={16}/> : <CheckSquare size={16}/>}
                    {selectionMode ? 'Cancel' : 'Select'}
                </button>
            </div>

            {selectionMode && (
                <div className="mt-4 p-3 bg-pink-900/50 rounded-lg flex justify-between items-center">
                    <span className="font-semibold">{selectedItems.size} items selected</span>
                    <button onClick={handleBulkDelete} disabled={selectedItems.size === 0} className="bg-red-500 text-white py-1 px-4 rounded-full text-sm font-bold disabled:bg-red-800 disabled:cursor-not-allowed flex items-center gap-2">
                        <Trash size={16}/> Delete Selected
                    </button>
                </div>
            )}
        </div>


        {/* --- UPDATED: Rendering Logic with Date Grouping --- */}
        {history.length === 0 && !loading ? (
          <div className="text-center py-16">
            <BookOpen size={48} className="mx-auto text-pink-400/50 mb-4" />
            <h3 className="text-xl font-semibold">No History Found</h3>
            <p className="text-pink-200/70">Your generated quizzes and explanations will appear here.</p>
          </div>
        ) : (
            Object.entries(groupedHistory).map(([groupTitle, items]) => (
                <div key={groupTitle} className="mb-8">
                    <h2 className="text-xl font-bold text-pink-300 pb-2 mb-4 border-b-2 border-white/20">{groupTitle}</h2>
                    <div className="space-y-4">
                        {items.map((item, index) => {
                            const isLastItem = history.length < PAGE_SIZE ? index === items.length - 1 && groupTitle === Object.keys(groupedHistory)[Object.keys(groupedHistory).length - 1] : index === items.length - 1;
                            return (
                                <div ref={isLastItem ? lastElementRef : null} key={item.id} className={`bg-white/10 backdrop-blur-xl p-4 rounded-lg shadow-md border border-white/20 flex items-center justify-between transition-all duration-300 ${selectionMode ? 'pl-2' : ''}`}>
                                    {selectionMode && (
                                        <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => toggleSelection(item.id)} className="w-5 h-5 mr-4 accent-pink-500 bg-transparent rounded border-pink-400 focus:ring-pink-500"/>
                                    )}
                                    <div className="flex items-center gap-4 flex-grow">
                                        {item.type === 'quiz' ? <HelpCircle className="text-pink-400" /> : <BookOpen className="text-purple-400" />}
                                        <div>
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="text-sm text-pink-200/80">
                                                {item.createdAt && formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true })}
                                                {item.score !== undefined && ` - Score: ${item.score}/${item.questions}`}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/10" aria-label="Delete history item">
                                        <Trash size={18} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))
        )}

        {loading && (
          <div className="flex justify-center items-center h-24 mt-8">
            <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
          </div>
        )}
        
        {!loading && history.length > 0 && !hasMore && (
          <p className="text-center text-pink-200/60 mt-8 text-sm">You've reached the end of your history.</p>
        )}

      </div>
      <style jsx>{`.text-shadow-lg { text-shadow: 0 0 20px rgba(236, 72, 153, 0.5); }`}</style>
    </div>
  );
}