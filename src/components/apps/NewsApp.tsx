import { useEffect, useState, useRef } from 'react';
import { motion } from "framer-motion";
import { Search, RefreshCw, ExternalLink } from 'lucide-react';

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: { name: string };
}

export function NewsApp() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filtered, setFiltered] = useState<Article[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const seenUrls = useRef<Set<string>>(new Set());

  // 🔥 FETCH
  const fetchNews = async (reset = false) => {
    try {
      setLoading(true);

      const res = await fetch(
        `https://the-big-issue-latest-news-from-india.onrender.com/news?page=${page}`
      );

      const data = await res.json();
      let newArticles: Article[] = data.articles || [];

      // 🚫 Remove duplicates
      newArticles = newArticles.filter(a => {
        if (seenUrls.current.has(a.url)) return false;
        seenUrls.current.add(a.url);
        return true;
      });

      if (reset) {
        seenUrls.current.clear();
        newArticles.forEach(a => seenUrls.current.add(a.url));
        setArticles(newArticles);
      } else {
        setArticles(prev => [...prev, ...newArticles]);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchNews(true);
  }, []);

  useEffect(() => {
    if (page > 1) fetchNews();
  }, [page]);

  // ♾️ Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading) {
        setPage(prev => prev + 1);
      }
    });

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading]);

  // 🔍 Search
  useEffect(() => {
    setFiltered(
      articles.filter(a =>
        a.title.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, articles]);

  return (
    <div className="relative h-full text-white overflow-hidden">

      {/* 🌈 Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617]" />
      <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-purple-500/20 blur-[150px]" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-blue-500/20 blur-[150px]" />

      {/* HEADER */}
      <div className="relative p-4 flex justify-between items-center border-b border-white/10 bg-white/5 backdrop-blur-xl">

        <h1 className="text-lg font-semibold flex items-center gap-2">
          📰 The Big Issue
        </h1>

        <div className="flex gap-2">

          {/* SEARCH */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl 
          bg-white/10 border border-white/20 backdrop-blur-md">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              placeholder="Search news..."
              className="bg-transparent outline-none text-xs w-40"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* REFRESH */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              seenUrls.current.clear();
              setPage(1);
              fetchNews(true);
            }}
            className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </motion.button>

        </div>
      </div>

      {/* MAIN */}
      <div className="relative p-6 overflow-y-auto h-[calc(100%-70px)]">

        {/* 🦴 Skeleton */}
        {loading && articles.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-44 bg-white/10 rounded-xl mb-3"></div>
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* FEATURED */}
        {filtered[0] && (
          <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={() => setSelected(filtered[0])}
            className="relative mb-8 rounded-3xl overflow-hidden cursor-pointer shadow-2xl"
          >
            <img
              src={filtered[0].urlToImage || "https://picsum.photos/1200/500"}
              className="w-full h-72 object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-end">
              <h2 className="text-2xl font-bold">
                {filtered[0].title}
              </h2>
              <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                {filtered[0].description}
              </p>
            </div>
          </motion.div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(1).map((a, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group rounded-2xl overflow-hidden 
              bg-white/5 border border-white/10 backdrop-blur-xl
              shadow-lg hover:shadow-2xl cursor-pointer"
              onClick={() => setSelected(a)}
            >
              <img
                src={a.urlToImage || "https://picsum.photos/400/250"}
                className="w-full h-44 object-cover group-hover:scale-105 transition"
              />

              <div className="p-4">
                <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-blue-400 transition">
                  {a.title}
                </h3>

                <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                  {a.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ♾️ Loading */}
        <div ref={observerRef} className="text-center mt-6 text-xs text-gray-400">
          {loading ? (
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              Loading more...
            </motion.span>
          ) : "Scroll for more"}
        </div>

      </div>

      {/* MODAL */}
      {selected && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">

          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-[#020617]/90 border border-white/10 rounded-2xl max-w-3xl w-full p-6"
          >
            <img
              src={selected.urlToImage || "https://picsum.photos/800/400"}
              className="w-full h-64 object-cover rounded-xl mb-4"
            />

            <h1 className="text-xl font-bold mb-3">{selected.title}</h1>

            <p className="text-sm text-gray-300 mb-5">
              {selected.description}
            </p>

            <div className="flex gap-3">
              <a
                href={selected.url}
                target="_blank"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-sm flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Read Full
              </a>

              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-white/10 rounded-lg text-sm"
              >
                Close
              </button>
            </div>
          </motion.div>

        </div>
      )}
    </div>
  );
}