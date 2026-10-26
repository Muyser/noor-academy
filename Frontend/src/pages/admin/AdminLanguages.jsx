import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/useI18n';
import { 
  Plus, Search, Edit2, Trash2, Loader2, X, 
  CheckCircle2, AlertCircle, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AdminLanguages() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [languages, setLanguages] = useState([]);
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
    name: '',
    name_ar: '',
    slug: '',
    description: '',
    description_ar: '',
    image: '',
    flag: '🌐',
    order: 1,
    status: 'active',
  });

  // Fetch languages from real backend API
  const fetchLanguages = async () => {
    try {
      const res = await fetch(`${API_URL}/api/languages`);
      const data = await res.json();
      if (res.ok) {
        setLanguages(data);
      }
    } catch (err) {
      console.error('Failed to fetch languages', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل تحميل اللغات' : 'Failed to load languages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        name_ar: '',
        slug: '',
        description: '',
        description_ar: '',
        image: '',
        flag: '🌐',
        order: languages.length + 1,
        status: 'active',
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'اسم اللغة والرابط مطلوبان' : 'Language name and slug are required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const endpoint = editingItem ? `${API_URL}/api/languages/${editingItem.id}` : `${API_URL}/api/languages`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to save language');

      toast({
        title: isAr ? 'تم بنجاح' : 'Success',
        description: isAr 
          ? (editingItem ? 'تم تحديث اللغة بنجاح' : 'تم إضافة اللغة بنجاح') 
          : (editingItem ? 'Language updated successfully' : 'Language created successfully'),
      });

      setModalOpen(false);
      fetchLanguages();
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
      const res = await fetch(`${API_URL}/api/languages/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete language');

      toast({
        title: isAr ? 'تم الحذف' : 'Deleted',
        description: isAr ? 'تم حذف اللغة بنجاح' : 'Language removed successfully',
      });

      setLanguages(languages.filter((l) => l.id !== itemToDelete.id));
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

  const filtered = languages.filter((l) =>
    !search ||
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.name_ar?.toLowerCase().includes(search.toLowerCase()) ||
    l.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`max-w-6xl mx-auto space-y-6 px-3 sm:px-0 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#112d27] tracking-tight">
            {isAr ? 'إدارة اللغات' : 'Languages Management'}
          </h1>
          <p className="text-xs sm:text-sm font-normal text-gray-500 mt-1">
            {isAr ? 'إدارة وتصنيف لغات التدريس المتاحة في الأكاديمية.' : 'Manage available teaching languages across the academy.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'ابحث عن لغة...' : 'Search languages...'}
              className="ps-9 h-10 text-xs sm:text-sm font-normal border-gray-200 focus:border-[#009688] rounded-xl w-full"
            />
          </div>

          <Button
            onClick={() => handleOpenModal()}
            className="bg-[#009688] hover:bg-[#00796b] text-white font-bold rounded-xl h-10 text-xs gap-1.5 shrink-0 shadow-md shadow-[#009688]/15"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة لغة' : 'Add Language'}</span>
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs sm:text-sm">
            <thead className="bg-[#f8fcfb] text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-4 sm:px-6 py-3.5 text-start">{isAr ? 'اسم اللغة' : 'Language Name'}</th>
                <th className="px-4 sm:px-6 py-3.5 text-start">{isAr ? 'الاسم بالعربية' : 'Arabic Name'}</th>
                <th className="px-4 sm:px-6 py-3.5 text-start">{isAr ? 'الرابط (Slug)' : 'Slug'}</th>
                <th className="px-4 sm:px-6 py-3.5 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="px-4 sm:px-6 py-3.5 text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-normal text-[#112d27]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#009688]" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 font-normal text-xs">
                    {isAr ? 'لا توجد لغات مطابقة للبحث.' : 'No languages found matching search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isActive = item.status === 'active';

                  return (
                    <tr key={item.id} className="hover:bg-[#f8fcfb]/80 transition-colors">
                      <td className="px-4 sm:px-6 py-3.5 font-bold">
                        <div className="flex items-center gap-3">
                          <span className="text-xl shrink-0">{item.flag || '🌐'}</span>
                          <span className="text-[#112d27] truncate max-w-[130px] sm:max-w-[180px]">{item.name}</span>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-3.5 text-gray-600 font-normal truncate max-w-[130px] sm:max-w-[180px]">
                        {item.name_ar || '—'}
                      </td>

                      <td className="px-4 sm:px-6 py-3.5 font-mono text-xs text-[#009688] truncate max-w-[120px]">
                        {item.slug}
                      </td>

                      <td className="px-4 sm:px-6 py-3.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-md capitalize',
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          <span>{item.status || 'active'}</span>
                        </span>
                      </td>

                      <td className="px-4 sm:px-6 py-3.5 text-end">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-[#112d27] text-base">
                {editingItem ? (isAr ? 'تعديل بيانات اللغة' : 'Edit Language') : (isAr ? 'إضافة لغة جديدة' : 'Add New Language')}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'اسم اللغة (EN)' : 'Language Name (EN)'}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-10 text-xs font-normal rounded-xl w-full"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'رمز العلم' : 'Flag Emoji'}</Label>
                  <Input
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    className="h-10 text-center text-base rounded-xl w-full"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
                  <Input
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    className="h-10 text-xs font-normal rounded-xl w-full"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الرابط المختصر (Slug)' : 'Slug'}</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="h-10 text-xs font-normal rounded-xl w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الحالة' : 'Status'}</Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-normal text-[#112d27]"
                >
                  <option value="active">Active</option>
                  <option value="hidden">Hidden</option>
                </select>
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
                  <span>{isAr ? 'حفظ البيانات' : 'Save Changes'}</span>
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
            <h3 className="font-bold text-[#112d27] text-base">
              {isAr ? 'حذف اللغة' : 'Delete Language'}
            </h3>
            <p className="text-xs text-gray-500 font-normal">
              {isAr ? 'هل أنت متأكد من رغبتك في حذف هذه اللغة؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this language? This action cannot be undone.'}
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
                <span>{isAr ? 'حذف' : 'Delete'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}