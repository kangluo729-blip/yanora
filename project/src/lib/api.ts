const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  async register(email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  async adminLogin(email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async getAdmins() {
    return this.request<any[]>('/admin/admins');
  }

  async createAdmin(data: { email: string; password: string; role?: string }) {
    return this.request('/admin/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdmin(userId: string, data: { role?: string; is_active?: boolean }) {
    return this.request(`/admin/admins/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAdmin(userId: string) {
    return this.request(`/admin/admins/${userId}`, {
      method: 'DELETE',
    });
  }

  async createBooking(data: any) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookings() {
    return this.request<any[]>('/bookings');
  }

  async getAllBookings() {
    return this.request<any[]>('/bookings/all');
  }

  async updateBooking(id: string, data: any) {
    return this.request(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBooking(id: string) {
    return this.request(`/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  async getSimpleCases() {
    return this.request<any[]>('/cases/simple');
  }

  async getAllSimpleCases() {
    return this.request<any[]>('/cases/simple/all');
  }

  async createSimpleCase(data: any) {
    return this.request('/cases/simple', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSimpleCase(id: string, data: any) {
    return this.request(`/cases/simple/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSimpleCase(id: string) {
    return this.request(`/cases/simple/${id}`, {
      method: 'DELETE',
    });
  }

  async getDetailedCases(category?: string) {
    const query = category ? `?category=${category}` : '';
    return this.request<any[]>(`/cases/detailed${query}`);
  }

  async getAllDetailedCases() {
    return this.request<any[]>('/cases/detailed/all');
  }

  async createDetailedCase(data: any) {
    return this.request('/cases/detailed', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDetailedCase(id: string, data: any) {
    return this.request(`/cases/detailed/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDetailedCase(id: string) {
    return this.request(`/cases/detailed/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  async uploadImages(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await fetch(`${API_URL}/upload/images`, {
      method: 'POST',
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }
}

export const api = new ApiClient();
