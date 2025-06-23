// src/api/instructors.ts

import axiosInstance from '@axios';

import {
  Instructor,
  InstructorDetail,
  GetInstructorsResponse,
  BasicMessageResponse,
} from '../types/api';

/**
 * Mengambil daftar instruktur untuk peserta.
 */
export const getParticipantInstructors = async (): Promise<Instructor[]> => {
  try {
    const response = await axiosInstance.get<GetInstructorsResponse>('/peserta/daftar-instruktur');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mengambil daftar instruktur untuk admin.
 */
export const getAdminInstructors = async (): Promise<Instructor[]> => {
  try {
    const response = await axiosInstance.get<GetInstructorsResponse>('/admin/instruktur');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mengambil detail instruktur berdasarkan ID (Admin).
 * @param id ID instruktur
 */
export const getInstructorDetail = async (id: number): Promise<InstructorDetail> => {
  try {
    const response = await axiosInstance.get<InstructorDetail>(`/admin/instruktur/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Menambah instruktur baru (Admin).
 * @param data Data instruktur (form-data)
 */
export const addInstructor = async (data: FormData): Promise<BasicMessageResponse> => {
  try {
    const response = await axiosInstance.post<BasicMessageResponse>('/admin/instruktur', data, {
      headers: {
        'Content-Type': 'multipart/form-data', // Penting untuk FormData
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mengubah ketersediaan instruktur (Admin).
 * @param id ID instruktur
 * @param data Data ketersediaan (keahlian, waktuMulai, waktuBerakhir, tglKetersediaan)
 */
export const updateInstructorAvailability = async (
  id: number,
  data: {
    keahlian: string;
    waktuMulai: string;
    waktuBerakhir: string;
    tglKetersediaan: string;
  }
): Promise<BasicMessageResponse> => {
  try {
    const response = await axiosInstance.patch<BasicMessageResponse>(
      `/admin/instruktur/${id}/ketersediaan`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Menonaktifkan instruktur (Admin).
 * @param id ID instruktur
 */
export const deactivateInstructor = async (id: number): Promise<BasicMessageResponse> => {
  try {
    const response = await axiosInstance.patch<BasicMessageResponse>(`/admin/instruktur/${id}/nonaktif`);
    return response.data;
  } catch (error) {
    throw error;
  }
};