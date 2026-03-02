import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import BookingDesktop from './booking/BookingDesktop';
import BookingMobile from './booking/BookingMobile';

export interface BookingFormData {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  preferred_date: string;
  service_type: string;
  message: string;
}

export type BookingStep = 'form' | 'payment' | 'success';

function BookingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<BookingStep>('form');
  const [bookingId, setBookingId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferred_date: '',
    service_type: '面部轮廓',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fullName = formData.firstName && formData.lastName
        ? `${formData.lastName}${formData.firstName}`
        : formData.name;

      const bookingData = {
        name: fullName,
        email: formData.email,
        phone: formData.phone,
        preferred_date: formData.preferred_date || null,
        preferred_time: null,
        service_type: formData.service_type,
        message: formData.message,
        status: 'pending',
        payment_status: 'pending',
        consultation_fee: 500
      };

      const data = await api.createBooking(bookingData);

      if (data && data.id) {
        setBookingId(data.id);
        setStep('payment');
      } else {
        throw new Error('预订创建成功，但无法获取预订ID');
      }
    } catch (err: any) {
      setError(err.message || '提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (method: string) => {
    setLoading(true);
    setError('');

    try {
      await api.updateBooking(bookingId, { payment_status: 'paid' });
      setStep('success');
    } catch (err: any) {
      setError(err.message || '支付失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const commonProps = {
    step,
    formData,
    loading,
    error,
    handleSubmit,
    handleChange,
    handlePayment,
    navigate
  };

  return (
    <>
      <div className="hidden md:block">
        <BookingDesktop {...commonProps} />
      </div>
      <div className="md:hidden">
        <BookingMobile {...commonProps} />
      </div>
    </>
  );
}

export default BookingPage;
