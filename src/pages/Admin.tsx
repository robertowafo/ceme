import React, { useState, useEffect } from 'react';
import {
  Lock,
  User as UserIcon,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Link2,
  Image as ImageIcon,
  Calendar,
  Quote,
  FileText,
  AlertCircle,
  Youtube,
  MapPin,
  Clock,
  FileDown,
  ExternalLink,
  ShieldAlert,
  Heart,
  Phone,
  DollarSign,
  TrendingUp,
  CreditCard,
  Smartphone,
  BarChart3,
  Mail,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { AdminFileUpload } from '../components/AdminFileUpload';
import {
  getRecommendedLinks, saveRecommendedLink, deleteRecommendedLink, RecommendedLink,
  getGalleryPhotos, saveGalleryPhoto, deleteGalleryPhoto, GalleryPhoto,
  getChurchEvents, saveChurchEvent, deleteChurchEvent, ChurchEvent,
  getTestimonials, saveTestimonial, deleteTestimonial, TestimonialItem,
  getStudyDocuments, saveStudyDocument, deleteStudyDocument, StudyDocument,
  getAllPrayerRequests, deletePrayerRequest, PrayerRequest,
  getAllDonations, getDonationStats, deleteDonation, Donation, DonationStats,
  getAllBlogPosts, saveBlogPost, deleteBlogPost, BlogPost,
  getBlogCategories, saveBlogCategory, deleteBlogCategory, BlogCategory,
  getNewsletterSubscribers, deleteNewsletterSubscriber, NewsletterSubscriber,
} from '../lib/dbService';

type AdminTab = 'links' | 'photos' | 'events' | 'testimonials' | 'documents' | 'prayers' | 'donations' | 'blog' | 'newsletter';

export function Admin() {
  const { user, isAdmin, isLoading: isAuthLoading, loginWithGoogle, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('links');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Lists State
  const [links, setLinks] = useState<RecommendedLink[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donationStats, setDonationStats] = useState<DonationStats | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isSavingCat, setIsSavingCat] = useState(false);

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  // Specific Form Fields
  // 1. Link Fields
  const [linkTitle, setLinkTitle] = useState('');
  const [linkYoutubeId, setLinkYoutubeId] = useState('');
  const [linkDesc, setLinkDesc] = useState('');
  const [linkCategory, setLinkCategory] = useState('Sermon');

  // 2. Photo Fields
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState('Cultes & Louange');
  const [photoLocation, setPhotoLocation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoDesc, setPhotoDesc] = useState('');

  // 3. Event Fields
  const [evtTitle, setEvtTitle] = useState('');
  const [evtType, setEvtType] = useState<'special' | 'upcoming' | 'annonce'>('special');
  const [evtDateStr, setEvtDateStr] = useState('');
  const [evtIsoDate, setEvtIsoDate] = useState('');
  const [evtLocation, setEvtLocation] = useState('');
  const [evtPreacher, setEvtPreacher] = useState('');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtBadge, setEvtBadge] = useState('');
  const [evtBadgeColor, setEvtBadgeColor] = useState('bg-gold text-soft-black font-extrabold');
  const [evtImage, setEvtImage] = useState('');
  const [evtIsPopular, setEvtIsPopular] = useState(false);

  // 4. Testimonial Fields
  const [testAuthor, setTestAuthor] = useState('');
  const [testSince, setTestSince] = useState('');
  const [testText, setTestText] = useState('');
  const [testImg, setTestImg] = useState('');
  const [testCategory, setTestCategory] = useState('home');

  // 5. Document Fields
  const [docTitle, setDocTitle] = useState('');
  const [docDesc, setDocDesc] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docCategory, setDocCategory] = useState('Sermon Notes');
  const [docFileType, setDocFileType] = useState('PDF');

  // 6. Blog Fields
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('Dévotions Quotidiennes');
  const [blogAuthor, setBlogAuthor] = useState('Rev. Dr. Alphonse ESSOMBA');
  const [blogCoverImage, setBlogCoverImage] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogPublishedAt, setBlogPublishedAt] = useState('');
  const [blogIsPublished, setBlogIsPublished] = useState(true);

  const [isAdminFetchingInfo, setIsAdminFetchingInfo] = useState(false);

  // Helper to extract YouTube video ID from links or returned ID
  const extractYoutubeId = (url: string): string | null => {
    if (!url) return null;
    const trimmed = url.trim();
    if (trimmed.length === 11) return trimmed;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    if (activeTab !== 'links') return;
    const parsedId = extractYoutubeId(linkYoutubeId);
    if (!parsedId) return;

    if (linkYoutubeId !== parsedId) {
      setLinkYoutubeId(parsedId);
      return;
    }

    let isCancelled = false;

    const fetchDetailsForAdmin = async () => {
      setIsAdminFetchingInfo(true);
      try {
        const res = await fetch(`/api/youtube/video-info?urlOrId=${encodeURIComponent(parsedId)}`);
        if (!isCancelled && res.ok) {
          const info = await res.json();
          setLinkTitle(prev => prev || info.title || '');
          setLinkDesc(prev => prev || info.description || '');
        }
      } catch (err) {
        console.error('Error fetching admin video details:', err);
      } finally {
        if (!isCancelled) {
          setIsAdminFetchingInfo(false);
        }
      }
    };

    fetchDetailsForAdmin();

    return () => {
      isCancelled = true;
    };
  }, [linkYoutubeId, activeTab]);

  // Load Data based on Tab
  const loadData = async () => {
    if (!isAdmin) return;
    setIsLoadingData(true);
    try {
      if (activeTab === 'links') {
        const data = await getRecommendedLinks();
        setLinks(data);
      } else if (activeTab === 'photos') {
        const data = await getGalleryPhotos();
        setPhotos(data);
      } else if (activeTab === 'events') {
        const data = await getChurchEvents();
        setEvents(data);
      } else if (activeTab === 'testimonials') {
        const data = await getTestimonials();
        setTestimonials(data);
      } else if (activeTab === 'documents') {
        const data = await getStudyDocuments();
        setDocuments(data);
      } else if (activeTab === 'prayers') {
        const data = await getAllPrayerRequests();
        setPrayers(data);
      } else if (activeTab === 'donations') {
        const [data, stats] = await Promise.all([getAllDonations(), getDonationStats()]);
        setDonations(data);
        setDonationStats(stats);
      } else if (activeTab === 'blog') {
        const [data, cats] = await Promise.all([getAllBlogPosts(), getBlogCategories()]);
        setBlogPosts(data);
        setBlogCategories(cats);
      } else if (activeTab === 'newsletter') {
        const data = await getNewsletterSubscribers();
        setSubscribers(data);
      }
    } catch (err: any) {
      console.error('Failure loading data:', err);
      let errorMsg = 'Erreur de chargement des données.';
      const rawMsg = err?.message || String(err);
      try {
        const parsed = JSON.parse(rawMsg);
        if (parsed && parsed.error) {
          errorMsg = `Erreur: ${parsed.error}`;
        }
      } catch {
        if (rawMsg) {
          errorMsg = `Erreur: ${rawMsg}`;
        }
      }
      showStatus(errorMsg, 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, isAdmin]);

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  // Open Form for Adding
  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);

    // Reset Forms
    setLinkTitle(''); setLinkYoutubeId(''); setLinkDesc(''); setLinkCategory('Sermon');
    setPhotoTitle(''); setPhotoCategory('Cultes & Louange'); setPhotoLocation(''); setPhotoUrl(''); setPhotoDesc('');
    setEvtTitle(''); setEvtType('special'); setEvtDateStr(''); setEvtIsoDate(''); setEvtLocation(''); setEvtPreacher(''); setEvtDesc(''); setEvtBadge(''); setEvtBadgeColor('bg-gold text-soft-black font-extrabold'); setEvtImage(''); setEvtIsPopular(false);
    setTestAuthor(''); setTestSince(''); setTestText(''); setTestImg(''); setTestCategory('home');
    setDocTitle(''); setDocDesc(''); setDocUrl(''); setDocCategory('Sermon Notes'); setDocFileType('PDF');
    setBlogTitle(''); setBlogCategory(blogCategories[0]?.name ?? ''); setBlogAuthor('Rev. Dr. Alphonse ESSOMBA');
    setBlogCoverImage(''); setBlogExcerpt(''); setBlogContent('');
    setBlogPublishedAt(new Date().toISOString().slice(0, 10)); setBlogIsPublished(true);
    setShowCatManager(false); setNewCatName('');
  };

  // Open Form for Editing
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);

    if (activeTab === 'links') {
      const link = item as RecommendedLink;
      setLinkTitle(link.title);
      setLinkYoutubeId(link.youtubeId);
      setLinkDesc(link.description || '');
      setLinkCategory(link.category);
    } else if (activeTab === 'photos') {
      const photo = item as GalleryPhoto;
      setPhotoTitle(photo.title);
      setPhotoCategory(photo.category);
      setPhotoLocation(photo.location || '');
      setPhotoUrl(photo.url);
      setPhotoDesc(photo.desc || '');
    } else if (activeTab === 'events') {
      const evt = item as ChurchEvent;
      setEvtTitle(evt.title);
      setEvtType(evt.type);
      setEvtDateStr(evt.dateStr);
      setEvtIsoDate(evt.isoDate);
      setEvtLocation(evt.location);
      setEvtPreacher(evt.preacher || '');
      setEvtDesc(evt.desc);
      setEvtBadge(evt.badge);
      setEvtBadgeColor(evt.badgeColor || 'bg-gold text-soft-black font-extrabold');
      setEvtImage(evt.image);
      setEvtIsPopular(evt.isPopular || false);
    } else if (activeTab === 'testimonials') {
      const test = item as TestimonialItem;
      setTestAuthor(test.author);
      setTestSince(test.since);
      setTestText(test.text);
      setTestImg(test.img || '');
      setTestCategory(test.category);
    } else if (activeTab === 'documents') {
      const docItem = item as StudyDocument;
      setDocTitle(docItem.title);
      setDocDesc(docItem.description || '');
      setDocUrl(docItem.url);
      setDocCategory(docItem.category || 'Sermon Notes');
      setDocFileType(docItem.fileType);
    } else if (activeTab === 'blog') {
      const bp = item as BlogPost;
      setBlogTitle(bp.title);
      setBlogCategory(bp.category);
      setBlogAuthor(bp.author);
      setBlogCoverImage(bp.coverImage || '');
      setBlogExcerpt(bp.excerpt || '');
      setBlogContent(bp.content);
      setBlogPublishedAt(bp.publishedAt.slice(0, 10));
      setBlogIsPublished(bp.isPublished);
    }
  };

  // Delete Handlers
  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsLoadingData(true);
    try {
      if (activeTab === 'links') {
        await deleteRecommendedLink(deleteConfirmId);
      } else if (activeTab === 'photos') {
        await deleteGalleryPhoto(deleteConfirmId);
      } else if (activeTab === 'events') {
        await deleteChurchEvent(deleteConfirmId);
      } else if (activeTab === 'testimonials') {
        await deleteTestimonial(deleteConfirmId);
      } else if (activeTab === 'documents') {
        await deleteStudyDocument(deleteConfirmId);
      } else if (activeTab === 'prayers') {
        await deletePrayerRequest(deleteConfirmId);
      } else if (activeTab === 'donations') {
        await deleteDonation(deleteConfirmId);
      } else if (activeTab === 'blog') {
        await deleteBlogPost(deleteConfirmId);
      } else if (activeTab === 'newsletter') {
        await deleteNewsletterSubscriber(deleteConfirmId);
      }
      showStatus('Élément supprimé avec succès !', 'success');
      loadData();
    } catch (err: any) {
      console.error(err);
      let errorMsg = 'Erreur de suppression.';
      const rawMsg = err?.message || String(err);
      try {
        const parsed = JSON.parse(rawMsg);
        if (parsed && parsed.error) {
          errorMsg = `Échec de suppression: ${parsed.error}`;
        }
      } catch {
        if (rawMsg) {
          errorMsg = `Échec de suppression: ${rawMsg}`;
        }
      }
      showStatus(errorMsg, 'error');
    } finally {
      setIsLoadingData(false);
      setDeleteConfirmId(null);
    }
  };

  // Form Submit Handler
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingData(true);
    try {
      if (activeTab === 'links') {
        const linkId = editingItem ? editingItem.id : 'lnk_' + Date.now();
        const payload: RecommendedLink = {
          id: linkId,
          title: linkTitle,
          youtubeId: linkYoutubeId,
          description: linkDesc,
          category: linkCategory
        };
        await saveRecommendedLink(payload);

      } else if (activeTab === 'photos') {
        const photoId = editingItem ? editingItem.id : 'pht_' + Date.now();
        const payload: GalleryPhoto = {
          id: photoId,
          title: photoTitle,
          category: photoCategory,
          location: photoLocation,
          url: photoUrl,
          desc: photoDesc
        };
        await saveGalleryPhoto(payload);

      } else if (activeTab === 'events') {
        const eventId = editingItem ? editingItem.id : 'evt_' + Date.now();
        const payload: ChurchEvent = {
          id: eventId,
          title: evtTitle,
          type: evtType,
          dateStr: evtDateStr,
          isoDate: evtIsoDate,
          location: evtLocation,
          preacher: evtPreacher || undefined,
          desc: evtDesc,
          badge: evtBadge,
          badgeColor: evtBadgeColor,
          image: evtImage,
          isPopular: evtIsPopular
        };
        await saveChurchEvent(payload);

      } else if (activeTab === 'testimonials') {
        const testId = editingItem ? editingItem.id : 'tst_' + Date.now();
        const payload: TestimonialItem = {
          id: testId,
          author: testAuthor,
          since: testSince,
          text: testText,
          img: testImg || undefined,
          category: testCategory
        };
        await saveTestimonial(payload);

      } else if (activeTab === 'documents') {
        const documentId = editingItem ? editingItem.id : 'doc_' + Date.now();
        const payload: StudyDocument = {
          id: documentId,
          title: docTitle,
          description: docDesc,
          url: docUrl,
          category: docCategory,
          fileType: docFileType
        };
        await saveStudyDocument(payload);

      } else if (activeTab === 'blog') {
        const blogId = editingItem ? editingItem.id : 'blog_' + Date.now();
        const payload: BlogPost = {
          id: blogId,
          title: blogTitle,
          category: blogCategory,
          author: blogAuthor,
          coverImage: blogCoverImage || undefined,
          excerpt: blogExcerpt || undefined,
          content: blogContent,
          publishedAt: blogPublishedAt ? new Date(blogPublishedAt).toISOString() : new Date().toISOString(),
          isPublished: blogIsPublished
        };
        await saveBlogPost(payload);
      }

      showStatus('Élément sauvegardé avec succès !', 'success');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      let errorMsg = 'Erreur lors de la sauvegarde. Vérifiez vos permissions.';
      const rawMsg = err?.message || String(err);
      try {
        const parsed = JSON.parse(rawMsg);
        if (parsed && parsed.error) {
          errorMsg = `Échec de sauvegarde: ${parsed.error}`;
        }
      } catch {
        if (rawMsg) {
          errorMsg = `Échec de sauvegarde: ${rawMsg}`;
        }
      }
      showStatus(errorMsg, 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Auth Screen if not Admin
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-soft-black text-white pt-32 pb-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-400">Vérification de votre session d'accréditation...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-soft-black text-white pt-32 pb-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-stone-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl" />
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-gold" />
            </div>
            
            <h1 className="font-serif text-2xl lg:text-3xl font-bold mb-3 tracking-wide">
              ADMINISTRATION CEME
            </h1>
            <p className="text-white/60 text-xs uppercase tracking-widest font-bold text-gold mb-6">
              Portail de Gestion Grâce TV
            </p>
            
            <p className="text-sm text-white/70 leading-relaxed mb-8">
              Connectez-vous avec votre adresse autorisée pour mettre à jour les cultes recommandés, la galerie, l'agenda de l'église, les témoignages et la bibliothèque de documents.
            </p>

            {user ? (
              <div className="w-full mb-6 p-4 rounded-xl bg-burgundy/10 border border-burgundy/20 text-center">
                <ShieldAlert className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">Accès Refusé</p>
                <p className="text-xs text-white/60">
                  Compte connecté : <strong className="text-white">{user.email}</strong> n'est pas accrédité comme administrateur principal.
                </p>
                <button 
                  onClick={logout} 
                  className="mt-3 text-[10px] text-gold font-bold uppercase tracking-wider underline hover:text-white"
                >
                  Se déconnecter
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="w-full bg-gold hover:bg-gold/90 text-soft-black font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-lg text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <GoogleIcon className="w-4 h-4" /> Se connecter avec Google
              </button>
            )}

            <span className="text-[10px] text-white/40 mt-8">
              CEME de l'Éternel • Réseau de Grâce • Rev. Dr. Alphonse ESSOMBA
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141210] text-white pt-24 pb-20 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-burgundy/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Status / Success Notifications */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-24 right-4 z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3 text-xs font-bold ${
                statusMessage.type === 'success' 
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-400' 
                  : 'bg-red-950 border-red-500 text-red-400'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Administration Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-gold/10 text-gold text-[10px] font-sans font-black uppercase tracking-widest px-2.5 py-1 rounded border border-gold/20">
                ⭐ ACCRÉDITATION ACTIVE
              </span>
            </div>
            <h1 className="font-serif text-3xl lg:text-4xl font-black text-white leading-none">
              Console d'Administration CEME
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Bienvenue, administrateur (<strong className="text-gold">{user?.email}</strong>)
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/15 px-4 py-2.5 rounded-xl cursor-pointer text-white/80 hover:text-white transition-all self-start md:self-auto"
          >
            <LogOut className="w-4 h-4 text-burgundy" /> Se déconnecter
          </button>
        </div>

        {/* Main Workspace Frame */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Workspace Left Navigation Tabs */}
          <div className="lg:w-1/4 flex flex-col gap-2 shrink-0">
            <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-white/30 px-3 mb-2">
              Sections du Site Curées
            </p>

            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center justify-between p-4 rounded-xl text-left text-xs font-bold transition-all border ${
                activeTab === 'links'
                  ? 'bg-gold text-soft-black border-gold shadow-md shadow-gold/10'
                  : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/70'
              }`}
            >
              <span className="flex items-center gap-3">
                <Youtube className="w-4.5 h-4.5" /> 🔴 Recommandés Youtube
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/10">{links.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center justify-between p-4 rounded-xl text-left text-xs font-bold transition-all border ${
                activeTab === 'photos'
                  ? 'bg-gold text-soft-black border-gold shadow-md shadow-gold/10'
                  : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/70'
              }`}
            >
              <span className="flex items-center gap-3">
                <ImageIcon className="w-4.5 h-4.5" /> 📸 Galerie de Vie
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/10">{photos.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center justify-between p-4 rounded-xl text-left text-xs font-bold transition-all border ${
                activeTab === 'events'
                  ? 'bg-gold text-soft-black border-gold shadow-md shadow-gold/10'
                  : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/70'
              }`}
            >
              <span className="flex items-center gap-3">
                <Calendar className="w-4.5 h-4.5" /> 📅 Événements & Activités
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/10">{events.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('testimonials')}
              className={`flex items-center justify-between p-4 rounded-xl text-left text-xs font-bold transition-all border ${
                activeTab === 'testimonials'
                  ? 'bg-gold text-soft-black border-gold shadow-md shadow-gold/10'
                  : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/70'
              }`}
            >
              <span className="flex items-center gap-3">
                <Quote className="w-4.5 h-4.5" /> 💬 Témoignages Fidèles
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/10">{testimonials.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center justify-between p-4 rounded-xl text-left text-xs font-bold transition-all border ${
                activeTab === 'documents'
                  ? 'bg-gold text-soft-black border-gold shadow-md shadow-gold/10'
                  : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/70'
              }`}
            >
              <span className="flex items-center gap-3">
                <FileText className="w-4.5 h-4.5" /> 📄 Documents d'Étude PDF
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/10">{documents.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('prayers')}
              className={`flex items-center justify-between p-4 rounded-xl text-left text-xs font-bold transition-all border ${
                activeTab === 'prayers'
                  ? 'bg-burgundy text-white border-burgundy shadow-md shadow-burgundy/10'
                  : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/70'
              }`}
            >
              <span className="flex items-center gap-3">
                <Heart className="w-4.5 h-4.5" /> 🙏 Requêtes de Prière
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/10">{prayers.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('donations')}
              className={`flex items-center justify-between p-4 rounded-xl text-left text-xs font-bold transition-all border ${
                activeTab === 'donations'
                  ? 'bg-emerald-700 text-white border-emerald-600 shadow-md shadow-emerald-900/30'
                  : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/70'
              }`}
            >
              <span className="flex items-center gap-3">
                <DollarSign className="w-4.5 h-4.5" /> 💰 Dons & Finances
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/10">{donations.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('blog')}
              className={`flex items-center justify-between p-4 rounded-xl text-left text-xs font-bold transition-all border ${
                activeTab === 'blog'
                  ? 'bg-gold text-soft-black border-gold shadow-md shadow-gold/10'
                  : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/70'
              }`}
            >
              <span className="flex items-center gap-3">
                <FileText className="w-4.5 h-4.5" /> 📝 Articles du Blog
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/10">{blogPosts.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('newsletter')}
              className={`flex items-center justify-between p-4 rounded-xl text-left text-xs font-bold transition-all border ${
                activeTab === 'newsletter'
                  ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-900/30'
                  : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/70'
              }`}
            >
              <span className="flex items-center gap-3">
                <Mail className="w-4.5 h-4.5" /> 📧 Abonnés Newsletter
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/10">{subscribers.length}</span>
            </button>
          </div>

          {/* Workspace Right Workspace Content */}
          <div className="flex-1 min-w-0 bg-stone-900 border border-white/10 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold capitalize">
                  {activeTab === 'links' && 'Gestion des Recommandations YouTube'}
                  {activeTab === 'photos' && 'Gestion de la Galerie Photo (About Us)'}
                  {activeTab === 'events' && 'Gestion des Événements & Activités (Agenda)'}
                  {activeTab === 'testimonials' && 'Gestion de Témoignages de Foi'}
                  {activeTab === 'documents' && "Gestion de la Bibliothèque d'Étude (PDFs etc)"}
                  {activeTab === 'prayers' && 'Requêtes de Prière & Intercessions'}
                  {activeTab === 'donations' && 'Reporting Financier & Dons'}
                  {activeTab === 'blog' && 'Gestion des Articles du Blog'}
                  {activeTab === 'newsletter' && 'Abonnés à la Newsletter'}
                </h3>
                <p className="text-white/40 text-[11px] font-mono">
                  Table PostgreSQL: {activeTab === 'links' && 'recommended_links'}
                  {activeTab === 'photos' && 'gallery_photos'}
                  {activeTab === 'events' && 'church_events'}
                  {activeTab === 'testimonials' && 'testimonials'}
                  {activeTab === 'documents' && 'study_documents'}
                  {activeTab === 'prayers' && 'prayer_requests'}
                  {activeTab === 'donations' && 'donations'}
                  {activeTab === 'blog' && 'blog_posts'}
                  {activeTab === 'newsletter' && 'newsletter_subscribers'}
                </p>
              </div>

              {activeTab !== 'prayers' && activeTab !== 'donations' && activeTab !== 'blog' && activeTab !== 'newsletter' && (
                <button
                  onClick={handleAddNew}
                  className="bg-gold hover:bg-gold/90 text-soft-black px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Ajouter Nouveau
                </button>
              )}
              {activeTab === 'blog' && (
                <button
                  onClick={handleAddNew}
                  className="bg-gold hover:bg-gold/90 text-soft-black px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Nouvel Article
                </button>
              )}
            </div>

            {/* Loading Cover */}
            {isLoadingData ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-white/50">Synchronisation des données...</p>
              </div>
            ) : (
              <>
                {/* 1. Links View */}
                {activeTab === 'links' && (
                  <div className="overflow-x-auto">
                    {links.length === 0 ? (
                      <EmptyMessage />
                    ) : (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-white/40 font-bold uppercase tracking-wider">
                            <th className="pb-3 pr-4">Titre</th>
                            <th className="pb-3 pr-4">Identifiant Youtube</th>
                            <th className="pb-3 pr-4">Catégorie</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {links.map((link) => (
                            <tr key={link.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                              <td className="py-4 pr-4 font-semibold text-white max-w-xs truncate">{link.title}</td>
                              <td className="py-4 pr-4 font-mono text-gold flex items-center gap-1.5">
                                <Youtube className="w-4 h-4 text-red-500" /> {link.youtubeId}
                              </td>
                              <td className="py-4 pr-4">
                                <span className="bg-white/5 px-2.5 py-1 rounded text-[10px] font-bold text-white/80">{link.category}</span>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEdit(link)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-gold transition-colors"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDelete(link.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* 2. Photos View */}
                {activeTab === 'photos' && (
                  <div className="overflow-x-auto border-0">
                    {photos.length === 0 ? (
                      <EmptyMessage />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {photos.map((photo) => (
                          <div key={photo.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4">
                            <img src={photo.url} alt={photo.title} className="w-20 h-20 object-cover rounded-lg bg-black" />
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] bg-gold/10 text-gold px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">{photo.category}</span>
                                <h4 className="text-xs font-bold text-white truncate mt-2">{photo.title}</h4>
                                <p className="text-[10px] text-white/50 truncate flex items-center gap-1"><MapPin className="w-3 h-3 text-gold" /> {photo.location || 'CEME'}</p>
                              </div>
                              <div className="flex justify-end gap-1 pt-2">
                                <button onClick={() => handleEdit(photo)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-gold transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDelete(photo.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Events View */}
                {activeTab === 'events' && (
                  <div className="overflow-x-auto">
                    {events.length === 0 ? (
                      <EmptyMessage />
                    ) : (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-white/40 font-bold uppercase tracking-wider">
                            <th className="pb-3 pr-4">Événement</th>
                            <th className="pb-3 pr-4">Type</th>
                            <th className="pb-3 pr-4">Date humaine</th>
                            <th className="pb-3 pr-4">Orateur</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {events.map((evt) => (
                            <tr key={evt.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                              <td className="py-4 pr-4">
                                <div className="flex items-center gap-3">
                                  <img src={evt.image} className="w-10 h-10 object-cover rounded-md bg-stone-950" />
                                  <div className="min-w-0">
                                    <p className="font-bold text-white truncate max-w-xs">{evt.title}</p>
                                    <p className="text-[10px] text-white/50 truncate max-w-xs">{evt.location}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 pr-4 capitalize">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  evt.type === 'special' ? 'bg-amber-500/10 text-amber-500' :
                                  evt.type === 'upcoming' ? 'bg-blue-500/10 text-blue-400' :
                                  'bg-red-500/10 text-red-400'
                                }`}>
                                  {evt.type}
                                </span>
                              </td>
                              <td className="py-4 pr-4 font-mono text-white/70">{evt.dateStr}</td>
                              <td className="py-4 pr-4 text-white/60">{evt.preacher || 'Collège Pastoral'}</td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEdit(evt)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-gold transition-colors"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDelete(evt.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* 4. Testimonials View */}
                {activeTab === 'testimonials' && (
                  <div className="overflow-x-auto border-0">
                    {testimonials.length === 0 ? (
                      <EmptyMessage />
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {testimonials.map((test) => (
                          <div key={test.id} className="bg-white/5 border border-white/10 rounded-xl p-5 relative">
                            {test.img && <img src={test.img} className="w-10 h-10 rounded-full object-cover float-left mr-3 border border-gold" />}
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <h4 className="font-bold text-white text-xs">{test.author} <span className="text-[10px] text-white/50 font-normal ml-1">({test.since})</span></h4>
                                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider">{test.category}</span>
                              </div>
                              <p className="text-white/70 text-[11px] leading-relaxed italic clear-none">"{test.text}"</p>
                              <div className="flex items-center justify-end gap-1 mt-4 border-t border-white/10 pt-3">
                                <button onClick={() => handleEdit(test)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-gold transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDelete(test.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Documents View */}
                {activeTab === 'documents' && (
                  <div className="overflow-x-auto">
                    {documents.length === 0 ? (
                      <EmptyMessage />
                    ) : (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-white/40 font-bold uppercase tracking-wider">
                            <th className="pb-3 pr-4 font-bold">Document</th>
                            <th className="pb-3 pr-4 font-bold">Catégorie</th>
                            <th className="pb-3 pr-4 font-bold">Format</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documents.map((docItem) => (
                            <tr key={docItem.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                              <td className="py-4 pr-4">
                                <div className="flex items-center gap-2.5">
                                  <FileText className="w-4 h-4 text-gold shrink-0" />
                                  <div className="min-w-0">
                                    <p className="font-bold text-white truncate max-w-sm">{docItem.title}</p>
                                    <p className="text-[10px] text-white/40 truncate max-w-sm">{docItem.description || 'Pas de description'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 pr-4 text-white/70">{docItem.category || 'Général'}</td>
                              <td className="py-4 pr-4">
                                <span className="bg-red-950 border border-red-500/20 text-red-400 font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">{docItem.fileType}</span>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <a href={docItem.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-gold transition-colors"><ExternalLink className="w-4 h-4" /></a>
                                  <button onClick={() => handleEdit(docItem)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-gold transition-colors"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDelete(docItem.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
                {/* 6. Prayers View */}
                {activeTab === 'prayers' && (
                  <div className="overflow-x-auto">
                    {prayers.length === 0 ? (
                      <EmptyMessage />
                    ) : (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-white/40 font-bold uppercase tracking-wider">
                            <th className="pb-3 pr-4">Nom / Prénom</th>
                            <th className="pb-3 pr-4">
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Numéro</span>
                            </th>
                            <th className="pb-3 pr-4">Prière / Message</th>
                            <th className="pb-3 pr-4">Type</th>
                            <th className="pb-3 pr-4">Visibilité</th>
                            <th className="pb-3 pr-4">Date</th>
                            <th className="pb-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prayers.map((pr) => (
                            <tr key={pr.id} className="border-b border-white/5 hover:bg-white/[0.02] align-top">
                              <td className="py-4 pr-4 font-semibold text-white whitespace-nowrap">
                                {pr.name || <span className="text-white/30 italic font-normal">Anonyme</span>}
                              </td>
                              <td className="py-4 pr-4 font-mono text-gold/80">
                                {pr.phone ? (
                                  <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gold/50" />{pr.phone}</span>
                                ) : (
                                  <span className="text-white/20 italic font-normal">—</span>
                                )}
                              </td>
                              <td className="py-4 pr-4 text-white/75 max-w-sm">
                                <p className="line-clamp-3 leading-relaxed">{pr.message}</p>
                              </td>
                              <td className="py-4 pr-4">
                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  pr.type === 'testimony'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-burgundy/20 text-red-300'
                                }`}>
                                  {pr.type === 'testimony' ? '🙌 Témoignage' : '🙏 Prière'}
                                </span>
                              </td>
                              <td className="py-4 pr-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  pr.isPublic ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-white/40'
                                }`}>
                                  {pr.isPublic ? 'Public' : 'Confidentiel'}
                                </span>
                              </td>
                              <td className="py-4 pr-4 text-white/40 font-mono text-[10px] whitespace-nowrap">
                                {new Date(pr.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-4 text-right">
                                <button
                                  onClick={() => handleDelete(pr.id)}
                                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-red-500 transition-colors"
                                  title="Supprimer cette requête"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
                {/* 7. Donations View */}
                {activeTab === 'donations' && (
                  <div className="space-y-8">

                    {/* KPI Cards */}
                    {donationStats && (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          {
                            icon: DollarSign,
                            color: 'text-emerald-400',
                            bg: 'bg-emerald-500/10 border-emerald-500/20',
                            label: 'Total collecté',
                            value: donationStats.totalAmount.toLocaleString('fr-FR') + ' FCFA',
                            sub: `${donationStats.totalCount} don${donationStats.totalCount > 1 ? 's' : ''}`,
                          },
                          {
                            icon: TrendingUp,
                            color: 'text-gold',
                            bg: 'bg-gold/10 border-gold/20',
                            label: 'Ce mois-ci',
                            value: donationStats.thisMonthAmount.toLocaleString('fr-FR') + ' FCFA',
                            sub: `${donationStats.thisMonthCount} don${donationStats.thisMonthCount > 1 ? 's' : ''}`,
                          },
                          {
                            icon: Smartphone,
                            color: 'text-orange-400',
                            bg: 'bg-orange-500/10 border-orange-500/20',
                            label: 'Orange Money',
                            value: (donationStats.byMethod.find(m => m.method === 'OM')?.total ?? 0).toLocaleString('fr-FR') + ' FCFA',
                            sub: `${donationStats.byMethod.find(m => m.method === 'OM')?.count ?? 0} transactions`,
                          },
                          {
                            icon: CreditCard,
                            color: 'text-blue-400',
                            bg: 'bg-blue-500/10 border-blue-500/20',
                            label: 'Carte bancaire',
                            value: (donationStats.byMethod.find(m => m.method === 'Card')?.total ?? 0).toLocaleString('fr-FR') + ' FCFA',
                            sub: `${donationStats.byMethod.find(m => m.method === 'Card')?.count ?? 0} transactions`,
                          },
                        ].map((kpi, i) => (
                          <div key={i} className={`border rounded-xl p-4 ${kpi.bg}`}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">{kpi.label}</p>
                              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                            </div>
                            <p className={`text-base font-black font-mono ${kpi.color}`}>{kpi.value}</p>
                            <p className="text-[10px] text-white/40 mt-1">{kpi.sub}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Répartition par type */}
                    {donationStats && donationStats.byType.length > 0 && (
                      <div className="border border-white/10 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <BarChart3 className="w-4 h-4 text-gold" />
                          <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Répartition par destination</h4>
                        </div>
                        <div className="space-y-3">
                          {donationStats.byType.map((row) => {
                            const pct = donationStats.totalAmount > 0
                              ? Math.round((row.total / donationStats.totalAmount) * 100)
                              : 0;
                            const colors: Record<string, string> = {
                              'Dîme': 'bg-gold',
                              'Offrande': 'bg-emerald-500',
                              'Projets': 'bg-blue-500',
                            };
                            return (
                              <div key={row.type}>
                                <div className="flex justify-between items-center mb-1 text-xs">
                                  <span className="font-bold text-white/80">{row.type}</span>
                                  <span className="font-mono text-white/50">{row.total.toLocaleString('fr-FR')} FCFA · {pct}%</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${colors[row.type] ?? 'bg-white/30'}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Historique mensuel */}
                    {donationStats && donationStats.monthly.length > 0 && (
                      <div className="border border-white/10 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="w-4 h-4 text-gold" />
                          <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Évolution mensuelle (6 mois)</h4>
                        </div>
                        <div className="flex items-end gap-2 h-24">
                          {(() => {
                            const maxVal = Math.max(...donationStats.monthly.map(m => m.total), 1);
                            return donationStats.monthly.map((m) => (
                              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[9px] text-white/40 font-mono">{m.total.toLocaleString('fr-FR')}</span>
                                <div
                                  className="w-full bg-emerald-500/70 rounded-sm"
                                  style={{ height: `${Math.max(4, Math.round((m.total / maxVal) * 64))}px` }}
                                />
                                <span className="text-[9px] text-white/40 font-mono">{m.month.slice(5)}</span>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Table détaillée */}
                    <div className="overflow-x-auto">
                      {donations.length === 0 ? (
                        <EmptyMessage />
                      ) : (
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 text-white/40 font-bold uppercase tracking-wider">
                              <th className="pb-3 pr-4">Donateur</th>
                              <th className="pb-3 pr-4"><span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Numéro</span></th>
                              <th className="pb-3 pr-4">Montant</th>
                              <th className="pb-3 pr-4">Destination</th>
                              <th className="pb-3 pr-4">Moyen</th>
                              <th className="pb-3 pr-4">Référence</th>
                              <th className="pb-3 pr-4">Date</th>
                              <th className="pb-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {donations.map((d) => (
                              <tr key={d.id} className="border-b border-white/5 hover:bg-white/[0.02] align-top">
                                <td className="py-4 pr-4 font-semibold text-white whitespace-nowrap">
                                  {d.donorName || <span className="text-white/30 italic font-normal">Anonyme</span>}
                                </td>
                                <td className="py-4 pr-4 font-mono text-gold/80">
                                  {d.phone
                                    ? <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gold/50" />{d.phone}</span>
                                    : <span className="text-white/20 italic font-normal">—</span>}
                                </td>
                                <td className="py-4 pr-4 font-mono font-black text-emerald-400 whitespace-nowrap">
                                  {d.amount.toLocaleString('fr-FR')} {d.currency}
                                </td>
                                <td className="py-4 pr-4">
                                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    d.contribType === 'Dîme' ? 'bg-gold/15 text-yellow-300'
                                    : d.contribType === 'Projets' ? 'bg-blue-500/15 text-blue-300'
                                    : 'bg-emerald-500/15 text-emerald-300'
                                  }`}>{d.contribType}</span>
                                </td>
                                <td className="py-4 pr-4">
                                  <span className={`flex items-center gap-1 text-[10px] font-bold ${d.paymentMethod === 'OM' ? 'text-orange-400' : 'text-blue-400'}`}>
                                    {d.paymentMethod === 'OM' ? <Smartphone className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                                    {d.paymentMethod === 'OM' ? 'Orange Money' : 'Carte'}
                                  </span>
                                </td>
                                <td className="py-4 pr-4 font-mono text-white/40 text-[10px]">
                                  {d.reference || '—'}
                                </td>
                                <td className="py-4 pr-4 text-white/40 font-mono text-[10px] whitespace-nowrap">
                                  {new Date(d.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="py-4 text-right">
                                  <button
                                    onClick={() => handleDelete(d.id)}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-red-500 transition-colors"
                                    title="Supprimer ce don"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
                {/* 9. Newsletter Subscribers View */}
                {activeTab === 'newsletter' && (
                  <div className="overflow-x-auto">
                    {subscribers.length === 0 ? (
                      <EmptyMessage />
                    ) : (
                      <>
                        <p className="text-xs text-white/40 mb-4">
                          {subscribers.length} abonné{subscribers.length > 1 ? 's' : ''} inscrit{subscribers.length > 1 ? 's' : ''} via le blog.
                        </p>
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 text-white/40 font-bold uppercase tracking-wider">
                              <th className="pb-3 pr-4">Adresse Email</th>
                              <th className="pb-3 pr-4">Date d'inscription</th>
                              <th className="pb-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subscribers.map((sub) => (
                              <tr key={sub.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-4 pr-4 font-mono text-sky-400">{sub.email}</td>
                                <td className="py-4 pr-4 text-white/40 font-mono text-[10px] whitespace-nowrap">
                                  {new Date(sub.subscribedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="py-4 text-right">
                                  <button
                                    onClick={() => handleDelete(sub.id)}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-red-500 transition-colors"
                                    title="Désinscrire cet abonné"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                )}

                {/* 8. Blog Posts View */}
                {activeTab === 'blog' && (
                  <div className="overflow-x-auto">
                    {blogPosts.length === 0 ? (
                      <EmptyMessage />
                    ) : (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-white/40 font-bold uppercase tracking-wider">
                            <th className="pb-3 pr-4">Titre</th>
                            <th className="pb-3 pr-4">Catégorie</th>
                            <th className="pb-3 pr-4">Auteur</th>
                            <th className="pb-3 pr-4">Date</th>
                            <th className="pb-3 pr-4">Statut</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {blogPosts.map((bp) => (
                            <tr key={bp.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                              <td className="py-4 pr-4">
                                <div className="flex items-center gap-3">
                                  {bp.coverImage && <img src={bp.coverImage} className="w-10 h-10 object-cover rounded-md bg-stone-950 shrink-0" />}
                                  <p className="font-bold text-white truncate max-w-xs">{bp.title}</p>
                                </div>
                              </td>
                              <td className="py-4 pr-4">
                                <span className="bg-gold/10 text-gold px-2 py-0.5 rounded text-[10px] font-bold">{bp.category}</span>
                              </td>
                              <td className="py-4 pr-4 text-white/60 truncate max-w-[120px]">{bp.author}</td>
                              <td className="py-4 pr-4 text-white/40 font-mono text-[10px] whitespace-nowrap">
                                {new Date(bp.publishedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="py-4 pr-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${bp.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
                                  {bp.isPublished ? 'Publié' : 'Brouillon'}
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEdit(bp)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-gold transition-colors"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDelete(bp.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* CRUD Edit / Create Modal Popups */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-stone-900 border border-white/10 rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl"
            >
              <button
                onClick={() => { setIsModalOpen(false); setShowCatManager(false); setNewCatName(''); }}
                className="absolute top-6 right-6 p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-serif text-xl sm:text-2xl font-bold mb-1 border-b border-white/10 pb-4">
                {editingItem ? 'Modifier les données' : 'Ajouter un élément'}
              </h3>

              <form onSubmit={handleSaveForm} className="space-y-5 pt-4">
                
                {/* 1. Links Form Fields */}
                {activeTab === 'links' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Titre de la vidéo</label>
                      <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={linkTitle} onChange={e => setLinkTitle(e.target.value)} placeholder="Ex: La Puissance de la Prière de Delivrance" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Lien ou ID Vidéo YouTube</label>
                        <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={linkYoutubeId} onChange={e => setLinkYoutubeId(e.target.value)} placeholder="Ex: Lb68G4-tZgM ou URL complète" />
                        {isAdminFetchingInfo && (
                          <p className="text-[10px] text-gold mt-1 animate-pulse flex items-center gap-1.5">
                            <span className="w-2 h-2 border border-gold border-t-transparent rounded-full animate-spin"></span>
                            Récupération des détails depuis YouTube...
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Catégorie</label>
                        <select className="w-full bg-stone-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={linkCategory} onChange={e => setLinkCategory(e.target.value)}>
                          <option value="Sermon">📖 Sermon d'Enseignement</option>
                          <option value="Louange">🎵 Louange & Adoration</option>
                          <option value="Témoignage">💬 Message de Témoignage</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Description courte (optionnel)</label>
                      <textarea rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white" value={linkDesc} onChange={e => setLinkDesc(e.target.value)} placeholder="Exliquez brièvement l'onction abordée dans ce message..." />
                    </div>
                  </div>
                )}

                {/* 2. Photos Form Fields */}
                {activeTab === 'photos' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Titre de la photo</label>
                      <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={photoTitle} onChange={e => setPhotoTitle(e.target.value)} placeholder="Ex: Culte solennel d'onction" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Catégorie Galerie</label>
                        <select className="w-full bg-stone-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={photoCategory} onChange={e => setPhotoCategory(e.target.value)}>
                          <option value="Cultes & Louange">Cultes & Louange</option>
                          <option value="Jeunesse & Enfants">Jeunesse & Enfants</option>
                          <option value="Actions Sociales">Actions Sociales</option>
                          <option value="Vie Fraternelle">Vie Fraternelle</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Lieu (Optionnel)</label>
                        <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={photoLocation} onChange={e => setPhotoLocation(e.target.value)} placeholder="Ex: Sanctuaire Principal CEME" />
                      </div>
                    </div>
                    <div>
                      <AdminFileUpload
                        value={photoUrl}
                        onChange={setPhotoUrl}
                        label="Image de la photo"
                        placeholder="Ex: https://images.unsplash.com/photo-..."
                        required
                        accept="image/*"
                        description="Choisissez d'importer une photo locale ou de renseigner un lien d'image direct."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Description de la scène (Optionnel)</label>
                      <textarea rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white" value={photoDesc} onChange={e => setPhotoDesc(e.target.value)} placeholder="Que représente cette photo pour la vie de l'église ?" />
                    </div>
                  </div>
                )}

                {/* 3. Events Form Fields */}
                {activeTab === 'events' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Titre du programme</label>
                        <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={evtTitle} onChange={e => setEvtTitle(e.target.value)} placeholder="Ex: Solennité Royale & Louange Céleste" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Type d'Événement</label>
                        <select className="w-full bg-stone-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={evtType} onChange={e => setEvtType(e.target.value as any)}>
                          <option value="special">🔥 Culte Spécial (Star)</option>
                          <option value="upcoming">📅 Bientôt / À venir</option>
                          <option value="annonce">📢 Annonce Pastorale</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Date d'affichage humain</label>
                        <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={evtDateStr} onChange={e => setEvtDateStr(e.target.value)} placeholder="Ex: Dimanche 28 Juin à 09h00" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Date au format ISO (Triage)</label>
                        <input type="date" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={evtIsoDate} onChange={e => setEvtIsoDate(e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Emplacement physique</label>
                        <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={evtLocation} onChange={e => setEvtLocation(e.target.value)} placeholder="Ex: Sanctuaire Principal CEME" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Orateur / Prédicateur</label>
                        <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={evtPreacher} onChange={e => setEvtPreacher(e.target.value)} placeholder="Ex: Rev. Dr. Alphonse ESSOMBA" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Texte du Ruban / Badge</label>
                        <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={evtBadge} onChange={e => setEvtBadge(e.target.value)} placeholder="Ex: CÉLÉBRATION SPÉCIALE" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Couleur Tailwind du Ruban</label>
                        <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={evtBadgeColor} onChange={e => setEvtBadgeColor(e.target.value)} placeholder="bg-gold text-soft-black font-extrabold" />
                      </div>
                    </div>

                    <div>
                      <AdminFileUpload
                        value={evtImage}
                        onChange={setEvtImage}
                        label="Image de l'événement"
                        placeholder="Ex: https://images.unsplash.com/photo-..."
                        required
                        accept="image/*"
                        description="Importez une image d'onction ou de culte spéciale depuis votre appareil ou saisissez un lien."
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="chkPopular" className="w-4.5 h-4.5 accent-gold cursor-pointer" checked={evtIsPopular} onChange={e => setEvtIsPopular(e.target.checked)} />
                      <label htmlFor="chkPopular" className="text-xs text-white/80 cursor-pointer select-none">Mettre cet événement en vedette (Slide principal de l'Agenda)</label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Description complète du programme</label>
                      <textarea rows={3} required className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white" value={evtDesc} onChange={e => setEvtDesc(e.target.value)} placeholder="Expliquez en détail aux fidèles ce qui est prévu et comment s'y préparer spirituellement..." />
                    </div>
                  </div>
                )}

                {/* 4. Testimonials Form Fields */}
                {activeTab === 'testimonials' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Auteur du témoignage</label>
                        <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={testAuthor} onChange={e => setTestAuthor(e.target.value)} placeholder="Ex: Jean-Pierre K." />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Identité / Ancienneté</label>
                        <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={testSince} onChange={e => setTestSince(e.target.value)} placeholder="Ex: Membre depuis 2019" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Emplacement / Affichage</label>
                        <select className="w-full bg-stone-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={testCategory} onChange={e => setTestCategory(e.target.value)}>
                          <option value="home">Card d'Accueil principal</option>
                          <option value="horizontal">Horizontal (Croix Témoignages Relat.)</option>
                          <option value="vertical">Vertical (Croix Témoignages Divines)</option>
                        </select>
                      </div>
                      <div>
                        <AdminFileUpload
                          value={testImg}
                          onChange={setTestImg}
                          label="Avatar ou Photo d'auteur (Optionnel)"
                          placeholder="https://images.unsplash.com/photo-..."
                          accept="image/*"
                          description="Importez l'avatar de l'auteur ou renseignez une photo publique."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">L'Histoire de Grâce / Témoignage écrit</label>
                      <textarea rows={4} required className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white" value={testText} onChange={e => setTestText(e.target.value)} placeholder="Rédigez l'œuvre de restauration divine en actions complètes..." />
                    </div>
                  </div>
                )}

                {/* 5. Documents Form Fields */}
                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Titre du document d'étude</label>
                      <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={docTitle} onChange={e => setDocTitle(e.target.value)} placeholder="Ex: Notes d'Enseignement : L'Onction Maximale" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Catégorie</label>
                      <select className="w-full bg-stone-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={docCategory} onChange={e => setDocCategory(e.target.value)}>
                        <option value="Sermon Notes">Sermon Notes (Notes Pastorale)</option>
                        <option value="Étude Biblique">Étude Biblique & Doctrine</option>
                        <option value="Programme">Brochure / Programme d'Événement</option>
                        <option value="Cantiques">Feuilles de Cantiques & Partition</option>
                      </select>
                    </div>

                    <div>
                      <AdminFileUpload
                        value={docUrl}
                        onChange={setDocUrl}
                        onFileSelected={(file) => {
                          setDocTitle(file.name.replace(/\.[^.]+$/, ''));
                          const ext = file.name.split('.').pop()?.toUpperCase() ?? 'PDF';
                          setDocFileType(ext === 'DOC' ? 'DOCX' : ['PDF', 'DOCX', 'EPUB'].includes(ext) ? ext : 'PDF');
                        }}
                        label="Fichier ou Lien de téléchargement"
                        placeholder="Ex: https://drive.google.com/... ou import direct de fichier"
                        required
                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/epub+zip"
                        description="Glissez-déposez un fichier (PDF, Word, EPUB) ou collez un lien de stockage public."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Courte description du contenu (Optionnel)</label>
                      <textarea rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white" value={docDesc} onChange={e => setDocDesc(e.target.value)} placeholder="Que contient ce fichier ? (matières d'études, exhortation etc...)" />
                    </div>
                  </div>
                )}

                {/* 6. Blog Form Fields */}
                {activeTab === 'blog' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Titre de l'article</label>
                      <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={blogTitle} onChange={e => setBlogTitle(e.target.value)} placeholder="Ex: Comment vivre par la Foi au quotidien" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Catégorie</label>
                          <button
                            type="button"
                            onClick={() => setShowCatManager(v => !v)}
                            className="text-[10px] text-gold font-bold uppercase tracking-wider hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Gérer
                          </button>
                        </div>
                        <select className="w-full bg-stone-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={blogCategory} onChange={e => setBlogCategory(e.target.value)}>
                          {blogCategories.length === 0 ? (
                            <option value="">— Aucune catégorie —</option>
                          ) : (
                            blogCategories.map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))
                          )}
                        </select>

                        {/* Category Manager Panel */}
                        {showCatManager && (
                          <div className="mt-3 bg-black/60 border border-white/10 rounded-xl p-4 space-y-3">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Gérer les catégories</p>

                            {/* Existing categories */}
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {blogCategories.length === 0 ? (
                                <p className="text-[10px] text-white/30 italic">Aucune catégorie. Ajoutez-en une ci-dessous.</p>
                              ) : (
                                blogCategories.map(cat => (
                                  <div key={cat.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                                    <span className="text-xs text-white/80 font-medium">{cat.name}</span>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        try {
                                          await deleteBlogCategory(cat.id);
                                          const updated = await getBlogCategories();
                                          setBlogCategories(updated);
                                          if (blogCategory === cat.name) setBlogCategory(updated[0]?.name ?? '');
                                        } catch { showStatus('Erreur lors de la suppression.', 'error'); }
                                      }}
                                      className="p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Add new category */}
                            <div className="flex gap-2 pt-1 border-t border-white/10">
                              <input
                                type="text"
                                value={newCatName}
                                onChange={e => setNewCatName(e.target.value)}
                                onKeyDown={async e => {
                                  if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); }
                                }}
                                placeholder="Nouvelle catégorie..."
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold"
                              />
                              <button
                                type="button"
                                disabled={!newCatName.trim() || isSavingCat}
                                onClick={async () => {
                                  if (!newCatName.trim()) return;
                                  setIsSavingCat(true);
                                  try {
                                    const id = 'cat_' + Date.now();
                                    await saveBlogCategory({ id, name: newCatName.trim() });
                                    const updated = await getBlogCategories();
                                    setBlogCategories(updated);
                                    setBlogCategory(newCatName.trim());
                                    setNewCatName('');
                                  } catch { showStatus('Erreur lors de la création.', 'error'); }
                                  finally { setIsSavingCat(false); }
                                }}
                                className="bg-gold text-soft-black px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-gold/90 transition-colors"
                              >
                                {isSavingCat ? '...' : 'Ajouter'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Auteur</label>
                        <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={blogAuthor} onChange={e => setBlogAuthor(e.target.value)} placeholder="Ex: Rev. Dr. Alphonse ESSOMBA" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Date de publication</label>
                        <input type="date" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" value={blogPublishedAt} onChange={e => setBlogPublishedAt(e.target.value)} />
                      </div>
                      <div className="flex items-center gap-3 pt-6">
                        <input type="checkbox" id="chkPublished" className="w-4 h-4 accent-gold cursor-pointer" checked={blogIsPublished} onChange={e => setBlogIsPublished(e.target.checked)} />
                        <label htmlFor="chkPublished" className="text-xs text-white/80 cursor-pointer select-none">Publier immédiatement (visible sur le blog)</label>
                      </div>
                    </div>
                    <div>
                      <AdminFileUpload
                        value={blogCoverImage}
                        onChange={setBlogCoverImage}
                        label="Image de couverture (optionnel)"
                        placeholder="https://images.unsplash.com/..."
                        accept="image/*"
                        description="Image d'illustration pour l'article."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Résumé / Accroche (optionnel)</label>
                      <textarea rows={2} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white" value={blogExcerpt} onChange={e => setBlogExcerpt(e.target.value)} placeholder="Une phrase courte qui donne envie de lire l'article..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Contenu complet de l'article</label>
                      <textarea rows={12} required className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white resize-y font-mono leading-relaxed" value={blogContent} onChange={e => setBlogContent(e.target.value)} placeholder="Rédigez ici le contenu complet de l'article. Vous pouvez utiliser des sauts de ligne pour structurer votre texte." />
                      <p className="text-[10px] text-white/30 mt-1">Utilisez des sauts de ligne pour les paragraphes. Le texte sera formaté automatiquement.</p>
                    </div>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-gold hover:bg-gold/90 text-soft-black px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Sauvegarder
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}

        {deleteConfirmId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-stone-900 border border-white/10 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative"
            >
              <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>

              <h4 className="font-serif text-lg font-bold text-white mb-2">
                Confirmer la suppression
              </h4>
              <p className="text-xs text-white/60 mb-6 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement cet élément de la base de données ? Cette action est irréversible.
              </p>

              <div className="flex items-center gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="bg-white/10 hover:bg-white/25 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-lg shadow-red-600/10 font-extrabold uppercase tracking-wider"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function EmptyMessage() {
  return (
    <div className="py-16 text-center border-2 border-dashed border-white/10 rounded-xl">
      <AlertCircle className="w-8 h-8 text-gold/60 mx-auto mb-2 animate-pulse" />
      <p className="text-xs text-white/50">Aucun élément encodé dans cette collection pour le moment.</p>
    </div>
  );
}

// Icon representing google Auth inside the popup
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props} fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
  );
}
