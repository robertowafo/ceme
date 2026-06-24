import { useState, useEffect } from 'react';
import { ArrowRight, Calendar, User, Search, Tag, Mail, Loader2, BookOpen, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { getBlogPosts, BlogPost, subscribeNewsletter } from '../../lib/dbService';

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterErrorMsg, setNewsletterErrorMsg] = useState('');

  useEffect(() => {
    getBlogPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus('loading');
    setNewsletterErrorMsg('');
    try {
      await subscribeNewsletter(newsletterEmail.trim());
      setNewsletterStatus('success');
      setNewsletterEmail('');
    } catch (err: any) {
      setNewsletterStatus('error');
      setNewsletterErrorMsg(err.message || "Erreur lors de l'inscription.");
    }
  };

  const sidebarCategoryMap = posts.reduce((map, p) => {
    map.set(p.category, (map.get(p.category) || 0) + 1);
    return map;
  }, new Map<string, number>());
  const sidebarCategories = Array.from(sidebarCategoryMap.entries()).sort((a, b) => b[1] - a[1]);

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.excerpt ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="pt-10 pb-20 bg-[#f5f2ed] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16 pt-10">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">Journal & Dévotions</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Méditations brûlantes, nouvelles fraîches de la communauté, et enseignements textuels. Gardez le cœur fervent tout le long de votre semaine.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* Main Content Area */}
          <div className="lg:w-2/3">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4 text-gray-400">
                <Loader2 className="w-10 h-10 animate-spin text-gold" />
                <p className="text-sm">Chargement des articles...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-24 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="font-semibold">Aucun article publié pour le moment.</p>
                <p className="text-sm mt-1 text-gray-300">Les articles seront publiés depuis le tableau de bord admin.</p>
              </div>
            ) : (
              <>
                {/* Featured Post */}
                {featured && (
                  <div className="mb-16">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-burgundy mb-6 flex items-center gap-2">
                      <Tag className="w-4 h-4"/> Article à la Une
                    </h2>
                    <Link to={`/blog/${featured.id}`}>
                      <article className="bg-white group cursor-pointer border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:border-gold transition-all duration-500">
                        <div className="h-80 overflow-hidden relative">
                          {featured.coverImage ? (
                            <img src={featured.coverImage} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer"/>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-soft-black to-burgundy/80 flex items-center justify-center">
                              <BookOpen className="w-20 h-20 text-white/20" />
                            </div>
                          )}
                          <div className="absolute top-4 left-4 bg-soft-black/90 text-white backdrop-blur-sm px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                            {featured.category}
                          </div>
                        </div>
                        <div className="p-8 md:p-10">
                          <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(featured.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            <span className="flex items-center gap-1"><User className="w-3 h-3"/> {featured.author}</span>
                          </div>
                          <h3 className="font-serif text-3xl font-bold mb-4 group-hover:text-burgundy transition-colors leading-tight">{featured.title}</h3>
                          <p className="text-gray-600 leading-relaxed mb-8">{featured.excerpt}</p>
                          <div className="inline-flex items-center justify-center gap-2 bg-gold text-soft-black px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-yellow-500 transition-colors">
                            Lire l'article complet <ArrowRight className="w-4 h-4"/>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </div>
                )}

                {/* Post Grid */}
                {rest.length > 0 && (
                  <>
                    <h2 className="font-serif text-3xl font-bold mb-8">Articles Récents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {rest.map((post) => (
                        <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                          <Link to={`/blog/${post.id}`}>
                            <article className="bg-white group cursor-pointer border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:border-gold transition-all duration-300 flex flex-col h-full">
                              <div className="h-56 overflow-hidden relative">
                                {post.coverImage ? (
                                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" loading="lazy" decoding="async"/>
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <BookOpen className="w-12 h-12 text-gray-300" />
                                  </div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/95 text-soft-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded shadow-sm">
                                  {post.category}
                                </div>
                              </div>
                              <div className="p-6 flex-1 flex flex-col">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
                                  <Calendar className="w-3 h-3"/> {new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <h4 className="font-serif text-xl font-bold mb-3 group-hover:text-gold transition-colors leading-snug">{post.title}</h4>
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">{post.excerpt}</p>
                                <div className="text-burgundy font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all mt-auto">
                                  Continuer <ArrowRight className="w-4 h-4"/>
                                </div>
                              </div>
                            </article>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-10">

            {/* Search Box */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-serif text-xl font-bold mb-4">Rechercher</h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Thème, mot-clé, pasteur..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold/10 text-gold p-2 rounded-lg hover:bg-gold hover:text-soft-black transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Categories */}
            {posts.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-serif text-xl font-bold mb-4 border-b border-gray-100 pb-3">Catégories</h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-burgundy font-medium transition-colors group"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-burgundy transition-colors"></span>
                        Tous les articles
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{posts.length}</span>
                    </button>
                  </li>
                  {sidebarCategories.map(([catName, count]) => (
                    <li key={catName}>
                      <button
                        onClick={() => setSearchQuery(catName)}
                        className={`flex items-center justify-between w-full text-sm font-medium transition-colors group ${searchQuery === catName ? 'text-burgundy' : 'text-gray-600 hover:text-burgundy'}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full transition-colors ${searchQuery === catName ? 'bg-burgundy' : 'bg-gray-300 group-hover:bg-burgundy'}`}></span>
                          {catName}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Newsletter widget */}
            <div className="bg-soft-black text-white p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <Mail className="w-40 h-40" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-2">Restez nourris</h3>
              <p className="text-white/70 text-sm mb-6 relative z-10">Recevez chaque vendredi le résumé de nos meilleurs articles et le verset d'encouragement de la semaine.</p>
              {newsletterStatus === 'success' ? (
                <div className="relative z-10 flex flex-col items-center gap-3 py-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-emerald-400 font-bold text-sm">Vous êtes abonné(e) !</p>
                  <p className="text-white/50 text-xs">Vous recevrez nos prochains articles par email.</p>
                </div>
              ) : (
                <form className="relative z-10" onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={e => { setNewsletterEmail(e.target.value); setNewsletterStatus('idle'); }}
                    placeholder="Votre email"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 mb-3 text-sm focus:outline-none focus:border-gold text-white placeholder-white/40"
                  />
                  {newsletterStatus === 'error' && (
                    <p className="text-red-400 text-xs mb-2 -mt-1">{newsletterErrorMsg}</p>
                  )}
                  <button
                    type="submit"
                    disabled={newsletterStatus === 'loading'}
                    className="w-full bg-gold text-soft-black py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-yellow-500 transition-colors disabled:opacity-60"
                  >
                    {newsletterStatus === 'loading' ? 'Inscription...' : "S'abonner"}
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
