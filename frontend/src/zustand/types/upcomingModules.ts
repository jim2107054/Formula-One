export interface UpcomingModule {
  language: string;
  standardPrice: number;
  discountedPrice: number;
  isPublished: boolean;
  _id: string;
  courseNong: string;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  courseTitleUrl: string;
  bookingUrl: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  creationDate: string;
}

export interface UpcomingModuleStore {
  upcomingModules: UpcomingModule[] | null;
  loading: boolean;
  error: string | null;
  getAllUpcomingModules: () => Promise<void>;
}
