import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/useI18n';
import { 
  Plus, Search, Edit2, Trash2, HelpCircle, 
  Tag, Loader2, X, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AdminFAQ() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [faqs, setFaqs] = useState([]);
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

  const [formData, setFormData] = useState({
    question: '',
    question_ar: '',
    answer: '',
    answer_ar: '',
    category: 'general',
    order: 1,
  });

  // Fetch FAQs from real backend API
  const fetchFaqs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/faqs`);
      const data = await res.json();
      if (res.ok) {
        setFaqs(data);
      }
    } catch (err) {
      console.error('Failed to fetch FAQs', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل تحميل الأسئلة الشائعة' : 'Failed to load FAQs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        question: '',
        question_ar: '',
        answer: '',
        answer_ar: '',
        category: 'general',
        order: faqs.length + 1,
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'السؤال والإجابة باللغة الإنجليزية مطلوبان' : 'English question and answer are required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const endpoint = editingItem ? `${API_URL}/api/faqs/${editingItem.id}` : `${API_URL}/api/faqs`;
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

      if (!res.ok) throw new Error(data.message || 'Failed to save FAQ');

      toast({
        title: isAr ? 'تم بنجاح' : 'Success',
        description: isAr 
          ? (editingItem ? 'تم تحديث السؤال بنجاح' : 'تم إضافة السؤال بنجاح') 
          : (editingItem ? 'FAQ updated successfully' : 'FAQ created successfully'),
      });

      setModalOpen(false);
      fetchFaqs();
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
      const res = await fetch(`${API_URL}/api/faqs/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete FAQ');

      toast({
        title: isAr ? 'تم الحذف' : 'Deleted',
        description: isAr ? 'تم حذف السؤال بنجاح' : 'FAQ removed successfully',
      });

      setFaqs(faqs.filter((f) => f.id !== itemToDelete.id));
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

  const filtered = faqs.filter((f) =>
    !search ||
    f.question?.toLowerCase().includes(search.toLowerCase()) ||
    f.question_ar?.toLowerCase().includes(search.toLowerCase()) ||
    f.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#112d27]">
            {isAr ? 'إدارة الأسئلة الشائعة' : 'FAQ Management'}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
            {isAr ? 'إضافة وتعديل الأسئلة والأجوبة الأكثر تكراراً للطلاب.' : 'Create, update, and manage common student questions.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'ابحث عن سؤال...' : 'Search questions...'}
              className="ps-9 h-10 text-xs sm:text-sm font-semibold border-gray-200 focus:border-[#009688] rounded-xl"
            />
          </div>

          <Button
            onClick={() => handleOpenModal()}
            className="bg-[#009688] hover:bg-[#00796b] text-white font-extrabold rounded-xl h-10 text-xs gap-1.5 shrink-0 shadow-md shadow-[#009688]/15"
          >
            <Plus className="w-4 h-4" />
            {isAr ? 'إضافة سؤال' : 'Add Question'}
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs sm:text-sm">
            <thead className="bg-[#f8fcfb] text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-4 py-3.5 text-start">{isAr ? 'السؤال (EN)' : 'Question (EN)'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'السؤال (AR)' : 'Question (AR)'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'الفئة' : 'Category'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'الترتيب' : 'Order'}</th>
                <th className="px-4 py-3.5 text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium text-[#112d27]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#009688]" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 font-semibold text-xs">
                    {isAr ? 'لا توجد أسئلة مطابقة للبحث.' : 'No FAQs found matching search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8fcfb]/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold">
                      <div className="flex items-center gap-2.5">
                        <HelpCircle className="w-4 h-4 text-[#009688] shrink-0" />
                        <span className="truncate max-w-[220px]">{item.question}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-gray-600 font-medium truncate max-w-[220px]">
                      {item.question_ar || '—'}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#009688] bg-[#009688]/10 px-2.5 py-0.5 rounded-md capitalize">
                        <Tag className="w-3 h-3" />
                        {item.category || 'general'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-500">
                      #{item.order || 1}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-extrabold text-[#112d27] text-base">
                {editingItem ? (isAr ? 'تعديل السؤال' : 'Edit Question') : (isAr ? 'إضافة سؤال جديد' : 'Add New Question')}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'السؤال (EN)' : 'Question (EN)'}</Label>
                <Input
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="h-10 text-xs font-semibold rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'السؤال (AR)' : 'Question (AR)'}</Label>
                <Input
                  value={formData.question_ar}
                  onChange={(e) => setFormData({ ...formData, question_ar: e.target.value })}
                  className="h-10 text-xs font-semibold rounded-xl"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الفئة' : 'Category'}</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="h-10 text-xs font-semibold rounded-xl"
                    placeholder="general, certificates, technical"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الترتيب' : 'Order'}</Label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="h-10 text-xs font-semibold rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الإجابة (EN)' : 'Answer (EN)'}</Label>
                <textarea
                  rows={3}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full p-2.5 text-xs font-semibold rounded-xl border border-gray-200 focus:outline-none focus:border-[#009688]"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الإجابة (AR)' : 'Answer (AR)'}</Label>
                <textarea
                  rows={3}
                  value={formData.answer_ar}
                  onChange={(e) => setFormData({ ...formData, answer_ar: e.target.value })}
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
                  {isAr ? 'حفظ البيانات' : 'Save Changes'}
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
              {isAr ? 'حذف السؤال' : 'Delete Question'}
            </h3>
            <p className="text-xs text-gray-500">
              {isAr ? 'هل أنت متأكد من رغبتك في حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this FAQ? This action cannot be undone.'}
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