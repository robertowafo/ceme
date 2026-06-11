import React, { useState, useRef } from 'react';
import { Upload, Link, Check, AlertCircle, Trash2, File, Paperclip } from 'lucide-react';

interface AdminFileUploadProps {
  value: string;
  onChange: (url: string) => void;
  onFileSelected?: (file: File) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  accept?: string;
  description?: string;
}

export function AdminFileUpload({
  value,
  onChange,
  onFileSelected,
  label,
  placeholder = 'https://...',
  required = false,
  accept = 'image/*',
  description
}: AdminFileUploadProps) {
  // Determine if initial value is an uploaded file (/uploads/...) or external URL
  const isLocalUpload = value?.startsWith('/uploads/');
  const [mode, setMode] = useState<'link' | 'upload'>(isLocalUpload ? 'upload' : 'link');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModeChange = (newMode: 'link' | 'upload') => {
    setMode(newMode);
    setError(null);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    // Basic file validation
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setError('Fichier trop lourd (20 Mo max)');
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Une erreur est survenue lors du téléversement');
      }

      const data = await response.json();
      if (data.url) {
        onChange(data.url);
      } else {
        throw new Error('Url de retour invalide.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Impossible de téléverser le fichier.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onFileSelected?.(file);
      uploadFile(file);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      // Type validation
      const acceptTypes = accept.split(',');
      const isAccepted = acceptTypes.some(type => {
        if (type.endsWith('/*')) {
          const prefix = type.split('/')[0];
          return droppedFile.type.startsWith(prefix);
        }
        return droppedFile.type === type || droppedFile.name.endsWith(type);
      });

      if (accept.includes('*') || isAccepted) {
        onFileSelected?.(droppedFile);
        uploadFile(droppedFile);
      } else {
        setError('Format de fichier non supporté.');
      }
    }
  };

  const clearFile = () => {
    onChange('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine file label representation
  const isImage = accept.includes('image/*');
  const fileName = value ? value.split('/').pop() : '';

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {/* Modern Toggle Bar */}
        <div className="flex bg-black/40 border border-white/10 rounded-lg p-0.5" id={`toggle-${label.replace(/\s+/g, '-')}`}>
          <button
            type="button"
            id={`btn-link-${label.replace(/\s+/g, '-')}`}
            onClick={() => handleModeChange('link')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'link'
                ? 'bg-gold text-soft-black font-extrabold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Link className="w-3 h-3" /> Lien Internet
          </button>
          <button
            type="button"
            id={`btn-upload-${label.replace(/\s+/g, '-')}`}
            onClick={() => handleModeChange('upload')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'upload'
                ? 'bg-gold text-soft-black font-extrabold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3" /> Importer
          </button>
        </div>
      </div>

      {mode === 'link' ? (
        <div>
          <input
            type="url"
            required={required}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setError(null);
            }}
            placeholder={placeholder}
          />
          {description && (
            <p className="text-[10px] text-white/40 mt-1">{description}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {value ? (
            // Uploaded state preview
            <div className="relative flex flex-col items-center justify-center border border-white/10 rounded-xl bg-black/30 p-4">
              {isImage && value.startsWith('/uploads/') ? (
                <div className="relative group max-w-xs overflow-hidden rounded-lg border border-white/10 mb-3 bg-stone-900">
                  <img
                    src={value}
                    alt="Aperçu importé"
                    className="max-h-32 w-auto object-contain mx-auto"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-stone-950 p-3 rounded-lg border border-white/5 w-full mb-3">
                  <div className="p-2 bg-red-600/10 text-red-500 rounded-lg">
                    <File className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium truncate font-mono">{fileName}</p>
                    <p className="text-[10px] text-white/40 font-mono">Stocké localement</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6 justify-between w-full border-t border-white/5 pt-3">
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 animate-bounce" /> Téléversé avec succès
                </span>
                
                <button
                  type="button"
                  onClick={clearFile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Supprimer
                </button>
              </div>
            </div>
          ) : (
            // Empty Dropzone
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                dragActive
                  ? 'border-gold bg-gold/5'
                  : 'border-white/10 bg-black/20 hover:bg-black/30 hover:border-white/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleFileChange}
                disabled={isUploading}
              />
              
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-gold/80 font-bold tracking-wider animate-pulse uppercase">
                    Téléversement en cours...
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="p-3 bg-white/5 rounded-full text-white/60 mx-auto w-fit mb-1">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-white/80 font-bold">
                    Glissez-déposez ou cliquez pour importer un fichier
                  </p>
                  <p className="text-[10px] text-white/45">
                    {isImage ? 'Formats images autorisés (JPEG, PNG, WEBP)' : 'Document d\'étude (PDF, DOCX up to 20MB)'}
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" /> {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
