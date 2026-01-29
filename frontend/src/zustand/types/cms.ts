export interface FaqItem {
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
}

export interface UsefulLinkItem {
  title: string;
  bookingUrl: string;
  isPublished: boolean;
}

export interface UpcomingModuleItem {
  courseNong: string;
  title: string;
  language: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location: string;
  standardPrice: number;
  discountedPrice: number;
  courseTitleUrl: string;
  bookingUrl: string;
  isPublished: boolean;
}

export interface Cms {
  _id: string;
  key: string;
  is_public: boolean;
  data:
    | FaqItem[]
    | UsefulLinkItem[]
    | UpcomingModuleItem[]
    | Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCmsRequest {
  key: string;
  is_public: boolean;
  data:
    | FaqItem[]
    | UsefulLinkItem[]
    | UpcomingModuleItem[]
    | Record<string, unknown>;
}

export interface UpdateCmsRequest {
  key?: string;
  is_public?: boolean;
  data?:
    | FaqItem[]
    | UsefulLinkItem[]
    | UpcomingModuleItem[]
    | Record<string, unknown>;
}
