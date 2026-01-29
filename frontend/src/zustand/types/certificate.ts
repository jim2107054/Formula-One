export interface Certificate {
  enrollment_id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  course: {
    _id: string;
    title: string;
    id: string;
  };
  certification_url: string;
  download_link: string;
}
