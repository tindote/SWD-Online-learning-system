export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  status: 'active' | 'completed' | 'cancelled' | string;
  enrolled_at: string;
  created_at?: string;
  updated_at?: string;
  user_name?: string;
  user_email?: string;
  course_title?: string;
  course_instructor?: string;
  instructor_id?: number;
}

export interface MyEnrollmentCourse {
  enrollment_id: number;
  enrollment_status: 'active' | 'completed' | 'cancelled' | string;
  enrolled_at: string;
  course_id: number;
  title: string;
  description: string;
  instructor: string;
  price: number;
  category: string;
  thumbnail?: string | null;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
}

export interface EnrollmentFormData {
  user_id: number | string;
  course_id: number | string;
  status: string;
}
