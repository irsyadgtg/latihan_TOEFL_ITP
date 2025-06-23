// src/api/auth.ts

// src/api/auth.ts
import axiosInstance from '@axios'; // Lebih rapi
import { SomeResponseType } from '@types/api'; // Ganti SomeResponseType dengan tipe yang benar-benar Anda butuhkan
import { AuthResponse } from '@types/api'; // Contoh, ganti InstructorResponse dengan tipe yang Anda butuhkan

/**
 * Fungsi untuk melakukan registrasi peserta.
 * @param data Data registrasi (namaLengkap, username, nik, email, password, password_confirmation)
 */
export const registerUser = async (data: {
  namaLengkap: string;
  username: string;
  nik: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<BasicMessageResponse> => {
  try {
    const response = await axiosInstance.post<BasicMessageResponse>('/register', data);
    return response.data;
  } catch (error) {
    // Error handling sudah di interceptor, ini untuk melempar error agar ditangkap di UI
    throw error;
  }
};

/**
 * Fungsi untuk melakukan login pengguna.
 * @param loginIdentifier Username atau email pengguna
 * @param password Password pengguna
 */
export const login = async (loginIdentifier: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post<LoginResponse>('/login', {
      login: loginIdentifier,
      password: password,
    });
    // Simpan token dan data user di localStorage
    localStorage.setItem('userToken', response.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fungsi untuk melakukan logout pengguna.
 */
export const logout = async (): Promise<BasicMessageResponse> => {
  try {
    const response = await axiosInstance.post<BasicMessageResponse>('/logout');
    localStorage.removeItem('userToken'); // Hapus token dari localStorage saat logout
    localStorage.removeItem('userData');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fungsi untuk request lupa password.
 * @param email Email pengguna
 */
export const forgotPassword = async (email: string): Promise<BasicMessageResponse> => {
  try {
    const response = await axiosInstance.post<BasicMessageResponse>('/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fungsi untuk mereset password.
 * @param data Data reset password (email, token, new password, password confirmation)
 */
export const resetPassword = async (data: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}): Promise<BasicMessageResponse> => {
  try {
    const response = await axiosInstance.post<BasicMessageResponse>('/reset-password', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fungsi untuk mendapatkan data user yang sedang login (untuk debugging/verifikasi token).
 */
export const getCurrentUser = async (): Promise<{ user: UserData }> => {
  try {
    const response = await axiosInstance.get<{ user: UserData }>('/user');
    return response.data;
  } catch (error) {
    throw error;
  }
};