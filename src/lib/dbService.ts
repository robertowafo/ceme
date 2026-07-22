import { apiFetch } from './auth';

// ─── Interfaces (inchangées pour compatibilité) ────────────────────────────────

export interface RecommendedLink {
  id: string;
  title: string;
  youtubeId: string;
  description?: string;
  category: string;
}

export interface GalleryPhoto {
  id: string;
  category: string;
  title: string;
  location?: string;
  url: string;
  desc?: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  type: 'special' | 'upcoming' | 'annonce';
  dateStr: string;
  isoDate: string;
  location: string;
  preacher?: string;
  desc: string;
  badge: string;
  badgeColor?: string;
  image: string;
  isPopular?: boolean;
}

export interface TestimonialItem {
  id: string;
  author: string;
  since: string;
  text: string;
  img?: string;
  category: string;
}

export interface StudyDocument {
  id: string;
  title: string;
  description?: string;
  url: string;
  category?: string;
  fileType: string;
}

export interface Partner {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  church?: string;
  location?: string;
  bio?: string;
  youtubeUrl: string;
  website?: string;
  avatarUrl?: string;
  createdAt?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function getAll<T>(endpoint: string): Promise<T[]> {
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`Erreur ${res.status} sur ${endpoint}`);
  return res.json();
}

async function upsert(endpoint: string, id: string, body: object): Promise<void> {
  const res = await apiFetch(`${endpoint}/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erreur serveur');
  }
}

async function remove(endpoint: string, id: string): Promise<void> {
  const res = await apiFetch(`${endpoint}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erreur serveur');
  }
}

// ─── recommended_links ─────────────────────────────────────────────────────────

export async function getRecommendedLinks(): Promise<RecommendedLink[]> {
  return getAll<RecommendedLink>('/api/recommended-links');
}

export async function saveRecommendedLink(link: RecommendedLink): Promise<void> {
  return upsert('/api/recommended-links', link.id, link);
}

export async function deleteRecommendedLink(id: string): Promise<void> {
  return remove('/api/recommended-links', id);
}

// ─── gallery_photos ────────────────────────────────────────────────────────────

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  return getAll<GalleryPhoto>('/api/gallery-photos');
}

export async function saveGalleryPhoto(photo: GalleryPhoto): Promise<void> {
  return upsert('/api/gallery-photos', photo.id, photo);
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  return remove('/api/gallery-photos', id);
}

// ─── church_events ─────────────────────────────────────────────────────────────

export async function getChurchEvents(): Promise<ChurchEvent[]> {
  return getAll<ChurchEvent>('/api/church-events');
}

export async function saveChurchEvent(event: ChurchEvent): Promise<void> {
  return upsert('/api/church-events', event.id, event);
}

export async function deleteChurchEvent(id: string): Promise<void> {
  return remove('/api/church-events', id);
}

// ─── testimonials ──────────────────────────────────────────────────────────────

export async function getTestimonials(): Promise<TestimonialItem[]> {
  return getAll<TestimonialItem>('/api/testimonials');
}

export async function saveTestimonial(testimonial: TestimonialItem): Promise<void> {
  return upsert('/api/testimonials', testimonial.id, testimonial);
}

export async function deleteTestimonial(id: string): Promise<void> {
  return remove('/api/testimonials', id);
}

// ─── study_documents ───────────────────────────────────────────────────────────

export async function getStudyDocuments(): Promise<StudyDocument[]> {
  return getAll<StudyDocument>('/api/study-documents');
}

export async function saveStudyDocument(document: StudyDocument): Promise<void> {
  return upsert('/api/study-documents', document.id, document);
}

export async function deleteStudyDocument(id: string): Promise<void> {
  return remove('/api/study-documents', id);
}

// ─── donations ────────────────────────────────────────────────────────────────

export interface Donation {
  id: string;
  donorName?: string;
  phone?: string;
  amount: number;
  currency: string;
  contribType: string;
  paymentMethod: string;
  reference?: string;
  projectId?: string;
  projectTitle?: string;
  submittedAt: string;
}

export interface DonationStats {
  totalCount: number;
  totalAmount: number;
  thisMonthAmount: number;
  thisMonthCount: number;
  byType: { type: string; count: number; total: number }[];
  byMethod: { method: string; count: number; total: number }[];
  monthly: { month: string; count: number; total: number }[];
}

// ─── donation_projects ─────────────────────────────────────────────────────────

export interface DonationProject {
  id: string;
  title: string;
  description?: string;
  goalAmount: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  raisedAmount: number;
}

export async function getDonationProjects(): Promise<DonationProject[]> {
  const res = await fetch('/api/donation-projects');
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function saveDonationProject(project: Omit<DonationProject, 'raisedAmount'>): Promise<void> {
  return upsert('/api/donation-projects', project.id, project);
}

export async function deleteDonationProject(id: string): Promise<void> {
  return remove('/api/donation-projects', id);
}

export async function submitDonation(data: {
  donorName?: string;
  phone?: string;
  amount: number;
  currency?: string;
  contribType: string;
  paymentMethod: string;
  reference?: string;
  projectId?: string;
}): Promise<void> {
  const res = await fetch('/api/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erreur serveur');
  }
}

export async function getAllDonations(): Promise<Donation[]> {
  const res = await fetch('/api/donations', {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function getDonationStats(): Promise<DonationStats> {
  const res = await fetch('/api/donations/stats', {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function deleteDonation(id: string): Promise<void> {
  return remove('/api/donations', id);
}

// ─── prayer_requests ───────────────────────────────────────────────────────────

export interface PrayerRequest {
  id: string;
  name?: string;
  phone?: string;
  message: string;
  type: 'prayer' | 'testimony';
  isPublic: boolean;
  submittedAt: string;
}

export interface PrayerRequestPublic {
  id: string;
  name?: string;
  message: string;
  type: 'prayer' | 'testimony';
  submittedAt: string;
}

export async function submitPrayerRequest(data: {
  name?: string;
  phone?: string;
  message: string;
  type: 'prayer' | 'testimony';
  isPublic: boolean;
}): Promise<void> {
  const res = await fetch('/api/prayer-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erreur serveur');
  }
}

export async function getPublicPrayerRequests(): Promise<PrayerRequestPublic[]> {
  const res = await fetch('/api/prayer-requests/public');
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function getAllPrayerRequests(): Promise<PrayerRequest[]> {
  const res = await fetch('/api/prayer-requests', {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function deletePrayerRequest(id: string): Promise<void> {
  return remove('/api/prayer-requests', id);
}

// ─── blog_categories ───────────────────────────────────────────────────────────

export interface BlogCategory {
  id: string;
  name: string;
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const res = await fetch('/api/blog-categories');
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function saveBlogCategory(cat: BlogCategory): Promise<void> {
  return upsert('/api/blog-categories', cat.id, { name: cat.name });
}

export async function deleteBlogCategory(id: string): Promise<void> {
  return remove('/api/blog-categories', id);
}

// ─── blog_posts ────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  author: string;
  coverImage?: string;
  excerpt?: string;
  content: string;
  publishedAt: string;
  isPublished: boolean;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const res = await fetch('/api/blog-posts');
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function getBlogPost(id: string): Promise<BlogPost> {
  const res = await fetch(`/api/blog-posts/${id}`);
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const res = await fetch('/api/blog-posts/all', {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function saveBlogPost(post: BlogPost): Promise<void> {
  return upsert('/api/blog-posts', post.id, {
    title: post.title, category: post.category, author: post.author,
    coverImage: post.coverImage, excerpt: post.excerpt, content: post.content,
    publishedAt: post.publishedAt, isPublished: post.isPublished
  });
}

export async function deleteBlogPost(id: string): Promise<void> {
  return remove('/api/blog-posts', id);
}

// ─── newsletter_subscribers ────────────────────────────────────────────────────

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export async function subscribeNewsletter(email: string): Promise<void> {
  const res = await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erreur serveur');
  }
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const res = await fetch('/api/newsletter', {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function deleteNewsletterSubscriber(id: string): Promise<void> {
  return remove('/api/newsletter', id);
}

// ─── partners ─────────────────────────────────────────────────────────────────

export async function getPartners(): Promise<Partner[]> {
  return getAll<Partner>('/api/partners');
}

export async function savePartner(p: Partner): Promise<void> {
  return upsert('/api/partners', p.id, p);
}

export async function deletePartner(id: string): Promise<void> {
  return remove('/api/partners', id);
}

// ─── library_books ──────────────────────────────────────────────────────────────

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category?: string;
  description?: string;
  createdAt?: string;
}

export async function getLibraryBooks(): Promise<LibraryBook[]> {
  return getAll<LibraryBook>('/api/library-books');
}

export async function saveLibraryBook(b: LibraryBook): Promise<void> {
  return upsert('/api/library-books', b.id, b);
}

export async function deleteLibraryBook(id: string): Promise<void> {
  return remove('/api/library-books', id);
}

// ─── book_orders ────────────────────────────────────────────────────────────────

export interface BookOrder {
  id: string;
  bookId?: string;
  bookTitle: string;
  name: string;
  phone?: string;
  email?: string;
  submittedAt: string;
}

export async function submitBookOrder(data: { bookId?: string; bookTitle: string; name: string; phone?: string; email?: string }): Promise<void> {
  const res = await fetch('/api/book-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erreur serveur');
  }
}

export async function getBookOrders(): Promise<BookOrder[]> {
  const res = await fetch('/api/book-orders', {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function deleteBookOrder(id: string): Promise<void> {
  return remove('/api/book-orders', id);
}

// ─── contact_messages ───────────────────────────────────────────────────────────

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  submittedAt: string;
}

export async function submitContactMessage(data: { name: string; email: string; phone?: string; subject?: string; message: string }): Promise<void> {
  const res = await fetch('/api/contact-messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erreur serveur');
  }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const res = await fetch('/api/contact-messages', {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export async function deleteContactMessage(id: string): Promise<void> {
  return remove('/api/contact-messages', id);
}

// ─── admin counts ─────────────────────────────────────────────────────────────

export interface AdminCounts {
  links: number; photos: number; events: number; testimonials: number;
  documents: number; prayers: number; donations: number; blog: number;
  newsletter: number; projects: number; audit: number; partners: number;
  books: number; bookOrders: number; contactMessages: number;
}

export async function getAdminCounts(): Promise<AdminCounts> {
  const res = await fetch('/api/admin/counts', {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

// ─── admins ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  email: string;
  addedBy: string;
  addedAt: string;
  hasPassword: boolean;
}

export async function getAdmins(): Promise<AdminUser[]> {
  const res = await fetch('/api/admins', {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  const rows = await res.json();
  return rows.map((r: any) => ({ ...r, hasPassword: !!r.hasPassword }));
}

export async function addAdmin(email: string, password?: string): Promise<void> {
  const res = await apiFetch('/api/admins', {
    method: 'POST',
    body: JSON.stringify({ email, password: password || undefined }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erreur serveur');
  }
}

export async function removeAdmin(email: string): Promise<void> {
  const res = await apiFetch(`/api/admins/${encodeURIComponent(email)}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erreur serveur');
  }
}

export async function setAdminPassword(email: string, password: string): Promise<void> {
  const res = await apiFetch(`/api/admins/${encodeURIComponent(email)}/password`, {
    method: 'PUT',
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erreur serveur');
  }
}

export async function changeMyPassword(newPassword: string, currentPassword?: string): Promise<void> {
  const res = await apiFetch('/api/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ newPassword, currentPassword: currentPassword || undefined }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erreur serveur');
  }
}

// ─── audit_log ─────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  adminEmail: string;
  action: string;
  section: string;
  itemId?: string;
  description: string;
  performedAt: string;
}

export async function getAuditLog(): Promise<AuditEntry[]> {
  const res = await fetch('/api/audit-log', {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}
