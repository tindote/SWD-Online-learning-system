export interface Assignment {
  id: number;
  course_id: number;
  title: string;
  description: string;
  due_date: string | null;
  course_title?: string;
  course_instructor?: string;
  instructor_id?: number;
  submissions_count?: number;
  submission_id?: number | null;
  grade?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface AssignmentFormData {
  course_id: number | string;
  title: string;
  description: string;
  due_date: string;
}
