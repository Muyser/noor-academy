import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Eye, Loader2, User, BookOpen } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { Button } from '@/components/ui/button';
// import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AdminEnrollments() {
  const { lang, isRTL } = useI18n();
  const isAr = lang === 'ar';

  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPendingEnrollments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/api/enrollments/admin/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch pending enrollments');
      const data = await res.json();
      setPendingEnrollments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching pending enrollments:', err);
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: err.message || (isAr ? 'تعذر جلب الطلبات المعلقة' : 'Failed to load pending requests'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEnrollments();
  }, []);

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/api/enrollments/admin/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to approve enrollment');

      toast({
        title: isAr ? 'تمت الموافقة بنجاح' : 'Approved Successfully',
        description: isAr ? 'تم تفعيل حساب الطالب وإتاحة الدورة له.' : 'Student enrollment activated successfully.',
      });

      setPendingEnrollments((prev) => prev.filter((e) => (e._id || e.id) !== id));
    } catch (err) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: err.message || (isAr ? 'فشل قبول الطلب' : 'Failed to approve request'),
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingId) return;

    try {
      setProcessingId(rejectingId);
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/api/enrollments/admin/${rejectingId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason || 'Receipt verification failed.' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reject enrollment');

      toast({
        title: isAr ? 'تم رفض الطلب' : 'Enrollment Rejected',
        description: isAr ? 'تم إخطار الطالب برفض الإيصال.' : 'Student request has been rejected.',
      });

      setPendingEnrollments((prev) => prev.filter((e) => (e._id || e.id) !== rejectingId));
      setRejectModalOpen(false);
      setRejectingId(null);
      setRejectReason('');
    } catch (err) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: err.message || (isAr ? 'فشل رفض الطلب' : 'Failed to reject request'),
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#009688]" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#112d27]">
            {isAr ? 'مراجعة إيصالات بنكك المعلقة' : 'Pending Bankak Receipts'}
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {isAr ? 'راجع إيصالات التحويل البنكي المرفوعة من الطلاب وقم بالتفعيل الفوري.' : 'Review student bank transfer payment proofs and activate course access.'}
          </p>
        </div>
        <Button
          onClick={fetchPendingEnrollments}
          variant="outline"
          className="text-xs font-bold rounded-xl border-gray-200 h-9"
        >
          {isAr ? 'تحديث القائمة' : 'Refresh List'}
        </Button>
      </div>

      {pendingEnrollments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-[#112d27] text-sm">
            {isAr ? 'لا توجد طلبات معلقة حالياً' : 'No Pending Requests'}
          </h3>
          <p className="text-xs text-gray-400 font-medium max-w-sm mx-auto">
            {isAr ? 'جميع إيصالات التحويل تم مراجعتها والرد عليها بنجاح.' : 'All student payment receipts have been reviewed and processed.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingEnrollments.map((enr) => {
            const enrId = enr._id || enr.id;
            const student = enr.student || {};
            const course = enr.course || {};
            const proof = enr.payment_proof || {};

            return (
              <div key={enrId} className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                {/* Student & Course Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                      {isAr ? 'قيد المراجعة' : 'Pending Review'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {proof.uploaded_at ? new Date(proof.uploaded_at).toLocaleString() : ''}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#009688]/10 text-[#009688] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-[#112d27]">{student.full_name || student.name || 'Student'}</div>
                        <div className="text-[11px] text-gray-400 font-medium">{student.email} {student.phone ? `• ${student.phone}` : ''}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-[#112d27]">{isAr ? course.title_ar || course.title : course.title}</div>
                        <div className="text-[11px] text-[#009688] font-bold">USD {course.price || 0}.00 (Bankak Transfer)</div>
                      </div>
                    </div>
                  </div>

                  {proof.transaction_id && (
                    <div className="text-xs text-gray-600 font-semibold pt-1">
                      <strong>{isAr ? 'رقم الحركة البنكية:' : 'Transaction ID:'}</strong> {proof.transaction_id}
                    </div>
                  )}
                </div>

                {/* Actions & Receipt Preview */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                  {proof.screenshot_url && (
                    <Button
                      onClick={() => setSelectedReceipt(proof.screenshot_url)}
                      variant="outline"
                      className="text-xs font-bold rounded-xl h-10 gap-1.5 border-gray-200 text-gray-700"
                    >
                      <Eye className="w-4 h-4 text-[#009688]" />
                      <span>{isAr ? 'عرض الإيصال' : 'View Receipt'}</span>
                    </Button>
                  )}

                  <Button
                    disabled={processingId === enrId}
                    onClick={() => handleApprove(enrId)}
                    className="bg-[#009688] hover:bg-[#00796b] text-white font-bold rounded-xl text-xs h-10 px-4 gap-1.5 shadow-sm"
                  >
                    {processingId === enrId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>{isAr ? 'قبول وتفعيل' : 'Approve'}</span>
                  </Button>

                  <Button
                    disabled={processingId === enrId}
                    onClick={() => {
                      setRejectingId(enrId);
                      setRejectModalOpen(true);
                    }}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl text-xs h-10 px-4 gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{isAr ? 'رفض' : 'Reject'}</span>
                  </Button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Receipt Image Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#112d27]">
                {isAr ? 'صورة إيصال التحويل البنكي' : 'Bank Transfer Receipt Proof'}
              </h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="max-h-[70vh] overflow-auto rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center p-2">
              <img src={selectedReceipt} alt="Bankak Receipt Proof" className="max-w-full h-auto rounded-xl object-contain" />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setSelectedReceipt(null)}
                className="bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs h-10 px-5"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-[#112d27]">
              {isAr ? 'سبب رفض الإيصال' : 'Reason for Rejection'}
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              {isAr ? 'يرجى كتابة سبب الرفض ليتم إرساله للطالب:' : 'Please provide a reason so the student knows why their receipt was rejected:'}
            </p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={isAr ? 'مثال: رقم العملية غير صحيح أو صورة الإيصال غير واضحة...' : 'e.g., Transaction ID incorrect or receipt screenshot is unclear...'}
              className="w-full h-28 p-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#009688]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectingId(null);
                  setRejectReason('');
                }}
                className="text-xs font-bold rounded-xl h-10 border-gray-200"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                onClick={handleRejectSubmit}
                className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs h-10 px-5"
              >
                {isAr ? 'تأكيد الرفض' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}