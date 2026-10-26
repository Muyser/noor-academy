import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/useI18n';
import { 
  Plus, Search, Edit2, Trash2, BarChart3, Loader2, X, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AdminStatistics() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    label: '',
    label_ar: '',
    value: 0,
    icon: 'BookOpen',
    order: 1,
  });

  // Fetch live dynamic platform statistics from the backend API
  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/api/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load statistics');

      setStatistics(data);
    } catch (err) {
      console.error('Failed to fetch statistics', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل تحميل بيانات الإحصائيات' : 'Failed to load platform statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        label: '',
        label_ar: '',
        value: 0,
        icon: 'BookOpen',
        order: statistics.length + 1,
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token') || '';
      const endpoint = editingItem 
        ? `${API_URL}/api/statistics/${editingItem.id}` 
        : `${API_URL}/api/statistics`;
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
      if (!res.ok) throw new Error(data.message || 'Failed to save statistic');

      toast({
        title: isAr ? 'تم بنجاح' : 'Success',
        description: isAr ? 'تم حفظ الإحصائية بنجاح' : 'Statistic saved successfully',
      });

      setModalOpen(false);
      fetchStatistics();
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
      const res = await fetch(`${API_URL}/api/statistics/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete statistic');

      toast({
        title: isAr ? 'تم الحذف' : 'Deleted',
        description: isAr ? 'تم حذف الإحصائية بنجاح' : 'Statistic removed successfully',
      });

      setStatistics((prev) => prev.filter((s) => s.id !== itemToDelete.id));
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

  const filtered = statistics.filter((s) =>
    !search ||
    s.label?.toLowerCase().includes(search.toLowerCase()) ||
    s.label_ar?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`max-w-6xl mx-auto space-y-6 px-3 sm:px-0 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#112d27] tracking-tight">
            {isAr ? 'إدارة الإحصائيات' : 'Platform Statistics'}
          </h1>
          <p className="text-xs sm:text-sm font-normal text-gray-500 mt-1">
            {isAr ? 'إدارة مؤشرات الأداء والبيانات الإحصائية المعروضة في الصفحة الرئيسية.' : 'Manage key statistics and highlight counters displayed on the landing page.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'ابحث في الإحصائيات...' : 'Search statistics...'}
              className="ps-9 h-10 text-xs sm:text-sm font-normal border-gray-200 focus:border-[#009688] rounded-xl w-full"
            />
          </div>

          <Button
            onClick={() => handleOpenModal()}
            className="bg-[#009688] hover:bg-[#00796b] text-white font-bold rounded-xl h-10 text-xs gap-1.5 shrink-0 shadow-md shadow-[#009688]/15"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة مؤشر' : 'Add Metric'}</span>
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm space-y-2 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-7 bg-gray-100 rounded w-1/3" />
            </div>
          ))
        ) : (
          statistics.slice(0, 4).map((stat) => (
            <div key={stat.id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 truncate max-w-[100px] sm:max-w-[140px]">
                  {isAr ? stat.label_ar || stat.label : stat.label}
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#009688]/10 text-[#009688] flex items-center justify-center font-bold shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#112d27] mt-0.5">{stat.value}</div>
            </div>
          ))
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs sm:text-sm">
            <thead className="bg-[#f8fcfb] text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-4 sm:px-6 py-3.5 text-start">{isAr ? 'المسمى (EN)' : 'Label (EN)'}</th>
                <th className="px-4 sm:px-6 py-3.5 text-start">{isAr ? 'المسمى (AR)' : 'Label (AR)'}</th>
                <th className="px-4 sm:px-6 py-3.5 text-start">{isAr ? 'القيمة' : 'Value'}</th>
                <th className="px-4 sm:px-6 py-3.5 text-start">{isAr ? 'رمز الأيقونة' : 'Icon Name'}</th>
                <th className="px-4 sm:px-6 py-3.5 text-start">{isAr ? 'الترتيب' : 'Order'}</th>
                <th className="px-4 sm:px-6 py-3.5 text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-normal text-[#112d27]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#009688]" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 font-normal text-xs">
                    {isAr ? 'لا توجد إحصائيات مطابقة للبحث.' : 'No statistics found matching search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8fcfb]/80 transition-colors">
                    <td className="px-4 sm:px-6 py-3.5 font-bold text-[#112d27] truncate max-w-[130px] sm:max-w-[180px]">
                      {item.label}
                    </td>

                    <td className="px-4 sm:px-6 py-3.5 text-gray-600 font-normal truncate max-w-[130px] sm:max-w-[180px]">
                      {item.label_ar || '—'}
                    </td>

                    <td className="px-4 sm:px-6 py-3.5 font-bold text-[#009688]">
                      {item.value}
                    </td>

                    <td className="px-4 sm:px-6 py-3.5 font-mono text-xs text-gray-400">
                      {item.icon || 'BookOpen'}
                    </td>

                    <td className="px-4 sm:px-6 py-3.5 font-mono text-xs text-gray-400">
                      #{item.order || 1}
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
                ))
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
                {editingItem ? (isAr ? 'تعديل المؤشر الإحصائي' : 'Edit Statistic') : (isAr ? 'إضافة مؤشر إحصائي جديد' : 'Add New Statistic')}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'المسمى بالإنجليزية (EN)' : 'Label (EN)'}</Label>
                <Input
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="h-10 text-xs font-normal rounded-xl w-full"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'المسمى بالعربية (AR)' : 'Label (AR)'}</Label>
                <Input
                  value={formData.label_ar}
                  onChange={(e) => setFormData({ ...formData, label_ar: e.target.value })}
                  className="h-10 text-xs font-normal rounded-xl w-full"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'القيمة' : 'Value'}</Label>
                  <Input
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="h-10 text-xs font-normal rounded-xl w-full"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'اسم الأيقونة (Lucide)' : 'Icon Name (Lucide)'}</Label>
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="h-10 text-xs font-normal rounded-xl w-full"
                    placeholder="e.g. Users, Award, BookOpen"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الترتيب' : 'Order'}</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  className="h-10 text-xs font-normal rounded-xl w-full"
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
              {isAr ? 'حذف الإحصائية' : 'Delete Statistic'}
            </h3>
            <p className="text-xs text-gray-500 font-normal">
              {isAr ? 'هل أنت متأكد من رغبتك في حذف هذا المؤشر الإحصائي؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this statistic? This action cannot be undone.'}
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