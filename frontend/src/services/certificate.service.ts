import api from "@/util/api";
import type { Certificate } from "@/zustand/types/certificate";

export const certificateService = {
  /**
   * Get certificate by enrollment ID
   */
  async getByEnrollmentId(enrollmentId: string): Promise<Certificate> {
    const response = await api.get(
      `enroll/${enrollmentId}/certificate/download`
    );
    return response.data.data;
  },

  async verifyCertificate(certificateId: string) {
    const response = await api.get(
      `/enroll/verify-certificate/${certificateId}`
    );
    return response;
  },
};
