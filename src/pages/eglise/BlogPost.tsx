import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, BookOpen, Loader2, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { getBlogPost, type BlogPost as BlogPostType } from '../../lib/dbService';
import { SEO } from '../../components/SEO';

export function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getBlogPost(id)
      .then(setPost)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f2ed] pt-32 flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
        <p className="text-sm">Chargement de l'article...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#f5f2ed] pt-32 flex flex-col items-center justify-center text-center px-4">
        <BookOpen className="w-16 h-16 text-gray-300 mb-6" />
        <h1 className="font-serif text-3xl font-bold mb-3">Article introuvable</h1>
        <p className="text-gray-500 mb-8">Cet article n'existe pas ou a été retiré.</p>
        <Link to="/eglise/blog" className="inline-flex items-center gap-2 bg-soft-black text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-gold hover:text-soft-black transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour au Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f2ed] min-h-screen">
      <SEO
        title={`${post.title} — Blog Grâce TV`}
        description={(post.excerpt || post.title || '').slice(0, 160)}
        path={`/eglise/blog/${post.id}`}
        type="article"
        image={post.coverImage || undefined}
      />

      {/* Hero */}
      <div className="relative bg-soft-black text-white overflow-hidden">
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-soft-black/60 via-soft-black/80 to-soft-black" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-16">
          <Link
            to="/eglise/blog"
            className="inline-flex items-center gap-2 text-white/60 hover:text-gold text-xs font-bold uppercase tracking-wider mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour au Blog
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 bg-gold/15 text-gold text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-gold/20">
                <Tag className="w-3 h-3" /> {post.category}
              </span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-white/70 text-lg font-light leading-relaxed mb-8 border-l-4 border-gold/40 pl-5 italic">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-white/50 uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-white/70">
                <User className="w-3.5 h-3.5 text-gold" /> {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Article content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12"
        >
          <div
            className="prose prose-lg prose-gray max-w-none
              prose-headings:font-serif prose-headings:font-bold prose-headings:text-soft-black
              prose-p:leading-relaxed prose-p:text-gray-700
              prose-strong:text-soft-black
              prose-blockquote:border-l-gold prose-blockquote:text-gray-600 prose-blockquote:italic
              prose-a:text-burgundy prose-a:no-underline hover:prose-a:underline
              whitespace-pre-wrap"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {post.content}
          </div>
        </motion.div>

        {/* Footer nav */}
        <div className="mt-12 flex items-center justify-between">
          <Link
            to="/eglise/blog"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-soft-black px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:border-gold hover:text-gold transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Tous les articles
          </Link>
        </div>
      </div>
    </div>
  );
}
