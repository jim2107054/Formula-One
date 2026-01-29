import api from "@/util/api";

export const breadcrumbService = {
  getBreadcrumb: async (
    courseId: string,
    sectionId: string,
    lessonId: string,
    itemId: string
  ) => {
    const queryString =
      courseId && sectionId && lessonId && itemId
        ? `courseId=${courseId}&sectionId=${sectionId}&lessonId=${lessonId}&itemId=${itemId}`
        : courseId && sectionId && lessonId
        ? `courseId=${courseId}&sectionId=${sectionId}&lessonId=${lessonId}`
        : courseId && sectionId
        ? `courseId=${courseId}&sectionId=${sectionId}`
        : courseId
        ? `courseId=${courseId}`
        : "";

    const response = await api.get(`/breadcrumb?${queryString}`);

    return response.data.data;
  },
};
