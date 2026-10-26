import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/useI18n';
import { 
  Plus, Search, Edit2, Trash2, BookOpen, 
  Loader2, X, CheckCircle2, AlertCircle, Upload, 
  AlertTriangle, Layers, Video, FileText, PlusCircle, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AdminCourses() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // Course Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Curriculum Builder Modal State
  const [curriculumModalOpen, setCurriculumModalOpen] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionTitleAr, setNewSectionTitleAr] = useState('');

  // Lecture Modal State (Includes is_preview flag)
  const [lectureModalOpen, setLectureModalOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [lectureData, setLectureData] = useState({
    title: '',
    title_ar: '',
    type: 'video',
    duration: '10:00',
    is_preview: false, // Flag for free preview access
    content: '',
  });
  const [lectureFile, setLectureFile] = useState(null);
  const [submittingLecture, setSubmittingLecture] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Comprehensive Form State matching ALL backend controller fields
  const [formData, setFormData] = useState({
    title: '',
    modality: 'online',
    category: 'general',
    level: 'A1 → B1',
    difficulty: 'Beginner Friendly',
    price: 0,
    currency: 'USD',
    instructor: 'Prof. Ahmed Nour',
    short_description: '',
    description: '',
    featured: false,
    status: 'published',
    outcomes: '',
    requirements: '',
    honors: '',
    location: '',
    schedule_days: '',
    schedule_time: '',
    start_date: '',
    end_date: '',
    capacity: 30,
    duration: '24 hours',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Fetch courses from GET /api/courses
  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses`);
      const data = await res.json();
      if (res.ok) {
        setCourses(data);
      }
    } catch (err) {
      console.error('Failed to fetch courses', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'فشل تحميل الدورات' : 'Failed to load courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingItem(course);
      setFormData({
        title: course.title || '',
        modality: course.modality || 'online',
        category: course.category || 'general',
        level: course.level || 'A1 → B1',
        difficulty: course.difficulty || 'Beginner Friendly',
        price: course.price !== undefined ? course.price : 0,
        currency: course.currency || 'USD',
        instructor: course.instructor || 'Prof. Ahmed Nour',
        short_description: course.short_description || '',
        description: course.description || '',
        featured: course.featured || false,
        status: course.status || 'published',
        outcomes: Array.isArray(course.outcomes) ? course.outcomes.join('\n') : course.outcomes || '',
        requirements: Array.isArray(course.requirements) ? course.requirements.join('\n') : course.requirements || '',
        includes: Array.isArray(course.includes) ? course.includes.join('\n') : course.includes || '',
        honors: Array.isArray(course.honors) ? course.honors.join('\n') : course.honors || '',
        location: course.location || '',
        schedule_days: course.schedule_days || '',
        schedule_time: course.schedule_time || '',
        start_date: course.start_date || '',
        end_date: course.end_date || '',
        capacity: course.capacity || 30,
      });
      setImagePreview(course.image || '');
      setImageFile(null);
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        modality: 'online',
        category: 'general',
        level: 'A1 → B1',
        difficulty: 'Beginner Friendly',
        price: 0,
        currency: 'USD',
        instructor: 'Prof. Ahmed Nour',
        short_description: '',
        description: '',
        featured: false,
        status: 'published',
        outcomes: '',
        requirements: '',
        includes: '',
        honors: '',
        location: '',
        schedule_days: '',
        schedule_time: '',
        start_date: '',
        end_date: '',
        capacity: 30,
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

  // POST /api/courses or PUT /api/courses/:id
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: isAr ? 'عنوان الدورة مطلوب' : 'Course title is required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const courseId = editingItem ? (editingItem.id || editingItem._id) : '';
      const endpoint = editingItem ? `${API_URL}/api/courses/${courseId}` : `${API_URL}/api/courses`;
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
      if (!res.ok) throw new Error(data.message || 'Failed to save course');

      toast({
        title: isAr ? 'تم بنجاح' : 'Success',
        description: isAr 
          ? (editingItem ? 'تم تحديث الدورة بنجاح' : 'تم إضافة الدورة بنجاح') 
          : (editingItem ? 'Course updated successfully' : 'Course created successfully'),
      });

      setModalOpen(false);
      fetchCourses();
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

  // GET /api/courses/:id for curriculum builder
  const handleOpenCurriculum = async (course) => {
    setActiveCourse(course);
    setCurriculumModalOpen(true);
    setSectionsLoading(true);
    try {
      const courseId = course.id || course._id;
      const res = await fetch(`${API_URL}/api/courses/${courseId}`);
      const data = await res.json();
      if (res.ok) {
        setActiveCourse(data);
      }
    } catch (err) {
      console.error('Failed to load course sections', err);
    } finally {
      setSectionsLoading(false);
    }
  };

  // POST /api/courses/:id/sections
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle || !activeCourse) return;

    try {
      const token = localStorage.getItem('token') || '';
      const courseId = activeCourse._id || activeCourse.id;
      const res = await fetch(`${API_URL}/api/courses/${courseId}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newSectionTitle,
          order: activeCourse.sections ? activeCourse.sections.length + 1 : 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add section');

      setActiveCourse({ ...activeCourse, sections: data });
      setNewSectionTitle('');
      setNewSectionTitleAr('');
      toast({
        title: isAr ? 'تم بنجاح' : 'Success',
        description: isAr ? 'تم إضافة القسم بنجاح' : 'Section added successfully',
      });
    } catch (err) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleOpenLectureModal = (sectionId) => {
    setSelectedSectionId(sectionId);
    setLectureData({
      title: '',
      title_ar: '',
      type: 'video',
      duration: '10:00',
      is_preview: false,
      content: '',
    });
    setLectureFile(null);
    setLectureModalOpen(true);
  };

  // POST /api/courses/:id/sections/:sectionId/lectures
  const handleSaveLecture = async (e) => {
    e.preventDefault();
    if (!lectureData.title || !selectedSectionId || !activeCourse) return;

    setSubmittingLecture(true);
    try {
      const token = localStorage.getItem('token') || '';
      const courseId = activeCourse._id || activeCourse.id;
      const dataPayload = new FormData();
      Object.keys(lectureData).forEach((key) => {
        dataPayload.append(key, lectureData[key]);
      });
      if (lectureFile) {
        dataPayload.append('file', lectureFile);
      }

      const res = await fetch(`${API_URL}/api/courses/${courseId}/sections/${selectedSectionId}/lectures`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: dataPayload,
      });

      const updatedSection = await res.json();
      if (!res.ok) throw new Error(updatedSection.message || 'Failed to add lecture');

      const updatedSections = activeCourse.sections.map((sec) => 
        sec._id === selectedSectionId ? updatedSection : sec
      );
      setActiveCourse({ ...activeCourse, sections: updatedSections });

      toast({
        title: isAr ? 'تم بنجاح' : 'Success',
        description: isAr ? 'تم إضافة الدرس بنجاح' : 'Lecture added successfully',
      });
      setLectureModalOpen(false);
    } catch (err) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSubmittingLecture(false);
    }
  };

  const promptDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  // DELETE /api/courses/:id
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const courseId = itemToDelete.id || itemToDelete._id;
      const res = await fetch(`${API_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete course');

      toast({
        title: isAr ? 'تم الحذف' : 'Deleted',
        description: isAr ? 'تم حذف الدورة بنجاح' : 'Course removed successfully',
      });

      setCourses(courses.filter((c) => (c.id || c._id) !== courseId));
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

  const filtered = courses.filter((course) =>
    !search ||
    course.title?.toLowerCase().includes(search.toLowerCase()) ||
    course.title_ar?.toLowerCase().includes(search.toLowerCase()) ||
    course.category?.toLowerCase().includes(search.toLowerCase()) ||
    course.instructor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#112d27]">
            {isAr ? 'إدارة الدورات' : 'Courses Management'}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
            {isAr ? 'إنشاء وتعديل الدورات التعليمية وإدارة الأقسام والدروس.' : 'Create, update, and organize platform learning courses & curriculum.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'ابحث باسم الدورة...' : 'Search courses...'}
              className="ps-9 h-10 text-xs sm:text-sm font-semibold border-gray-200 focus:border-[#009688] rounded-xl"
            />
          </div>

          <Button
            onClick={() => handleOpenModal()}
            className="bg-[#009688] hover:bg-[#00796b] text-white font-extrabold rounded-xl h-10 text-xs gap-1.5 shrink-0 shadow-md shadow-[#009688]/15"
          >
            <Plus className="w-4 h-4" />
            {isAr ? 'إضافة دورة' : 'Add Course'}
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs sm:text-sm">
            <thead className="bg-[#f8fcfb] text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-4 py-3.5 text-start">{isAr ? 'عنوان الدورة' : 'Course Title'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'النوع' : 'Modality'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'المستوى' : 'Level'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'السعر' : 'Price'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'المحتوى' : 'Curriculum'}</th>
                <th className="px-4 py-3.5 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3.5 text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium text-[#112d27]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#009688]" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 font-semibold text-xs">
                    {isAr ? 'لا توجد دورات مطابقة للبحث.' : 'No courses found matching search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((course) => {
                  const courseId = course.id || course._id;
                  const title = course.title;
                  const isPublished = course.status === 'published';
                  const isOffline = course.modality === 'offline';

                  return (
                    <tr key={courseId} className="hover:bg-[#f8fcfb]/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold">
                        <div className="flex items-center gap-3">
                          {course.image ? (
                            <img src={course.image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 border border-gray-100" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-[#009688]/10 text-[#009688] font-black text-xs flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <div className="truncate max-w-[200px] text-[#112d27]">{title}</div>
                            <div className="text-[10px] text-gray-400 font-medium truncate">{course.instructor || 'Prof. Ahmed Nour'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize',
                          isOffline ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
                        )}>
                          {isOffline ? <MapPin className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                          {course.modality || 'online'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-gray-600 font-medium">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-bold">
                          {course.level || 'A1 → B1'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-[#009688] font-extrabold">
                        ${course.price || 0}
                      </td>

                      <td className="px-4 py-3.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenCurriculum(course)}
                          className="h-7 px-2.5 text-[11px] font-bold rounded-lg border-emerald-200 text-[#009688] hover:bg-emerald-50 gap-1.5"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          {isAr ? 'إدارة الأقسام والدروس' : 'Curriculum'}
                        </Button>
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
                          {course.status || 'published'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenModal(course)}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-[#009688] hover:bg-[#009688]/10 rounded-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => promptDelete(course)}
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

      {/* Comprehensive Course Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-3xl w-full p-6 space-y-4 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-extrabold text-[#112d27] text-base">
                {editingItem ? (isAr ? 'تعديل بيانات الدورة' : 'Edit Course') : (isAr ? 'إضافة دورة جديدة' : 'Add New Course')}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Titles */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'عنوان الدورة (EN)' : 'Course Title (EN)'}</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-10 text-xs font-semibold rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Modality, Category, Level, Difficulty */}
              <div className="grid sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'نوع الدورة' : 'Modality'}</Label>
                  <select
                    value={formData.modality}
                    onChange={(e) => setFormData({ ...formData, modality: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#112d27]"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline / In-Person</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الفئة' : 'Category'}</Label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#112d27]"
                  >
                    <option value="general">General</option>
                    <option value="business">Business</option>
                    <option value="conversation">Conversation</option>
                    <option value="beginner">Beginner</option>
                    <option value="exam">Exam Prep</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'المستوى' : 'Level'}</Label>
                  <Input
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="h-10 text-xs font-semibold rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الصعوبة' : 'Difficulty'}</Label>
                  <Input
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="h-10 text-xs font-semibold rounded-xl"
                  />
                </div>
              </div>

              {/* Offline Logistics (Conditional) */}
              {formData.modality === 'offline' && (
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
                  <h4 className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    {isAr ? 'تفاصيل الحضور الميداني والجدول' : 'Offline Logistics & Schedule'}
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-gray-700">{isAr ? 'المكان / المركز' : 'Location'}</Label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Kigali Main Center"
                        className="h-9 text-xs font-semibold rounded-xl bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-gray-700">{isAr ? 'أيام الدورة' : 'Schedule Days'}</Label>
                      <Input
                        value={formData.schedule_days}
                        onChange={(e) => setFormData({ ...formData, schedule_days: e.target.value })}
                        placeholder="e.g. Mon, Wed, Fri"
                        className="h-9 text-xs font-semibold rounded-xl bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-gray-700">{isAr ? 'التوقيت' : 'Schedule Time'}</Label>
                      <Input
                        value={formData.schedule_time}
                        onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                        placeholder="e.g. 04:00 PM - 06:00 PM"
                        className="h-9 text-xs font-semibold rounded-xl bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-gray-700">{isAr ? 'تاريخ البدء' : 'Start Date'}</Label>
                      <Input
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        placeholder="e.g. Nov 1, 2026"
                        className="h-9 text-xs font-semibold rounded-xl bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-gray-700">{isAr ? 'تاريخ الانتهاء' : 'End Date'}</Label>
                      <Input
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        placeholder="e.g. Dec 30, 2026"
                        className="h-9 text-xs font-semibold rounded-xl bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-gray-700">{isAr ? 'السعة الاستيعابية' : 'Capacity'}</Label>
                      <Input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                        className="h-9 text-xs font-semibold rounded-xl bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Price, Currency, Instructor, Status */}
              <div className="grid sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'السعر ($)' : 'Price ($)'}</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="h-10 text-xs font-semibold rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'العملة' : 'Currency'}</Label>
                  <Input
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="h-10 text-xs font-semibold rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'اسم المحاضر' : 'Instructor'}</Label>
                  <Input
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="h-10 text-xs font-semibold rounded-xl"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="grid sm:grid-cols-2 gap-3 items-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'حالة النشر' : 'Status'}</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#112d27]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'صورة الغلاف' : 'Cover Image'}</Label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0" />
                  )}
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#009688] rounded-2xl p-4 cursor-pointer bg-gray-50/50 transition-all">
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-[11px] font-bold text-gray-600">{isAr ? 'اختر صورة الغلاف' : 'Upload image file'}</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'وصف مختصر' : 'Short Description'}</Label>
                  <textarea
                    rows={2}
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="w-full p-2.5 text-xs font-semibold rounded-xl border border-gray-200 focus:outline-none focus:border-[#009688]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'الوصف الكامل' : 'Full Description'}</Label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 text-xs font-semibold rounded-xl border border-gray-200 focus:outline-none focus:border-[#009688]"
                  />
                </div>
              </div>

              {/* Multi-line Arrays (Outcomes, Honors, Requirements) */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'مخرجات الدورة' : 'Course Outcomes'}</Label>
                  <textarea
                    rows={3}
                    value={formData.outcomes}
                    onChange={(e) => setFormData({ ...formData, outcomes: e.target.value })}
                    className="w-full p-2.5 text-xs font-semibold rounded-xl border border-gray-200 focus:outline-none focus:border-[#009688]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'مزايا وشهادات الشرف' : 'Course Honors'}</Label>
                  <textarea
                    rows={3}
                    value={formData.honors}
                    onChange={(e) => setFormData({ ...formData, honors: e.target.value })}
                    className="w-full p-2.5 text-xs font-semibold rounded-xl border border-gray-200 focus:outline-none focus:border-[#009688]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'المتطلبات' : 'Requirements'}</Label>
                  <textarea
                    rows={2}
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full p-2.5 text-xs font-semibold rounded-xl border border-gray-200 focus:outline-none focus:border-[#009688]"
                  />
                </div>
              </div>

              {/* Form Footer */}
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

      {/* Curriculum Builder Modal */}
      {curriculumModalOpen && activeCourse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-3xl w-full p-6 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-extrabold text-[#112d27] text-base">
                  {isAr ? 'إدارة المنهج والأقسام' : 'Curriculum Builder'}
                </h2>
                <p className="text-xs text-gray-500 font-medium truncate max-w-md">
                  {activeCourse.title}
                </p>
              </div>
              <button onClick={() => setCurriculumModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Section Form */}
            <form onSubmit={handleAddSection} className="p-4 rounded-2xl bg-[#f8fcfb] border border-gray-100 space-y-3">
              <h3 className="text-xs font-extrabold text-[#112d27]">
                {isAr ? '+ إضافة قسم جديد للدورة' : '+ Add New Section'}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder={isAr ? 'عنوان القسم (EN)' : 'Section Title (EN)'}
                  className="h-9 text-xs font-semibold rounded-xl bg-white"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-[#009688] hover:bg-[#00796b] text-white h-9 rounded-xl text-xs font-bold px-4 gap-1">
                  <PlusCircle className="w-3.5 h-3.5" />
                  {isAr ? 'إضافة القسم' : 'Add Section'}
                </Button>
              </div>
            </form>

            {/* Sections & Lectures List */}
            <div className="space-y-4">
              {sectionsLoading ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#009688]" />
                </div>
              ) : !activeCourse.sections || activeCourse.sections.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs font-semibold">
                  {isAr ? 'لا توجد أقسام مضافة بعد. أضف قسماً أعلاه.' : 'No sections added yet. Add a section above.'}
                </div>
              ) : (
                activeCourse.sections.map((section, idx) => (
                  <div key={section._id || idx} className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-white shadow-xs">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="font-extrabold text-xs text-[#112d27] flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#009688]/10 text-[#009688] flex items-center justify-center text-xs font-black">
                          {idx + 1}
                        </span>
                        <span>{isAr ? section.title_ar || section.title : section.title}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleOpenLectureModal(section._id)}
                        className="h-8 px-3 text-[11px] font-bold rounded-xl bg-[#009688]/10 text-[#009688] hover:bg-[#009688]/20 gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        {isAr ? 'إضافة درس / ملف' : 'Add Lecture / PDF'}
                      </Button>
                    </div>

                    {/* Lectures / Lessons in Section */}
                    <div className="space-y-2 ps-6">
                      {!section.lectures || section.lectures.length === 0 ? (
                        <p className="text-[11px] text-gray-400 italic">
                          {isAr ? 'لا توجد دروس في هذا القسم.' : 'No lectures in this section.'}
                        </p>
                      ) : (
                        section.lectures.map((lec, lIdx) => (
                          <div key={lec._id || lIdx} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                            <div className="flex items-center gap-2.5 font-semibold text-gray-700">
                              {lec.type === 'video' ? <Video className="w-3.5 h-3.5 text-[#009688]" /> : <FileText className="w-3.5 h-3.5 text-amber-500" />}
                              <span>{isAr ? lec.title_ar || lec.title : lec.title}</span>
                              {lec.is_preview && (
                                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded">
                                  {isAr ? 'معاينة مجانية' : 'Preview'}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold uppercase">
                              {lec.type} ({lec.duration || '0:00'})
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <Button
                onClick={() => setCurriculumModalOpen(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white h-10 rounded-xl text-xs font-bold px-6"
              >
                {isAr ? 'تم / إغلاق' : 'Done / Close'}
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Add Lecture / Lesson Modal */}
      {lectureModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-[#112d27] text-sm">
                {isAr ? 'إضافة درس أو ملف جديد' : 'Add Lecture / Resource'}
              </h3>
              <button onClick={() => setLectureModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLecture} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'عنوان الدرس (EN)' : 'Lecture Title (EN)'}</Label>
                <Input
                  value={lectureData.title}
                  onChange={(e) => setLectureData({ ...lectureData, title: e.target.value })}
                  className="h-9 text-xs font-semibold rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'نوع المحتوى' : 'Content Type'}</Label>
                  <select
                    value={lectureData.type}
                    onChange={(e) => setLectureData({ ...lectureData, type: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#112d27]"
                  >
                    <option value="video">Video</option>
                    <option value="pdf">PDF / Resource</option>
                    <option value="text">Text Article</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'المدة (مثال: 12:30)' : 'Duration (e.g. 12:30)'}</Label>
                  <Input
                    value={lectureData.duration}
                    onChange={(e) => setLectureData({ ...lectureData, duration: e.target.value })}
                    className="h-9 text-xs font-semibold rounded-xl"
                  />
                </div>
              </div>

              {lectureData.type !== 'text' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#112d27]">
                    {lectureData.type === 'video' ? (isAr ? 'ملف الفيديو' : 'Video File') : (isAr ? 'ملف PDF' : 'PDF Document')}
                  </Label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#009688] rounded-xl p-3 cursor-pointer bg-gray-50/50">
                    <Upload className="w-4 h-4 text-gray-400 mb-1" />
                    <span className="text-[11px] font-bold text-gray-600 truncate max-w-[260px]">
                      {lectureFile ? lectureFile.name : (isAr ? 'اختر ملف للإرسال' : 'Choose file to upload')}
                    </span>
                    <input 
                      type="file" 
                      accept={lectureData.type === 'video' ? 'video/*' : '.pdf,.doc,.docx'} 
                      onChange={(e) => setLectureFile(e.target.files[0])} 
                      className="hidden" 
                    />
                  </label>
                </div>
              )}

              {lectureData.type === 'text' && (
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#112d27]">{isAr ? 'محتوى النص' : 'Text Content'}</Label>
                  <textarea
                    rows={3}
                    value={lectureData.content}
                    onChange={(e) => setLectureData({ ...lectureData, content: e.target.value })}
                    className="w-full p-2.5 text-xs font-semibold rounded-xl border border-gray-200 focus:outline-none focus:border-[#009688]"
                  />
                </div>
              )}

              {/* Free Preview Toggle Checkbox */}
              <div className="flex items-center gap-2.5 py-1">
                <input
                  type="checkbox"
                  id="admin_lecture_is_preview"
                  checked={lectureData.is_preview}
                  onChange={(e) => setLectureData({ ...lectureData, is_preview: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#009688] focus:ring-[#009688] cursor-pointer"
                />
                <Label htmlFor="admin_lecture_is_preview" className="text-xs font-bold text-[#112d27] cursor-pointer">
                  {isAr ? 'جعل هذا الدرس معاينة مجانية (متاح للجميع)' : 'Set as Free Preview (Allow public viewing)'}
                </Label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLectureModalOpen(false)}
                  className="h-9 rounded-xl text-xs font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={submittingLecture}
                  className="bg-[#009688] hover:bg-[#00796b] text-white h-9 rounded-xl text-xs font-bold px-4 gap-2"
                >
                  {submittingLecture && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isAr ? 'حفظ الدرس' : 'Save Lecture'}
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
              {isAr ? 'حذف الدورة' : 'Delete Course'}
            </h3>
            <p className="text-xs text-gray-500">
              {isAr ? 'هل أنت متأكد من رغبتك في حذف هذه الدورة؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this course? This action cannot be undone.'}
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