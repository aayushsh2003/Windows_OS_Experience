import { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

export function PdfReaderApp() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') { alert('Please select a PDF'); return; }
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(URL.createObjectURL(f));
    setFileName(f.name);
  };

  const loadUrl = () => {
    if (!urlInput) return;
    setPdfUrl(urlInput);
    setFileName(urlInput.split('/').pop() || 'document.pdf');
  };

  const clear = () => {
    if (pdfUrl?.startsWith('blob:')) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setFileName('');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/40">
        <FileText className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium flex-1 truncate">{fileName || 'PDF Reader'}</span>
        {pdfUrl && (
          <>
            <a href={pdfUrl} download={fileName} className="text-xs px-2 py-1 rounded hover:bg-secondary">Download</a>
            <button onClick={clear} className="p-1 hover:bg-secondary rounded"><X className="w-3.5 h-3.5" /></button>
          </>
        )}
      </div>
      {pdfUrl ? (
        <iframe src={pdfUrl} className="flex-1 w-full border-0" title="PDF" />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <FileText className="w-16 h-16 text-muted-foreground/30" />
          <div className="text-center">
            <h3 className="text-base font-semibold mb-1">Open a PDF</h3>
            <p className="text-xs text-muted-foreground">Upload from your device or load from a URL</p>
          </div>
          <input ref={inputRef} type="file" accept="application/pdf" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
          <button onClick={() => inputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:opacity-90">
            <Upload className="w-4 h-4" /> Choose PDF
          </button>
          <div className="flex gap-2 w-full max-w-md mt-2">
            <input
              type="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://example.com/file.pdf"
              className="flex-1 px-3 py-2 border border-border rounded text-xs bg-background outline-none focus:ring-1 focus:ring-primary"
            />
            <button onClick={loadUrl} className="px-3 py-2 bg-secondary rounded text-xs hover:bg-secondary/70">Load</button>
          </div>
        </div>
      )}
    </div>
  );
}
