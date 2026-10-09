export interface DashboardStats {
  totalCourses: number;
  totalUsers: number;
  totalStudents?: number;
  totalInstructors?: number;
  totalCategories: number;
  totalLessons: number;
  totalEnrollments: number;
  totalAssignments: number;
  totalSubmissions: number;
  totalReviews?: number;
  recentEnrollments?: Array<{
    id: number;
    status: string;
    enrolled_at: string;
    user_name: string;
    user_email: string;
    course_title: string;
  }>;
  recentSubmissions?: Array<{
    id: number;
    grade: number | null;
    submitted_at: string;
    user_name: string;
    assignment_title: string;
    course_title: string;
  }>;
}

export interface InstructorDashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalAssignments: number;
  totalSubmissions: number;
  pendingGradingCount: number;
  averageRating: number;
  pendingSubmissions: Array<{
    id: number;
    submitted_at: string;
    content: string;
    user_name: string;
    assignment_title: string;
    course_title: string;
  }>;
}

export interface StudentDashboardStats {
  enrolledCount: number;
  completedCoursesCount: number;
  activeCoursesCount: number;
  averageGrade: number;
  totalSubmitted: number;
  completedLessonsCount: number;
  upcomingAssignments: Array<{
    id: number;
    title: string;
    due_date: string | null;
    course_title: string;
    grade?: number | null;
    submission_id?: number | null;
  }>;
}
