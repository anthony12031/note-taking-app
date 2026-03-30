export interface User {
  id: number;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  bg_color: string;
  note_count: number;
}

export interface Note {
  id: number;
  title: string;
  body: string;
  category: Category | null;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
