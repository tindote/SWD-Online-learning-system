export interface Review {
  id: number;
  user_id: number;
  course_id: number;
  rating: number;
  review?: string | null;
  user_name?: string;
  user_avatar?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CourseReviewsData {
  reviews: Review[];
  averageRating: number;
  count: number;
}

export interface CreateReviewData {
  course_id: number;
  rating: number;
  review?: string;
}
