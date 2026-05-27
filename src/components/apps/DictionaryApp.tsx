import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Volume2, X } from 'lucide-react';

interface Meaning {
  partOfSpeech: string;
  definitions: { definition: string; example?: string }[];
}

interface Entry {
  word: string;
  phonetic?: string;
  phonetics: { text?: string; audio?: string }[];
  meanings: Meaning[];
}

export function DictionaryApp() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Entry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query.trim())}`);
      if (!res.ok) throw new Error('Word not found');
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (url: string) => {
    new Audio(url).play().catch(() => {});
  };

  const clearQuery = () => {
    setQuery('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-primary">Dictionary</h1>
        <div className="flex items-center space-x-2 w-full max-w-xl">
          <Input
            placeholder="Look up a word..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            className="flex-1"
          />
          {query && (
            <Button variant="outline" size="icon" onClick={clearQuery} aria-label="Clear input">
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button onClick={search} disabled={loading} className="ml-2">
            {loading ? (
              <div className="border-2 border-gray-300 border-t-transparent rounded-full w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6 max-w-4xl mx-auto">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center my-8">
            <div className="border-4 border-gray-300 border-t-transparent rounded-full w-8 h-8 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4" role="alert">
            <p className="flex items-center space-x-2">
              <X className="w-4 h-4" />
              <span>{error}</span>
            </p>
          </div>
        )}

        {/* No result placeholder */}
        {!result && !loading && !error && (
          <p className="text-center text-muted-foreground mt-8">Enter a word to see its definition</p>
        )}

        {/* Results */}
        {result?.map((entry, i) => (
          <div
            key={i}
            className="bg-white shadow-md rounded-lg p-6 mb-8 transition-transform hover:scale-105"
          >
            {/* Word & Phonetic */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-3xl font-extrabold text-primary">{entry.word}</h2>
                {entry.phonetic && (
                  <span className="text-sm text-muted-foreground">/{entry.phonetic}/</span>
                )}
              </div>
              {/* Audio Button */}
              {entry.phonetics.find((p) => p.audio) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const audioUrl = entry.phonetics.find((p) => p.audio)?.audio!;
                    playAudio(audioUrl);
                  }}
                  aria-label="Play pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Meanings */}
            {entry.meanings.map((meaning, j) => (
              <div key={j} className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="bg-primary text-white text-xs font-semibold px-2 py-1 rounded uppercase tracking-wide">
                    {meaning.partOfSpeech}
                  </div>
                </div>
                <ol className="list-decimal list-inside space-y-2">
                  {meaning.definitions.slice(0, 5).map((def, k) => (
                    <li key={k} className="text-sm text-gray-800">
                      {def.definition}
                      {def.example && (
                        <div className="ml-4 text-xs italic text-gray-500 mt-1">
                          "{def.example}"
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}