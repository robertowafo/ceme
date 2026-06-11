import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, FileText, Loader, AlertCircle } from 'lucide-react';
import { getStudyDocuments } from '../lib/dbService';

export function DocumentReader() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [doc, setDoc] = useState<any>(location.state?.doc ?? null);
  const [loading, setLoading] = useState(!doc);
  const [error, setError] = useState<string | null>(null);

  // Si pas de state (accès direct par URL), on charge depuis l'API
  useEffect(() => {
    if (doc) return;
    getStudyDocuments()
      .then((list) => {
        const found = list.find((d) => d.id === id);
        if (found) setDoc(found);
        else setError('Document introuvable.');
      })
      .catch(() => setError('Impossible de charger le document.'))
      .finally(() => setLoading(false));
  }, [id]);

  const isPdf = doc?.fileType?.toUpperCase() === 'PDF';
  const downloadUrl = doc ? `/api/documents/download/${doc.id}` : '#';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1816] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-10 h-10 text-gold animate-spin" />
          <p className="text-white/50 text-sm">Chargement du document…</p>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-[#1a1816] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white font-bold text-lg mb-2">{error ?? 'Document introuvable'}</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-gold text-sm underline">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#1a1816] overflow-hidden">

      {/* Barre supérieure */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#141210] border-b border-white/10 shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5 text-gold" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{doc.title}</p>
              <p className="text-white/40 text-[10px] font-mono uppercase">{doc.fileType} · {doc.category || 'Bibliothèque CEME'}</p>
            </div>
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
            href={downloadUrl}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Télécharger
          </a>
        </div>
      </div>

      {/* Zone de lecture */}
      <div className="flex-1 relative overflow-hidden">
        {isPdf ? (
          <embed
            src={doc.url + '#toolbar=1&navpanes=0&scrollbar=1&view=FitH'}
            type="application/pdf"
            className="w-full h-full border-0"
          />
        ) : (
          // Format non-PDF : le navigateur ne peut pas l'afficher directement
          <div className="flex flex-col items-center justify-center h-full gap-6 px-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <FileText className="w-10 h-10 text-white/30" />
            </div>
            <div>
              <p className="text-white font-bold text-lg mb-2">{doc.title}</p>
              <p className="text-white/50 text-sm max-w-sm">
                Les fichiers <strong className="text-white/70">{doc.fileType}</strong> ne peuvent pas être affichés directement dans le navigateur.
                Téléchargez le document pour le consulter.
              </p>
            </div>
            <a
              href={downloadUrl}
              className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-soft-black font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              <Download className="w-4 h-4" /> Télécharger le document
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
