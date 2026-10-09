export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin' | string;
  avatar?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  role: string;
  password?: string;
  bio?: string;
  avatar?: string;
}
