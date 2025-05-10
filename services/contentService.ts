import axios from 'axios';
import Constants from 'expo-constants';
import authService from './authService';

// Get the API URL from environment variables
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

// Types
export interface Exam {
  id: number;
  name: string;
  description: string;
  countryCode?: string;
}

export interface Subject {
  id: number;
  examId: number;
  name: string;
  description: string;
}

export interface Question {
  id: number;
  subjectId: number;
  year: number;
  questionText: string;
  options: QuestionOption[];
  correctOptionKey: string;
  explanationText: string;
  difficultyLevel: string;
  language: string;
}

export interface QuestionOption {
  key: string;
  text: string;
}

export interface Note {
  id: number;
  subjectId: number;
  title: string;
  content: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizSession {
  id: number;
  userId: number;
  subjectId: number;
  subject: Subject;
  startTime: string;
  endTime: string;
  score: number;
  totalQuestions: number;
}

export interface QuizStartRequest {
  subjectId: number;
  numberOfQuestions?: number;
}

export interface QuizStartResponse {
  sessionId: number;
  questions: Question[];
}

export interface QuizAnswer {
  questionId: number;
  userAnswerKey: string;
}

export interface QuizGradeRequest {
  sessionId: number;
  answers: QuizAnswer[];
}

export interface QuizGradeResponse {
  sessionId: number;
  score: number;
  totalQuestions: number;
  results: QuizQuestionResult[];
}

export interface QuizQuestionResult {
  questionId: number;
  question: Question;
  userAnswerKey: string;
  isCorrect: boolean;
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(async (config) => {
  const token = await authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Content service
const contentService = {
  // Get all exams
  getExams: async (): Promise<Exam[]> => {
    try {
      const response = await api.get('/exams');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch exams');
      }
      throw new Error('Network error while fetching exams');
    }
  },

  // Get subjects for an exam
  getSubjectsByExam: async (examId: number): Promise<Subject[]> => {
    try {
      const response = await api.get(`/exams/${examId}/subjects`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch subjects');
      }
      throw new Error('Network error while fetching subjects');
    }
  },

  // Get questions for a subject
  getQuestionsBySubject: async (subjectId: number): Promise<Question[]> => {
    try {
      const response = await api.get(`/subjects/${subjectId}/questions`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch questions');
      }
      throw new Error('Network error while fetching questions');
    }
  },

  // Get a specific question
  getQuestion: async (questionId: number): Promise<Question> => {
    try {
      const response = await api.get(`/questions/${questionId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch question');
      }
      throw new Error('Network error while fetching question');
    }
  },

  // Get notes for a subject
  getNotesBySubject: async (subjectId: number): Promise<Note[]> => {
    try {
      const response = await api.get(`/notes/subject/${subjectId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch notes');
      }
      throw new Error('Network error while fetching notes');
    }
  },

  // Get a specific note
  getNote: async (noteId: number): Promise<Note> => {
    try {
      const response = await api.get(`/notes/${noteId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch note');
      }
      throw new Error('Network error while fetching note');
    }
  },

  // Start a quiz
  startQuiz: async (quizData: QuizStartRequest): Promise<QuizStartResponse> => {
    try {
      const response = await api.post('/quizzes/start', quizData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to start quiz');
      }
      throw new Error('Network error while starting quiz');
    }
  },

  // Grade a quiz
  gradeQuiz: async (gradeData: QuizGradeRequest): Promise<QuizGradeResponse> => {
    try {
      const response = await api.post('/quizzes/grade', gradeData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to grade quiz');
      }
      throw new Error('Network error while grading quiz');
    }
  },

  // Get quiz history
  getQuizHistory: async (): Promise<QuizSession[]> => {
    try {
      const response = await api.get('/quizzes/history');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch quiz history');
      }
      throw new Error('Network error while fetching quiz history');
    }
  },
};

export default contentService;
