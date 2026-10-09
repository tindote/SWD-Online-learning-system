import type { Course } from './course';
import type { Lesson } from './lesson';

export interface LessonWithProgress extends Lesson {
  isCompleted: boolean;
}

export interface CourseLearningData {
  course: Course;
  lessons: LessonWithProgress[];
  completedLessonIds: number[];
  totalLessons: number;
  completedCount: number;
  progressPercentage: number;
  enrollmentStatus: string;
}

export interface ToggleProgressResponse {
  success: boolean;
  message: string;
  data: {
    lessonId: number;
    isCompleted: boolean;
    progressPercentage: number;
    completedCount: number;
    totalLessons: number;
  };
}
