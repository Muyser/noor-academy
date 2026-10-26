import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/useI18n';
import { 
  Plus, Search, Edit2, Trash2, Star, Users, 
  Loader2, X, Upload, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AdminInstructors() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [instructors, setInstructors] = useState([]);
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
    role: '',
    description: '',
    learners_count: 0,
    courses_count: 0,
    averageRating: 4.9,
    order: 1,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Fetch instructors from real backend API
  const fetchInstructors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/instructors`);
      const data = await res.json();
      if (res.ok) {
        setInstructors(data);
      }
    } catch (err) {
      console.error('Failed to fetch instructors', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل تحميل المحاضرين' : 'Failed to load instructors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleOpenModal = (instructor = null) => {
    if (instructor) {
      setEditingItem(instructor);
      setFormData({
        name: instructor.name || '',
        role: instructor.role || '',
        description: instructor.description || '',
        learners_count: instructor.learners_count || 0,
        courses_count: instructor.courses_count || 0,
        averageRating: instructor.averageRating || 4.9,
        order: instructor.order || 1,
      });
      setImagePreview(instructor.image || '');
      setImageFile(null);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        role: '',
        description: '',
        learners_count: 0,
        courses_count: 0,
        averageRating: 4.9,
        order: instructors.length + 1,
      });
      setImagePreview('');
      setImageFile(null);
    }
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.role) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'اسم المحاضر والدور مطلوبان' : 'Instructor name and role are required',
        variant: 'destructive',
      });
      return;
    }
    if (!editingItem && !imageFile) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'صورة المحاضر مطلوبة' : 'Instructor image file is required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const endpoint = editingItem ? `${API_URL}/api/instructors/${editingItem.id}` : `${API_URL}/api/instructors`;
      const method = editingItem ? 'PUT' : 'POST';

      const dataPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        dataPayload.append(key, formData[key]);
      });
      if (imageFile) {
        dataPayload.append('image', imageFile);
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: dataPayload,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to save instructor');

      toast({
        title: isAr ? 'تم بنجاح' : 'Success',
        description: isAr 
          ? (editingItem ? 'تم تحديث المحاضر بنجاح' : 'تم إضافة المحاضر بنجاح') 
          : (editingItem ? 'Instructor updated successfully' : 'Instructor created successfully'),
      });

      setModalOpen(false);
      fetchInstructors();
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
      const res = await fetch(`${API_URL}/api/instructors/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete instructor');

      toast({
        title: isAr ? 'تم الحذف' : 'Deleted',
        description: isAr ? 'تم حذف المحاضر بنجاح' : 'Instructor removed successfully',
      });

      setInstructors(instructors.filter((i) => i.id !== itemToDelete.id));
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

  const filtered = instructors.filter((inst) =>
    !search ||
    inst.name?.toLowerCase().includes(search.toLowerCase()) ||
    inst.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#112d27]">
            {isAr ? 'إدارة المحاضرين' : 'Instructors Management'}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
            {isAr ? 'إضافة وتعديل بيانات المحاضرين والمدربين في الأكاديمية.' : 'Add, update, or remove instructors and their course metrics.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'ابحث باسم المحاضر...' : 'Search instructors...'}
              className="ps-9 h-10 text-xs sm:text-sm font-semibold border-gray-200 focus:border-[#009688] rounded-xl"
            />
          </div>

          <Button
            onClick={() => handleOpenModal()}
            className="bg-[#009688] hover:bg-[#00796b] text-white font-extrabold rounded-xl h-10 text-xs gap-1.5 shrink-0 shadow-md shadow-[#009688]/15"
          >
            <Plus className="w-4 h-4" />
            {isAr ? 'إضافة محاضر' : 'Add Instructor'}
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs sm:text-sm">
            <thead className="bg-[#f8fcfb] text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-4 py-3.5 text-start">{isAr ? 'المحاضر' : 'Instructor'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'التخصص' : 'Role'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'التقييم' : 'Rating'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'الطلاب' : 'Learners'}</th>
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
                    {isAr ? 'لا يوجد محاضرين مطبقين للبحث.' : 'No instructors found matching search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((inst) => (
                  <tr key={inst.id} className="hover:bg-[#f8fcfb]/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold">
                      <div className="flex items-center gap-3">
                        <img
                          src={inst.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt={inst.name}
                          className="w-9 h-9 rounded-xl object-cover shrink-0 border border-gray-200"
                        />
                        <div>
                          <div className="truncate max-w-[180px] text-[#112d27]">{inst.name}</div>
                          <div className="text-[10px] text-gray-400 font-medium truncate">{inst.courses_count || 0} {isAr ? 'دورات' : 'courses'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-gray-600 font-medium truncate max-w-[200px]">
                      {inst.role}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {inst.averageRating || 4.9}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-gray-600 font-bold">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span>{inst.learners_count || 0}+</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenModal(inst)}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-[#009688] hover:bg-[#009688]/10 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => promptDelete(inst)}
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
          <div className="bg-white rounded-3xl border border-gray-100 max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-extrabold text-[#112d27] text-base">
                {editingItem ? (isAr ? 'تعديل بيانات المحاضر' : 'Edit Instructor') : (isAr ? 'إضافة محاضر جديد' : 'Add New Instructor')}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'اسم المحاضر' : 'Instructor Name'}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10 text-xs font-semibold rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'التخصص أو المسمى الوظيفي' : 'Role / Title'}</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="h-10 text-xs font-semibold rounded-xl"
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'صورة المحاضر' : 'Instructor Image'}</Label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0" />
                  )}
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#009688] rounded-2xl p-4 cursor-pointer bg-gray-50/50 transition-all">
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-[11px] font-bold text-gray-600">{isAr ? 'اختر صورة المحاضر' : 'Upload image file'}</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'نبذة تعريفية' : 'Description'}</Label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 text-xs font-semibold rounded-xl border border-gray-200 focus:outline-none focus:border-[#009688]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الطلاب' : 'Learners'}</Label>
                  <Input
                    type="number"
                    value={formData.learners_count}
                    onChange={(e) => setFormData({ ...formData, learners_count: Number(e.target.value) })}
                    className="h-10 text-xs font-semibold rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الدورات' : 'Courses'}</Label>
                  <Input
                    type="number"
                    value={formData.courses_count}
                    onChange={(e) => setFormData({ ...formData, courses_count: Number(e.target.value) })}
                    className="h-10 text-xs font-semibold rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'التقييم' : 'Rating'}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.averageRating}
                    onChange={(e) => setFormData({ ...formData, averageRating: Number(e.target.value) })}
                    className="h-10 text-xs font-semibold rounded-xl"
                  />
                </div>
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
              {isAr ? 'حذف المحاضر' : 'Delete Instructor'}
            </h3>
            <p className="text-xs text-gray-500">
              {isAr ? 'هل أنت متأكد من رغبتك في حذف هذا المحاضر؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this instructor? This action cannot be undone.'}
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