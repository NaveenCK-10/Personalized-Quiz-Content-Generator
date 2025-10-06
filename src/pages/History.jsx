import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  collection, query, orderBy, getDocs, limit, startAfter, where,
  writeBatch, doc, deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  BookOpen, HelpCircle, Loader2, Search, Trash, X, CheckSquare, ExternalLink,
  Repeat, ArrowLeft, ChevronRight, ChevronLeft, Layers, FileText
} from 'lucide-react';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

// ---------- Hooks & utils ----------
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
};

const useInfiniteScroll = (fetchMoreData, hasMore, isLoading) => {
  const observer = useRef(null);
  return useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) fetchMoreData();
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, fetchMoreData]
  );
};

const groupAndFormatHistory = (history) => {
  const groups = { Today: [], Yesterday: [], 'This Week': [], 'This Month': [], Older: [] };
  history.forEach((item) => {
    if (!item.createdAt) return;
    const date = item.createdAt.toDate();
    if (isToday(date)) groups.Today.push(item);
    else if (isYesterday(date)) groups.Yesterday.push(item);
    else if (isThisWeek(date, { weekStartsOn: 1 })) groups['This Week'].push(item);
    else if (date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear()) {
      groups['This Month'].push(item);
    } else {
      groups.Older.push(item);
    }
  });
  Object.keys(groups).forEach((k) => { if (groups[k].length === 0) delete groups[k]; });
  return groups;
};

// ---------- Component ----------
export default function History() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 450);

  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState({ field: 'createdAt', direction: 'desc' });

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Drawer
  const [openItem, setOpenItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [flashIndex, setFlashIndex] = useState(0);

  // Guards to prevent fetch loops
  const inflightRef = useRef(false);
  const lastErrorRef = useRef(null);

  const PAGE_SIZE = 15;

  // Reduce index needs: when searching, always sort by title asc
  useEffect(() => {
    if (debouncedSearchQuery && (sortBy.field !== 'title' || sortBy.direction !== 'asc')) {
      setSortBy({ field: 'title', direction: 'asc' });
    }
  }, [debouncedSearchQuery, sortBy.field, sortBy.direction]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  // Fetch
  const fetchHistory = useCallback(
    async (isNewQuery = false) => {
      if (inflightRef.current) return;
      if (lastErrorRef.current) return;
      if (!user || (!hasMore && !isNewQuery)) return;

      inflightRef.current = true;
      setLoading(true);
      if (isNewQuery) {
        setHistory([]);
        setLastDoc(null);
        setHasMore(true);
      }
      try {
        const baseCol = collection(db, 'users', user.uid, 'history');
        const filters = [];
        if (filterType !== 'all') filters.push(where('type', '==', filterType));
        if (debouncedSearchQuery) {
          filters.push(where('title', '>=', debouncedSearchQuery));
          filters.push(where('title', '<=', debouncedSearchQuery + '\uf8ff'));
        }

        let qy = query(baseCol, ...filters, orderBy(sortBy.field, sortBy.direction), limit(PAGE_SIZE));
        if (!isNewQuery && lastDoc) qy = query(qy, startAfter(lastDoc));

        const snap = await getDocs(qy);
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        setHistory((prev) => (isNewQuery ? rows : [...prev, ...rows]));
        setLastDoc(snap.docs[snap.docs.length - 1] || null);
        setHasMore(snap.docs.length === PAGE_SIZE);
        lastErrorRef.current = null;
      } catch (e) {
        console.error('Error fetching history:', e);
        lastErrorRef.current = e; // stop the loop until filters/sort/search change
      } finally {
        setLoading(false);
        inflightRef.current = false;
      }
    },
    [user, lastDoc, hasMore, debouncedSearchQuery, filterType, sortBy]
  );

  // Clear last error when inputs change to retry
  useEffect(() => {
    lastErrorRef.current = null;
    if (user) fetchHistory(true);
  }, [debouncedSearchQuery, filterType, sortBy, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const lastElementRef = useInfiniteScroll(fetchHistory, hasMore, loading);

  const groupedHistory = useMemo(() => groupAndFormatHistory(history), [history]);

  // Selection
  const toggleSelection = (id) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0 || !user) return;
    if (!window.confirm(`Delete ${selectedItems.size} item(s)?`)) return;
    try {
      const batch = writeBatch(db);
      selectedItems.forEach((id) => batch.delete(doc(db, 'users', user.uid, 'history', id)));
      await batch.commit();
      setHistory((prev) => prev.filter((it) => !selectedItems.has(it.id)));
      setSelectedItems(new Set());
      setSelectionMode(false);
    } catch (e) {
      console.error('Bulk delete failed:', e);
    }
  };

  const handleClearAll = async () => {
    if (!user) return;
    if (!window.confirm('Delete ALL history items? This cannot be undone.')) return;
    try {
      const snap = await getDocs(collection(db, 'users', user.uid, 'history'));
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      setHistory([]);
      setHasMore(false);
      setLastDoc(null);
      setSelectedItems(new Set());
      setSelectionMode(false);
    } catch (e) {
      console.error('Clear all failed:', e);
    }
  };

  // Single delete
  const handleDelete = async (id) => {
    if (!user) return;
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'history', id));
      setHistory((prev) => prev.filter((it) => it.id !== id));
      if (openItem?.id === id) {
        setDrawerOpen(false);
        setOpenItem(null);
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  // Drawer
  const openDrawer = (item) => {
    setOpenItem(item);
    setFlashIndex(0);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setOpenItem(null), 180);
  };

  // Re-run route handoff
  const reRunGeneration = (item) => {
    navigate('/dashboard', {
      state: {
        type: item.type,
        sourceText: item.sourceText || '',
        quizData: item.quizData || null,
        explanationText: item.explanationText || '',
        flashcardsData: item.flashcardsData || null,
        mindMapData: item.mindMapData || null,
        action: 'rehydrate',
        fromHistoryId: item.id,
      },
      replace: false,
    });
  };

  return (
    <div className="min-h-screen text-white font-sans bg-gradient-to-br from-purple-900 via-black to-pink-900">
      <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-5xl pt-32">
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-shadow-lg text-center md:text-left">
          Your Learning History
        </h1>

        {/* Controls */}
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
              {['all', 'quiz', 'explanation', 'flashcards', 'mindmap'].map((type) => (
                <button
                  key={type}
                  className={`flex-1 py-1 px-4 rounded-full font-medium transition-colors capitalize ${
                    filterType === type ? 'bg-pink-500 text-white' : 'text-pink-200 hover:bg-white/20'
                  }`}
                  onClick={() => setFilterType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-pink-200">
              <span>Sort by:</span>
              <select
                value={`${sortBy.field}-${sortBy.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortBy({ field, direction });
                }}
                className="bg-transparent border-0 rounded-md focus:ring-2 focus:ring-pink-400"
              >
                <option value="createdAt-desc" className="bg-purple-800">Date: Newest</option>
                <option value="createdAt-asc" className="bg-purple-800">Date: Oldest</option>
                <option value="title-asc" className="bg-purple-800">Title: A-Z</option>
                <option value="title-desc" className="bg-purple-800">Title: Z-A</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectionMode(!selectionMode)}
                className={`text-sm font-semibold py-1 px-4 rounded-full transition-colors flex items-center gap-2 ${
                  selectionMode ? 'bg-pink-500' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {selectionMode ? <X size={16} /> : <CheckSquare size={16} />}
                {selectionMode ? 'Cancel' : 'Select'}
              </button>

              <button
                onClick={handleClearAll}
                className="text-sm font-semibold py-1 px-4 rounded-full bg-red-600/80 hover:bg-red-600 text-white"
              >
                Clear All
              </button>
            </div>
          </div>

          {selectionMode && (
            <div className="mt-4 p-3 bg-pink-900/50 rounded-lg flex justify-between items-center">
              <span className="font-semibold">{selectedItems.size} selected</span>
              <button
                onClick={handleBulkDelete}
                disabled={selectedItems.size === 0}
                className="bg-red-500 text-white py-1 px-4 rounded-full text-sm font-bold disabled:bg-red-800 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Trash size={16} /> Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Groups */}
        {history.length === 0 && !loading ? (
          <div className="text-center py-16">
            <BookOpen size={48} className="mx-auto text-pink-400/50 mb-4" />
            <h3 className="text-xl font-semibold">No History Found</h3>
            <p className="text-pink-200/70">Your generated items will appear here.</p>
          </div>
        ) : (
          Object.entries(groupedHistory).map(([groupTitle, items], gIdx, entries) => (
            <div key={groupTitle} className="mb-8">
              <h2 className="text-xl font-bold text-pink-300 pb-2 mb-4 border-b-2 border-white/20">{groupTitle}</h2>
              <div className="space-y-4">
                {items.map((item, idx) => {
                  const giveRef = gIdx === entries.length - 1 && idx === items.length - 1;
                  return (
                    <div
                      ref={giveRef ? lastElementRef : null}
                      key={item.id}
                      className={`bg-white/10 backdrop-blur-xl p-4 rounded-lg shadow-md border border-white/20 flex items-center justify-between transition-colors duration-200 ${
                        selectionMode ? 'pl-2' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-grow min-w-0">
                        {selectionMode && (
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={() => toggleSelection(item.id)}
                            className="w-5 h-5 mr-1 accent-pink-500 bg-transparent rounded border-pink-400 focus:ring-pink-500"
                          />
                        )}
                        {item.type === 'quiz' ? (
                          <HelpCircle className="text-pink-400 shrink-0" />
                        ) : item.type === 'explanation' ? (
                          <FileText className="text-purple-300 shrink-0" />
                        ) : item.type === 'flashcards' ? (
                          <Layers className="text-yellow-300 shrink-0" />
                        ) : (
                          <BookOpen className="text-purple-400 shrink-0" />
                        )}

                        <div className="min-w-0">
                          <p className="font-semibold truncate max-w-[45vw] sm:max-w-[32rem]">{item.title}</p>
                          <p className="text-sm text-pink-200/80">
                            {item.createdAt && formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true })}
                            {item.score !== undefined && ` · Score: ${item.score}/${item.questions}`}
                            {item.type && ` · ${item.type}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDrawer(item)}
                          className="text-pink-200 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                          title="Open"
                        >
                          <ExternalLink size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/10"
                          aria-label="Delete"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
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
          <p className="text-center text-pink-200/60 mt-8 text-sm">You’ve reached the end of your history.</p>
        )}

        {lastErrorRef.current && (
          <div className="mt-8 bg-red-500/15 border border-red-500/40 text-red-200 p-4 rounded-xl">
            <p className="font-semibold">Could not load history.</p>
            <p className="text-sm mt-1">
              A Firestore index may be missing. Use the “Create index” link shown in the console, wait for it to build, then retry.
            </p>
          </div>
        )}
      </div>

      {/* Right drawer */}
      {drawerOpen && openItem && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-[#1c0f1c] border-l border-white/10 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <button onClick={closeDrawer} className="p-2 rounded-full hover:bg-white/10" aria-label="Close">
                  <ArrowLeft size={18} />
                </button>
                <h3 className="font-bold truncate max-w-[70vw] sm:max-w-[22rem]">
                  {openItem.title || 'History Item'}
                </h3>
              </div>
              <button
                onClick={() => reRunGeneration(openItem)}
                className="text-sm bg-pink-600/90 hover:bg-pink-600 text-white px-3 py-1 rounded-full flex items-center gap-1"
                title="Re-run with same context"
              >
                <Repeat size={14} /> Re-run
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {openItem.type === 'explanation' && (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>
                    {openItem.explanationText || '_No explanation text saved._'}
                  </ReactMarkdown>
                </div>
              )}

              {openItem.type === 'quiz' && (
                <div className="space-y-4">
                  {!openItem.quizData && <p className="text-sm text-pink-200/70">No quiz payload saved.</p>}
                  {openItem.quizData && (
                    <>
                      <p className="text-pink-200/80 text-sm">
                        Quick practice mode (answers are hidden until reveal).
                      </p>
                      {openItem.quizData.questions?.map((q, idx) => (
                        <details key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <summary className="cursor-pointer font-semibold">
                            Q{idx + 1}. {q.questionText}
                          </summary>
                          <ul className="mt-2 space-y-1 text-sm">
                            {q.options?.map((opt, i) => (
                              <li
                                key={i}
                                className={`px-2 py-1 rounded ${
                                  i === q.correctAnswerIndex
                                    ? 'bg-green-500/20 border border-green-500/30'
                                    : 'bg-white/5'
                                }`}
                              >
                                {opt}
                              </li>
                            ))}
                          </ul>
                          {q.explanation && (
                            <p className="mt-2 text-pink-200/80 text-sm">
                              Explanation: {q.explanation}
                            </p>
                          )}
                        </details>
                      ))}
                    </>
                  )}
                </div>
              )}

              {openItem.type === 'flashcards' && (
                <div className="space-y-4">
                  {!openItem.flashcardsData && (
                    <p className="text-sm text-pink-200/70">No flashcards payload saved.</p>
                  )}
                  {openItem.flashcardsData && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="font-semibold mb-2">{openItem.flashcardsData.title}</p>
                      {openItem.flashcardsData.flashcards?.length ? (
                        <div className="flex items-center justify-between gap-3">
                          <button
                            className="p-2 rounded hover:bg-white/10"
                            onClick={() => setFlashIndex((i) => Math.max(0, i - 1))}
                          >
                            <ChevronLeft />
                          </button>
                          <div className="flex-1 text-center">
                            <p className="text-sm text-pink-200/80">
                              {flashIndex + 1} / {openItem.flashcardsData.flashcards.length}
                            </p>
                            <div className="mt-2 bg-black/20 rounded-lg p-3">
                              <p className="font-semibold">
                                {openItem.flashcardsData.flashcards[flashIndex].question}
                              </p>
                              <details className="mt-2">
                                <summary className="cursor-pointer text-pink-300">Show answer</summary>
                                <p className="text-sm">
                                  {openItem.flashcardsData.flashcards[flashIndex].answer}
                                </p>
                              </details>
                            </div>
                          </div>
                          <button
                            className="p-2 rounded hover:bg-white/10"
                            onClick={() =>
                              setFlashIndex((i) =>
                                Math.min(openItem.flashcardsData.flashcards.length - 1, i + 1)
                              )
                            }
                          >
                            <ChevronRight />
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-pink-200/70">No cards.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {openItem.type === 'mindmap' && (
                <div className="space-y-3">
                  {!openItem.mindMapData && <p className="text-sm text-pink-200/70">No mind map payload saved.</p>}
                  {openItem.mindMapData && (
                    <>
                      <p className="font-semibold">{openItem.mindMapData.title}</p>
                      <div className="space-y-2">
                        {openItem.mindMapData.nodes?.map((n) => (
                          <div key={n.id} className="bg-white/5 p-2 rounded border border-white/10">
                            <p className="font-semibold">
                              {n.label} <span className="text-xs text-pink-300">lvl {n.level}</span>
                            </p>
                            {n.parentId && <p className="text-xs text-pink-200/70">parent: {n.parentId}</p>}
                            {n.description && <p className="text-sm">{n.description}</p>}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {!['explanation', 'quiz', 'flashcards', 'mindmap'].includes(openItem.type) && (
                <p className="text-sm text-pink-200/70">Unsupported type or missing payload.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .text-shadow-lg { text-shadow: 0 0 20px rgba(236, 72, 153, 0.5); }
      `}</style>
    </div>
  );
}
