import { api } from "../api/client";

interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export const sendContactMessage = async (
  payload: ContactMessagePayload,
): Promise<ApiResponse> => {
  try {
    const result = await api.post<ApiResponse>("/contact", payload);
    console.log("Contact Message Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in sending Contact Message: ", error);
    throw error;
  }
};
