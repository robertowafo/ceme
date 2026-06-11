import { ArrowRight, Calendar, User, Search, Tag, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export function Blog() {
  const posts = [
    {
      title: "Comment vivre par la Foi au quotidien face à un monde incertain",
      category: "Dévotion",
      date: "12 Mai 2024",
      author: "Rev. Dr. Alphonse ESSOMBA",
      image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=800",
      excerpt: "La foi n'est pas seulement pour les moments de crise, mais un mode de vie continu. Découvrez 5 clés bibliques pour activer concrètement votre foi chaque matin avant de commencer votre journée."
    },
    {
      title: "Retour sur la Conférence des Femmes 'Celles qui Bâtissent' 2024",
      category: "Événements",
      date: "05 Mai 2024",
      author: "Maman Marie Charlotte ESSOMBA",
      image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800",
      excerpt: "Un week-end de pure restauration, de guérison émotionnelle et d'empuissancement. Lisez notre compte-rendu complet sur ce moment inoubliable avec des photos inédites et les témoignages des participantes."
    },
    {
      title: "Comprendre le Baptême du Saint-Esprit et ses Manifestations",
      category: "Enseignement Biblique",
      date: "28 Avril 2024",
      author: "Rev. Dr. Alphonse ESSOMBA",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800",
      excerpt: "Qu'est-ce que le baptême du Saint-Esprit ? Pourquoi est-il essentiel et non facultatif pour la vie du croyant victorieux ? Une analyse biblique approfondie basée sur le livre des Actes."
    },
    {
      title: "Faire le deuil avec le Consolateur",
      category: "Encouragement",
      date: "15 Avril 2024",
      author: "Équipe Pastorale",
      image: "https://images.unsplash.com/photo-1469041797191-50ace28483c3?auto=format&fit=crop&q=80&w=800",
      excerpt: "Traverser la vallée de l'ombre de la mort est l'une des épreuves les plus difficiles. Voici comment le Saint-Esprit nous accompagne spécifiquement durant ces saisons de grande tristesse."
    },
    {
      title: "L'importance de lire sa Bible tous les jours",
      category: "Habitudes Spirituelles",
      date: "02 Avril 2024",
      author: "Frère Thomas (Jeunesse)",
      image: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&q=80&w=800",
      excerpt: "Jésus a dit que l'Homme ne vivra pas de pain seulement. Pourquoi avons-nous tant de mal à ouvrir notre Bible au quotidien, et quelles astuces pratiques pour remédier à ce problème ?"
    }
  ];

  return (
    <div className="pt-24 pb-20 bg-[#f5f2ed] min-h-screen">
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
            {/* Featured Post */}
            <div className="mb-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-burgundy mb-6 flex items-center gap-2">
                <Tag className="w-4 h-4"/> Article à la Une
              </h2>
              <article className="bg-white group cursor-pointer border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:border-gold transition-all duration-500">
                <div className="h-80 overflow-hidden relative">
                  <img src={posts[0].image} alt={posts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer"/>
                  <div className="absolute top-4 left-4 bg-soft-black/90 text-white backdrop-blur-sm px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                    {posts[0].category}
                  </div>
                </div>
                <div className="p-8 md:p-10">
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {posts[0].date}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3"/> {posts[0].author}</span>
                  </div>
                  <h3 className="font-serif text-3xl font-bold mb-4 group-hover:text-burgundy transition-colors leading-tight">{posts[0].title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-8">{posts[0].excerpt}</p>
                  <div className="inline-flex items-center justify-center gap-2 bg-gold text-soft-black px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-yellow-500 transition-colors">
                    Lire l'article complet <ArrowRight className="w-4 h-4"/>
                  </div>
                </div>
              </article>
            </div>

            {/* Post Grid */}
            <h2 className="font-serif text-3xl font-bold mb-8">Articles Récents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.slice(1).map((post, i) => (
                <article key={i} className="bg-white group cursor-pointer border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:border-gold transition-all duration-300 flex flex-col h-full">
                  <div className="h-56 overflow-hidden relative">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer"/>
                    <div className="absolute top-4 left-4 bg-white/95 text-soft-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded shadow-sm">
                      {post.category}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1"><Calendar className="w-3 h-3"/> {post.date}</p>
                    <h4 className="font-serif text-xl font-bold mb-3 group-hover:text-gold transition-colors leading-snug">{post.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">{post.excerpt}</p>
                    <div className="text-burgundy font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all mt-auto">
                      Continuer <ArrowRight className="w-4 h-4"/>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <button className="bg-white border-2 border-gray-200 text-gray-600 px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:border-gold hover:text-soft-black transition-colors w-full md:w-auto">
                Afficher les archives
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-10">
            
            {/* Search Box */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-serif text-xl font-bold mb-4">Rechercher</h3>
              <div className="relative">
                <input type="text" placeholder="Thème, mot-clé, pasteur..." className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold/10 text-gold p-2 rounded-lg hover:bg-gold hover:text-soft-black transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-serif text-xl font-bold mb-4 border-b border-gray-100 pb-3">Catégories</h3>
              <ul className="space-y-3">
                {['Dévotions Quotidiennes (42)', 'Enseignements Profonds (18)', 'Témoignages Chocs (12)', 'Nouvelles de l\'Église (25)', 'Ministère des Jeunes (8)'].map((cat, idx) => (
                  <li key={idx}>
                    <a href="#" className="flex items-center text-sm text-gray-600 hover:text-burgundy font-medium transition-colors group">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-3 group-hover:bg-burgundy transition-colors"></span>
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter widget */}
            <div className="bg-soft-black text-white p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <Mail className="w-40 h-40" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-2">Restez nourris</h3>
              <p className="text-white/70 text-sm mb-6 relative z-10">Recevez chaque vendredi le résumé de nos meilleurs articles et le verset d'encouragement de la semaine.</p>
              <form className="relative z-10" onSubmit={e => e.preventDefault()}>
                <input type="email" placeholder="Votre email" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 mb-3 text-sm focus:outline-none focus:border-gold text-white placeholder-white/40" />
                <button className="w-full bg-gold text-soft-black py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-yellow-500 transition-colors">S'abonner</button>
              </form>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
