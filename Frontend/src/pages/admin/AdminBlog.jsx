import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/useI18n';
import { 
  Plus, Search, Edit2, Trash2, FileText, Calendar, 
  User, Tag, Loader2, X, CheckCircle2, AlertCircle, Upload, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AdminBlog() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    slug: '',
    author: 'Noor Pro Academy',
    category: 'Learning',
    excerpt: '',
    content: '',
    publish_date: new Date().toISOString().split('T')[0],
    read_time: '5 min read',
    seo_title: '',
    seo_description: '',
    status: 'published',
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  // Fetch blog posts from real backend API
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/posts?includeDrafts=true`);
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
      }
    } catch (err) {
      console.error('Failed to fetch blog posts', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل تحميل المقالات' : 'Failed to load blog posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        title_ar: item.title_ar || '',
        slug: item.slug || '',
        author: item.author || 'Noor Pro Academy',
        category: item.category || 'Learning',
        excerpt: item.excerpt || '',
        content: item.content || '',
        publish_date: item.publish_date ? item.publish_date.split('T')[0] : new Date().toISOString().split('T')[0],
        read_time: item.read_time || '5 min read',
        seo_title: item.seo_title || '',
        seo_description: item.seo_description || '',
        status: item.status || 'published',
      });
      setCoverPreview(item.cover_image || '');
      setCoverFile(null);
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        title_ar: '',
        slug: '',
        author: 'Noor Pro Academy',
        category: 'Learning',
        excerpt: '',
        content: '',
        publish_date: new Date().toISOString().split('T')[0],
        read_time: '5 min read',
        seo_title: '',
        seo_description: '',
        status: 'published',
      });
      setCoverPreview('');
      setCoverFile(null);
    }
    setModalOpen(true);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'عنوان المقال مطلوب' : 'Article title is required',
        variant: 'destructive',
      });
      return;
    }
    if (!editingItem && !coverFile) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'صورة الغلاف مطلوبة' : 'Cover image file is required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const endpoint = editingItem ? `${API_URL}/api/posts/${editingItem.id}` : `${API_URL}/api/posts`;
      const method = editingItem ? 'PUT' : 'POST';

      const dataPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        dataPayload.append(key, formData[key]);
      });
      if (coverFile) {
        dataPayload.append('cover_image', coverFile);
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: dataPayload,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to save blog post');

      toast({
        title: isAr ? 'تم بنجاح' : 'Success',
        description: isAr 
          ? (editingItem ? 'تم تحديث المقال بنجاح' : 'تم إضافة المقال بنجاح') 
          : (editingItem ? 'Blog post updated successfully' : 'Blog post created successfully'),
      });

      setModalOpen(false);
      fetchPosts();
    } catch (err) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: err.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const promptDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/api/posts/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete blog post');

      toast({
        title: isAr ? 'تم الحذف' : 'Deleted',
        description: isAr ? 'تم حذف المقال بنجاح' : 'Blog post removed successfully',
      });

      setPosts(posts.filter((p) => p.id !== itemToDelete.id));
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const filtered = posts.filter((p) =>
    !search ||
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.title_ar?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#112d27]">
            {isAr ? 'إدارة المدونة' : 'Blog Management'}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
            {isAr ? 'إنشاء وتعديل مقالات المنصة والمحتوى التعليمي.' : 'Create, update, and manage academy blog posts and articles.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'ابحث عن المقالات...' : 'Search articles...'}
              className="ps-9 h-10 text-xs sm:text-sm font-semibold border-gray-200 focus:border-[#009688] rounded-xl"
            />
          </div>

          <Button
            onClick={() => handleOpenModal()}
            className="bg-[#009688] hover:bg-[#00796b] text-white font-extrabold rounded-xl h-10 text-xs gap-1.5 shrink-0 shadow-md shadow-[#009688]/15"
          >
            <Plus className="w-4 h-4" />
            {isAr ? 'إضافة مقال' : 'Add Article'}
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs sm:text-sm">
            <thead className="bg-[#f8fcfb] text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-4 py-3.5 text-start">{isAr ? 'العنوان' : 'Article Title'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'التصنيف' : 'Category'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'الكاتب' : 'Author'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'تاريخ النشر' : 'Publish Date'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3.5 text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium text-[#112d27]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#009688]" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 font-semibold text-xs">
                    {isAr ? 'لا توجد مقالات مطابقة للبحث.' : 'No blog posts found matching search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const title = isAr ? item.title_ar || item.title : item.title;
                  const isPublished = item.status === 'published';

                  return (
                    <tr key={item.id} className="hover:bg-[#f8fcfb]/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold">
                        <div className="flex items-center gap-3">
                          {item.cover_image ? (
                            <img src={item.cover_image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 border border-gray-100" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-[#009688]/10 text-[#009688] font-black text-xs flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <span className="truncate max-w-[220px] text-[#112d27]">{title}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#009688] bg-[#009688]/10 px-2.5 py-0.5 rounded-md">
                          <Tag className="w-3 h-3" />
                          {item.category || 'General'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-gray-600 font-medium">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{item.author || 'Noor Pro Academy'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-gray-400 text-xs font-semibold">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{item.publish_date ? item.publish_date.split('T')[0] : '—'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md capitalize',
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          )}
                        >
                          {isPublished ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {item.status || 'published'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenModal(item)}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-[#009688] hover:bg-[#009688]/10 rounded-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => promptDelete(item)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-extrabold text-[#112d27] text-base">
                {editingItem ? (isAr ? 'تعديل المقال' : 'Edit Article') : (isAr ? 'إضافة مقال جديد' : 'Add New Article')}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'عنوان المقال (EN)' : 'Title (EN)'}</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-10 text-xs font-semibold rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'عنوان المقال (AR)' : 'Title (AR)'}</Label>
                  <Input
                    value={formData.title_ar}
                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                    className="h-10 text-xs font-semibold rounded-xl"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'التصنيف' : 'Category'}</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="h-10 text-xs font-semibold rounded-xl"
                    placeholder="e.g. Learning, Grammar"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الكاتب' : 'Author'}</Label>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="h-10 text-xs font-semibold rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'وقت القراءة' : 'Read Time'}</Label>
                  <Input
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                    className="h-10 text-xs font-semibold rounded-xl"
                    placeholder="5 min read"
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'صورة الغلاف' : 'Cover Image'}</Label>
                <div className="flex items-center gap-4">
                  {coverPreview && (
                    <img src={coverPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0" />
                  )}
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#009688] rounded-2xl p-4 cursor-pointer bg-gray-50/50 transition-all">
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-[11px] font-bold text-gray-600">{isAr ? 'اختر صورة الغلاف' : 'Upload cover image file'}</span>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'تاريخ النشر' : 'Publish Date'}</Label>
                  <Input
                    type="date"
                    value={formData.publish_date}
                    onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                    className="h-10 text-xs font-semibold rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الحالة' : 'Status'}</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#112d27]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'ملخص المقال (Excerpt)' : 'Excerpt'}</Label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full p-2.5 text-xs font-semibold rounded-xl border border-gray-200 focus:outline-none focus:border-[#009688]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'محتوى المقال (Markdown)' : 'Content (Markdown)'}</Label>
                <textarea
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-2.5 text-xs font-semibold rounded-xl border border-gray-200 focus:outline-none focus:border-[#009688]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="h-10 rounded-xl text-xs font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#009688] hover:bg-[#00796b] text-white h-10 rounded-xl text-xs font-bold px-5 gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isAr ? 'حفظ المقال' : 'Save Article'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Popup */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-[#112d27] text-base">
              {isAr ? 'حذف المقال' : 'Delete Article'}
            </h3>
            <p className="text-xs text-gray-500">
              {isAr ? 'هل أنت متأكد من رغبتك في حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this article? This action cannot be undone.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 rounded-xl text-xs font-bold"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isAr ? 'حذف' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}