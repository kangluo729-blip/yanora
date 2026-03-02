import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

class ApiClient {
  setToken(token: string | null) {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async callEdgeFunction(path: string, data: any) {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-handler/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async register(email: string, password: string) {
    const result = await this.callEdgeFunction('register', { email, password });
    this.setToken(result.token);
    return result;
  }

  async login(email: string, password: string) {
    const result = await this.callEdgeFunction('login', { email, password });
    this.setToken(result.token);
    return result;
  }

  async logout() {
    this.setToken(null);
  }

  async getCurrentUser() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    return { user: null };
  }

  async adminLogin(email: string, password: string) {
    const result = await this.callEdgeFunction('admin-login', { email, password });
    this.setToken(result.token);
    return result;
  }

  async getAdmins() {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async createAdmin(adminData: { email: string; password: string; role?: string }) {
    return this.callEdgeFunction('create-admin', adminData);
  }

  async updateAdmin(userId: string, data: { role?: string; is_active?: boolean }) {
    const { data: updated, error } = await supabase
      .from('admins')
      .update(data)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  }

  async deleteAdmin(userId: string) {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return { message: 'Admin deleted successfully' };
  }

  async createBooking(bookingData: any) {
    const { services, consultation_fee, ...bookingInfo } = bookingData;

    const total_amount = services.reduce((sum: number, s: any) => sum + parseFloat(s.price), 0) + parseFloat(consultation_fee || 100);

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        ...bookingInfo,
        total_amount,
        consultation_fee: consultation_fee || 100,
      }])
      .select()
      .single();

    if (bookingError) throw new Error(bookingError.message);

    if (services && services.length > 0) {
      const bookingServices = services.map((service: any) => ({
        booking_id: booking.id,
        service_name: service.name,
        service_price: service.price,
      }));

      const { error: servicesError } = await supabase
        .from('booking_services')
        .insert(bookingServices);

      if (servicesError) throw new Error(servicesError.message);
    }

    return booking;
  }

  async getBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services:booking_services(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getAllBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services:booking_services(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async updateBooking(id: string, data: any) {
    const { data: updated, error } = await supabase
      .from('bookings')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  }

  async deleteBooking(id: string) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Booking deleted successfully' };
  }

  async getSimpleCases() {
    const { data, error } = await supabase
      .from('simple_cases')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getAllSimpleCases() {
    const { data, error } = await supabase
      .from('simple_cases')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async createSimpleCase(caseData: any) {
    const { data, error } = await supabase
      .from('simple_cases')
      .insert([caseData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateSimpleCase(id: string, caseData: any) {
    const { data, error } = await supabase
      .from('simple_cases')
      .update(caseData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteSimpleCase(id: string) {
    const { error } = await supabase
      .from('simple_cases')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Simple case deleted successfully' };
  }

  async getDetailedCases(category?: string) {
    let query = supabase
      .from('detailed_cases')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getAllDetailedCases() {
    const { data, error } = await supabase
      .from('detailed_cases')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async createDetailedCase(caseData: any) {
    const { data, error } = await supabase
      .from('detailed_cases')
      .insert([caseData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateDetailedCase(id: string, caseData: any) {
    const { data, error } = await supabase
      .from('detailed_cases')
      .update(caseData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteDetailedCase(id: string) {
    const { error } = await supabase
      .from('detailed_cases')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Detailed case deleted successfully' };
  }

  async getFaqCategories() {
    const { data, error } = await supabase
      .from('faq_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  async getFaqs(categoryId?: string) {
    let query = supabase
      .from('faqs')
      .select(`
        *,
        category:faq_categories(*)
      `)
      .eq('is_active', true);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  async createFaqCategory(categoryData: any) {
    const { data, error } = await supabase
      .from('faq_categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateFaqCategory(id: string, categoryData: any) {
    const { data, error } = await supabase
      .from('faq_categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteFaqCategory(id: string) {
    const { error } = await supabase
      .from('faq_categories')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'FAQ category deleted successfully' };
  }

  async createFaq(faqData: any) {
    const { data, error } = await supabase
      .from('faqs')
      .insert([faqData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateFaq(id: string, faqData: any) {
    const { data, error } = await supabase
      .from('faqs')
      .update(faqData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteFaq(id: string) {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'FAQ deleted successfully' };
  }

  async uploadImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw new Error(uploadError.message);

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return { url: publicUrl };
  }

  async uploadImages(files: File[]) {
    const uploadPromises = files.map((file) => this.uploadImage(file));
    const results = await Promise.all(uploadPromises);
    return { urls: results.map((r) => r.url) };
  }
}

export const api = new ApiClient();
