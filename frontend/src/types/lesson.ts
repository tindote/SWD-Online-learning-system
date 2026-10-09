export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  content: string;
  video_url?: string | null;
  resource_url?: string | null;
  lesson_order: number;
  course_title?: string;
  instructor_id?: number | null;
  isCompleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LessonFormData {
  course_id: number | string;
  title: string;
  content: string;
  video_url?: string;
  resource_url?: string;
  lesson_order: number | string;
}
