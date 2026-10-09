export interface Submission {
  id: number;
  assignment_id: number;
  user_id: number;
  content: string;
  grade: number | null;
  feedback?: string | null;
  submitted_at: string;
  created_at?: string;
  updated_at?: string;
  assignment_title?: string;
  due_date?: string | null;
  course_id?: number;
  course_title?: string;
  instructor_id?: number;
  user_name?: string;
  user_email?: string;
}

export interface SubmissionFormData {
  assignment_id: number | string;
  user_id?: number | string;
  content: string;
  grade?: number | string | null;
  feedback?: string;
}

export interface GradingFormData {
  grade: number | string;
  feedback?: string;
}
