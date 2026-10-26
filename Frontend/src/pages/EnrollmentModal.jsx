import { useState } from 'react';
import { X, CreditCard, Receipt, Loader2, Upload, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function EnrollmentModal({ course, isOpen, onClose }) {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [paymentMethod, setPaymentMethod] = useState('bankak'); // 'bankak' or 'card'
  const [loading, setLoading] = useState(false);
  
  // Bankak transfer form states
  const [transactionId, setTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  if (!isOpen || !course) return null;

  // Handle file selection and preview for Bankak receipt
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      toast({
        title: isAr ? 'تسجيل الدخول مطلوب' : 'Authentication Required',
        description: isAr ? 'يرجى تسجيل الدخول لمتابعة عملية التسجيل.' : 'Please log in to enroll in this course.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'card') {
        // --- STRIPE CHECKOUT ---
        const res = await fetch(`${API_URL}/api/payments/initialize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId: course._id || course.id }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to initialize payment.');

        if (data.session_url) {
          window.location.href = data.session_url;
        }
      } else {
        // --- BANKAK MANUAL TRANSFER ---
        if (!receiptFile) {
          throw new Error(isAr ? 'يرجى إرفاق صورة إشعار الدفع' : 'Please upload the receipt screenshot.');
        }

        const formData = new FormData();
        formData.append('courseId', course._id || course.id);
        formData.append('transactionId', transactionId || `BANKAK-${Date.now()}`);
        formData.append('paymentMethod', 'bankak');
        formData.append('receipt', receiptFile);

        const res = await fetch(`${API_URL}/api/enrollments/manual`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to submit enrollment.');

        toast({
          title: isAr ? 'تم إرسال الطلب بنجاح' : 'Enrollment Submitted!',
          description: isAr ? 'تم إرسال إشعار الدفع بنجاح. سيتم مراجعته وتفعيل الدورة لك قريباً.' : 'Your receipt has been submitted for admin verification.',
        });

        onClose();
      }
    } catch (err) {
      toast({
        title: isAr ? 'خطأ' : 'Error',
        description: err.message || (isAr ? 'حدث خطأ أثناء المعالجة' : 'Something went wrong.'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 overflow-y-auto ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      <div className="bg-[#1e293b] w-full max-w-md rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-sm font-extrabold text-white">
            {isAr ? 'السداد عن طريق Bankak' : 'Payment Method'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => setPaymentMethod('bankak')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                paymentMethod === 'bankak'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>{isAr ? 'بنكك Bankak' : 'Bankak'}</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                paymentMethod === 'card'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{isAr ? 'بطاقة ائتمان' : 'Stripe Card'}</span>
            </button>
          </div>

          {/* BANKAK PAYMENT CARD VIEW (Styled matching image) */}
          {paymentMethod === 'bankak' && (
            <div className="bg-white rounded-3xl p-6 shadow-xl text-slate-800 space-y-5 animate-in fade-in duration-200">
              
              {/* Bankak Logo Header */}
              <div className="flex flex-col items-center justify-center text-center space-y-1">
                <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg font-black text-xs tracking-wider mb-1">
                  بنكك
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {isAr ? 'تحويل مبلغ' : 'Transfer Amount'}
                </span>
                <div className="text-2xl font-black text-red-600">
                  {course.price || 0} <span className="text-sm font-extrabold text-slate-600">USD</span>
                </div>
              </div>

              {/* Bank Account Details Box */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">
                  {isAr ? 'إلى رقم الحساب' : 'To Account Number'}
                </span>
                <div className="text-2xl font-black tracking-wider text-slate-900 font-mono">
                  2094574
                </div>
                <div className="text-xs font-bold text-slate-500 pt-1">
                  محمد المجتبى الزبير
                </div>
              </div>

              {/* Upload Screenshot Area */}
              <div>
                <label className="flex flex-col items-center justify-center w-full min-h-[120px] border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-slate-100 transition-colors p-3 text-center">
                  {previewUrl ? (
                    <div className="relative w-full flex flex-col items-center justify-center">
                      <img src={previewUrl} alt="Receipt preview" className="max-h-32 rounded-xl object-contain shadow-sm" />
                      <span className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {isAr ? 'تم إرفاق الإشعار' : 'Receipt attached'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <div className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-500">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-600">
                        {isAr ? 'إرفاق إشعار الدفع هنا' : 'Attach payment receipt here'}
                      </p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

            </div>
          )}

          {/* CARD PAYMENT DETAILS */}
          {paymentMethod === 'card' && (
            <div className="bg-slate-800 border border-slate-700/80 rounded-3xl p-5 text-white space-y-3">
              <div className="text-xs font-bold text-slate-400">{isAr ? 'المبلغ الإجمالي' : 'Total Price'}</div>
              <div className="text-2xl font-black text-indigo-400">${course.price || 0} USD</div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {isAr 
                  ? 'سيتم تحويلك بشكل آمن إلى بوابة Stripe لإكمال عملية الدفع بالبطاقة.' 
                  : 'You will be securely redirected to Stripe to complete your purchase.'}
              </p>
            </div>
          )}

          {/* Bottom Confirmation Action Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-2xl text-white font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${
              paymentMethod === 'bankak'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{isAr ? 'تأكيد الدفع' : 'Confirm Payment'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}