import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Maximize2, Minimize2, ExternalLink, FileText, Loader } from 'lucide-react';

interface DocumentViewerProps {
  doc: {
    id: string;
    title: string;
    url: string;
    fileType: string;
    description?: string;
    category?: string;
  };
  onClose: () => void;
}

function getViewerUrl(url: string, fileType: string): string {
  const type = fileType.toUpperCase();
  // PDFs can be embedded directly
  if (type === 'PDF') return url;
  // Office formats → Google Docs viewer
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}

export function DocumentViewer({ doc, onClose }: DocumentViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const isPdf = doc.fileType.toUpperCase() === 'PDF';
  const viewerUrl = getViewerUrl(doc.url, doc.fileType);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-[#1a1816] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${
            isFullscreen
              ? 'fixed inset-2 w-auto h-auto rounded-2xl'
              : 'w-full max-w-5xl h-[90vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#141210] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-gold" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm truncate">{doc.title}</p>
                <p className="text-[10px] text-white/40 font-mono uppercase">{doc.fileType} · {doc.category || 'Bibliothèque CEME'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-4">
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href={doc.url}
                download
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold text-xs font-bold transition-colors"
                title="Télécharger"
              >
                <Download className="w-3.5 h-3.5" /> Télécharger
              </a>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title={isFullscreen ? 'Réduire' : 'Plein écran'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Viewer */}
          <div className="flex-1 relative bg-[#2a2825] min-h-0">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#2a2825]">
                <Loader className="w-8 h-8 text-gold animate-spin mb-3" />
                <p className="text-sm text-white/50">Chargement du document...</p>
              </div>
            )}
            <iframe
              src={viewerUrl}
              className="w-full h-full border-0"
              title={doc.title}
              onLoad={() => setIframeLoaded(true)}
              allow="fullscreen"
            />
          </div>

          {/* Footer hint */}
          {!isPdf && (
            <div className="px-5 py-2.5 bg-[#141210] border-t border-white/5 text-[10px] text-white/30 text-center shrink-0">
              Aperçu via Google Docs Viewer — le document original peut être téléchargé ci-dessus.
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
