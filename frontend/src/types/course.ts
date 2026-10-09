import type { Lesson } from './lesson';

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

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  instructor_id?: number | null;
  instructor_name?: string | null;
  instructor_avatar?: string | null;
  instructor_bio?: string | null;
  price: number | string;
  category: string;
  category_id?: number | null;
  thumbnail?: string | null;
  status?: 'draft' | 'published' | 'archived' | string;
  lessons_count?: number | string;
  enrollments_count?: number | string;
  average_rating?: number | string;
  reviews_count?: number | string;
  created_at?: string;
  updated_at?: string;

  // Detail view attributes
  lessons?: Lesson[];
  reviews?: Review[];
  isEnrolled?: boolean;
  enrollmentStatus?: 'active' | 'completed' | 'cancelled' | string | null;
  progressPercentage?: number;
  isInstructorOwner?: boolean;
}

export interface CourseFormData {
  title: string;
  description: string;
  instructor: string;
  instructor_id?: number | null;
  price: number | string;
  category: string;
  category_id?: number | null;
  thumbnail?: string;
  status?: string;
}

export interface CourseFilterParams {
  search?: string;
  category?: string;
  isFree?: boolean | string;
  status?: string;
  allStatus?: boolean | string;
  instructor_id?: number | string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'title';
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  errors?: string[];
}
