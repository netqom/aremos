/**
 * Typdefinitionen für API-Antworten
 * 
 * Diese Datei enthält TypeScript-Interfaces für alle API-Antworten,
 * um Typsicherheit in der gesamten Anwendung zu gewährleisten.
 */

// Allgemeine Antworttypen
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth-Typen
export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  createdAt: string;
  isAdmin?: boolean;
}

// Notification-Typen
export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  expiresAt: string;
  createdAt: string;
}

// Classroom-Typen
export interface Classroom {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  creatorId: number;
  lessons?: Lesson[];
  members?: ClassroomMember[];
  resources?: Resource[];
}

export interface ClassroomMember {
  id: number;
  name: string;
  role?: string;
  joinedAt?: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  resources: string[];
}

export interface Resource {
  id: number;
  title: string;
  type: string;
  url?: string;
  deckId?: number;
}

// Deck-Typen
export interface Deck {
  id: number;
  name: string;
  aliasName?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  creatorId: number;
  isOwn: boolean;
  isAssigned: boolean;
  classroom?: string;
  cards?: Card[];
  version?: number;
}

export interface Card {
  id: number;
  deckId: number;
  front: string;
  back: string;
  position: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeckDue {
  deckId: number;
  dueDate: string;
}

// Practice-Typen
export interface PracticeSession {
  id: string;
  deckId: number;
  cards: PracticeCard[];
  startedAt: string;
  currentRound: number;
  completed: boolean;
}

export interface PracticeCard {
  id: number;
  front: string;
  back: string;
  correctCount: number;
  position: number;
  imageUrl?: string;
}

export interface PracticeAnswer {
  correct: boolean;
  completed: boolean;
  cards: PracticeCard[];
  currentRound: number;
}

// Insights-Typen
export interface InsightData {
  deckId: number;
  deckName: string;
  lastVisitDate?: string;
  lastDuration?: number; // in Millisekunden
  sessions?: SessionInsight[];
  rounds?: number[];
  cards?: number[];
  interactions?: CardInteraction[];
}

export interface SessionInsight {
  id: string;
  startedAt: string;
  duration: number; // in Millisekunden
  totalCards: number;
  correctAnswers: number;
  rounds: number;
}

export interface CardInteraction {
  round: number;
  cardId: number;
  isCorrect: boolean;
  timeSpent?: number; // in Millisekunden
}

// Spaced Repetition Typen
export interface SpacedRepetitionData {
  deckId: number;
  dates: string[]; // ISO-Datumsstrings
}

// Upload-Typen
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// Health-Check Typ
export interface HealthStatus {
  status: "ok" | "error";
  version: string;
  uptime: number;
  timestamp: string;
}
