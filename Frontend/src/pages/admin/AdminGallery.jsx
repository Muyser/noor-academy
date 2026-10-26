import { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Edit2, Loader2, X, Upload, AlertTriangle, Play } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AdminGallery() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('events');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [isVideo, setIsVideo] = useState(false);

  // Video Playback Lightbox State
  const [playingVideo, setPlayingVideo] = useState(null);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const categories = [
    { key: 'events', label: isAr ? 'الفعاليات' : 'Events' },
    { key: 'classes', label: isAr ? 'الفصول' : 'Classes' },
    { key: 'certificates', label: isAr ? 'الشهادات' : 'Certificates' },
    { key: 'campus', label: isAr ? 'المنشأة' : 'Campus' },
  ];

  // Fetch gallery items
  const fetchGallery = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gallery`);
      const data = await res.json();
      if (res.ok) {
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch gallery items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setTitle(item.title || '');
      setCategory(item.category || 'events');
      setDescription(item.description || '');
      setMediaPreview(item.image || '');
      setIsVideo(item.type === 'video');
      setMediaFile(null);
    } else {
      setEditingItem(null);
      setTitle('');
      setCategory('events');
      setDescription('');
      setMediaPreview('');
      setIsVideo(false);
      setMediaFile(null);
    }
    setIsModalOpen(true);
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setIsVideo(file.type.startsWith('video/'));
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      toast({ title: isAr ? 'خطأ' : 'Error', description: isAr ? 'العنوان مطلوب' : 'Title is required', variant: 'destructive' });
      return;
    }
    if (!editingItem && !mediaFile) {
      toast({ title: isAr ? 'خطأ' : 'Error', description: isAr ? 'ملف الصورة أو الفيديو مطلوب' : 'Image or Video file is required', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('description', description);
    if (mediaFile) {
      formData.append('image', mediaFile);
    }

    try {
      const token = localStorage.getItem('token') || '';
      const endpoint = editingItem ? `${API_URL}/api/gallery/${editingItem._id}` : `${API_URL}/api/gallery`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to save item');

      toast({
        title: isAr ? 'تم بنجاح' : 'Success',
        description: isAr ? (editingItem ? 'تم تحديث العنصر بنجاح' : 'تم إضافة العنصر بنجاح') : (editingItem ? 'Gallery item updated successfully' : 'Gallery item created successfully'),
      });

      setIsModalOpen(false);
      fetchGallery();
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
      const res = await fetch(`${API_URL}/api/gallery/${itemToDelete._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete item');

      toast({
        title: isAr ? 'تم الحذف' : 'Deleted',
        description: isAr ? 'تم حذف العنصر بنجاح' : 'Gallery item removed successfully',
      });

      setItems(items.filter((item) => item._id !== itemToDelete._id));
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

  return (
    <div className={`space-y-6 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#112d27]">
            {isAr ? 'إدارة معرض الصور والفيديو' : 'Gallery Management'}
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {isAr ? 'إضافة وتعديل وحذف صور وفيديوهات الأنشطة والفعاليات في الأكاديمية.' : 'Add, edit, and manage academy photos and videos.'}
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[#009688] hover:bg-[#00796b] text-white font-bold rounded-xl gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {isAr ? 'إضافة وسائط جديدة' : 'Add New Media'}
        </Button>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#009688] animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-[#112d27] text-base mb-1">{isAr ? 'لا توجد عناصر حالياً' : 'No gallery items found'}</h3>
          <p className="text-xs text-gray-400 mb-4">{isAr ? 'ابدأ بإضافة أول صورة أو فيديو للمعرض.' : 'Start by adding your first photo or video to the gallery.'}</p>
          <Button onClick={() => handleOpenModal()} className="bg-[#009688] hover:bg-[#00796b] text-white font-bold rounded-xl text-xs">
            {isAr ? 'إضافة وسائط' : 'Add Media'}
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const itemIsVideo = item.type === 'video' || item.image?.endsWith('.mp4');

            return (
              <div key={item._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm flex flex-col justify-between group">
                <div 
                  onClick={() => itemIsVideo && setPlayingVideo(item)}
                  className={cn(
                    "relative h-36 bg-gray-900 overflow-hidden flex items-center justify-center",
                    itemIsVideo && "cursor-pointer"
                  )}
                >
                  {itemIsVideo ? (
                    <>
                      <video src={item.image} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-[#009688] text-white flex items-center justify-center shadow-lg shadow-[#009688]/40 group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ms-0.5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}

                  <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-extrabold text-[#009688] uppercase shadow-sm">
                    {item.category}
                  </span>
                </div>

                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="font-bold text-[#112d27] text-xs mb-1 truncate">{item.title}</h3>
                  {item.description && <p className="text-[11px] text-gray-500 line-clamp-2 mb-3">{item.description}</p>}
                  
                  <div className="flex items-center justify-end gap-1.5 mt-auto pt-2 border-t border-gray-50">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenModal(item)}
                      className="h-7 px-2.5 rounded-lg text-[11px] font-bold text-gray-600 hover:text-[#009688]"
                    >
                      <Edit2 className="w-3 h-3 me-1" />
                      {isAr ? 'تعديل' : 'Edit'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => promptDelete(item)}
                      className="h-7 px-2.5 rounded-lg text-[11px] font-bold text-red-600 hover:bg-red-50 hover:border-red-200"
                    >
                      <Trash2 className="w-3 h-3 me-1" />
                      {isAr ? 'حذف' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Lightbox Playback Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
            <div className="flex items-center justify-between p-4 bg-gray-900 text-white border-b border-gray-800">
              <h3 className="font-extrabold text-sm truncate">{playingVideo.title}</h3>
              <button onClick={() => setPlayingVideo(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              <video src={playingVideo.image} controls autoPlay className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-extrabold text-[#112d27] text-base">
                {editingItem ? (isAr ? 'تعديل عنصر المعرض' : 'Edit Gallery Item') : (isAr ? 'إضافة عنصر جديد للمعرض' : 'Add New Gallery Item')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'العنوان' : 'Title'}</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isAr ? 'أدخل عنوان العنصر' : 'Enter title'}
                  className="h-10 text-xs font-semibold rounded-xl"
                  required
                />
              </div>

              {/* Category Select */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'القسم' : 'Category'}</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-gray-200 bg-white focus:border-[#009688] focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الوصف' : 'Description'}</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isAr ? 'أدخل وصفاً مختصراً (اختياري)' : 'Enter short description (optional)'}
                  className="w-full h-20 p-3 text-xs font-semibold rounded-xl border border-gray-200 focus:border-[#009688] focus:outline-none resize-none"
                />
              </div>

              {/* Media File Upload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الملف (صورة أو فيديو)' : 'Media (Image or Video)'}</Label>
                <div className="flex items-center gap-4">
                  {mediaPreview && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-black flex items-center justify-center">
                      {isVideo ? (
                        <video src={mediaPreview} className="w-full h-full object-cover" controls />
                      ) : (
                        <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#009688] rounded-2xl p-4 cursor-pointer bg-gray-50/50 transition-all">
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-[11px] font-bold text-gray-600">
                      {isAr ? 'اختر صورة أو ملف فيديو' : 'Upload image or video file'}
                    </span>
                    <span className="text-[9px] text-gray-400 mt-0.5">MP4, WEBM, JPG, PNG, WEBP</span>
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      onChange={handleMediaChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#009688] hover:bg-[#00796b] text-white font-bold rounded-xl text-xs gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingItem ? (isAr ? 'تعديل' : 'Save Changes') : (isAr ? 'إضافة' : 'Upload Item')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-[#112d27] text-base">
              {isAr ? 'حذف عنصر المعرض' : 'Delete Gallery Item'}
            </h3>
            <p className="text-xs text-gray-500">
              {isAr ? 'هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this item? This action cannot be undone.'}
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