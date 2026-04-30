import { useState, useRef, useEffect } from 'react';
import { Search, Activity, RefreshCw, BarChart2, Briefcase, Zap } from 'lucide-react';
import { generateStockReport } from './lib/gemini';
import { ReportViewer } from './components/ReportViewer';

export default function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState<string | null>(null);
  const reportEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of report while streaming, but only if user is near bottom
  useEffect(() => {
    if (isLoading && report) {
      reportEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [report, isLoading]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setReport('');

    try {
      await generateStockReport(query, (chunk) => {
        setReport((prev) => prev + chunk);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the report.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-finance-bg text-finance-text flex flex-col font-sans selection:bg-finance-primary selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-finance-bg/90 backdrop-blur-md border-b border-finance-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <Activity className="w-6 h-6 text-finance-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 uppercase">
              Stock<span className="text-finance-primary">Saathi</span>
              <span className="skew-badge text-[10px] ml-2">BETA</span>
            </h1>
          </div>
          <div className="hidden sm:flex text-[10px] uppercase tracking-widest text-finance-text-dim font-sans items-center gap-4">
            <span className="flex items-center gap-1"><BarChart2 className="w-4 h-4 text-finance-primary" /> NSE / BSE</span>
            <span className="flex items-center gap-1"><Briefcase className="w-4 h-4 text-finance-primary" /> Institutional Grade</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center">
        
        {/* Hero / Search Section */}
        <div className={`w-full transition-all duration-700 ease-in-out flex flex-col items-center ${report || isLoading ? 'mt-0 mb-8' : 'mt-[20vh] mb-0'}`}>
          {!report && !isLoading && (
            <div className="text-center mb-10">
              <h2 className="text-5xl md:text-7xl title-brutalist mb-4 text-finance-primary">
                INDIAN EQUITY<br />RESEARCH ENGINE
              </h2>
              <p className="text-finance-text-dim text-sm md:text-base max-w-2xl mx-auto tracking-wide uppercase mt-6">
                Enter a company name or ticker to generate an elite, data-rich analysis integrating real-time market data, technicals, and deep fundamentals.
              </p>
            </div>
          )}

          <div className="w-full max-w-3xl relative">
            <form onSubmit={handleSearch} className="relative flex items-center bg-finance-card border border-finance-border rounded overflow-hidden focus-within:border-finance-primary transition-all">
              <div className="pl-5 text-finance-primary">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter ticker (e.g. RELIANCE, TCS)..."
                className="w-full bg-transparent border-none text-white px-4 py-5 text-lg uppercase focus:outline-none focus:ring-0 placeholder-finance-text-dim font-bold"
                disabled={isLoading}
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="px-8 py-5 bg-finance-primary hover:bg-[#b8e600] text-black font-black uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border-l border-finance-border"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analyzing</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </form>
          </div>
          
          {!report && !isLoading && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ITC', 'ZOMATO'].map(ticker => (
                <button
                  key={ticker}
                  onClick={() => {
                    setQuery(ticker);
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) form.requestSubmit();
                    }, 50);
                  }}
                  className="px-4 py-2 border border-finance-border bg-finance-card hover:border-finance-primary hover:text-finance-primary text-finance-text-dim font-bold text-xs uppercase tracking-widest transition-colors rounded"
                >
                  {ticker}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="w-full max-w-4xl bg-[#1a0f0f] border border-finance-down rounded p-6 mb-8 text-finance-text">
            <h3 className="text-lg font-bold text-finance-down mb-2 flex items-center gap-2 uppercase tracking-wide">
              <Activity className="w-5 h-5" /> Analysis Failed
            </h3>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading Indicator for start of stream */}
        {isLoading && !report && (
          <div className="w-full max-w-4xl py-20 flex flex-col items-center justify-center text-finance-text-dim">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-t-2 border-finance-primary rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-r-2 border-finance-border rounded-full animate-spin animation-delay-150"></div>
              <Activity className="absolute inset-0 m-auto w-6 h-6 text-finance-primary" />
            </div>
            <p className="animate-pulse font-mono flex items-center gap-2 text-xs uppercase tracking-widest">
              <RefreshCw className="w-4 h-4 animate-spin text-finance-primary" /> Gathering real-time market data...
            </p>
          </div>
        )}

        {/* Report Output */}
        {(report || isLoading) && (
          <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <ReportViewer content={report} />
            <div ref={reportEndRef} className="h-4" />
          </div>
        )}
      </main>

      <style>{`
        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  );
}
