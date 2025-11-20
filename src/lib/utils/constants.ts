// src/lib/constants.ts
export const API_ENDPOINTS = {
  BASE_URL: process.env.API_BASE_URL ?? 'https://iguru.co.ke/iCollections/endpoints',
  TOKEN_REFRESH: '/api/auth/refresh.php',
  LOGIN: '/api/auth/login.php',
  URL_1: 'https://iguru.co.ke/iCollections/endpoints/api/routing/',
  LIST_CREW:'/api/crew-detail/list.php',
  UPDATE_CREW:'/api/crew-detail/manage.php',
  LIST_CREW_ROLE:'/api/app-roles/list.php',
  DASHBOARD_STATS:'/api/dashboards/list.php',
  CREW_HISTORY:'/api/crew-assignment-history/list.php',
} as const;

export const APP_CONFIG = {
  APP_NAME: 'ICollection web app',
  APP_VERSION: '1.0.0',
  ITEMS_PER_PAGE: 1000,
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  SUPPORTED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

export const THEME_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#64748B',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#06B6D4',
} as const;

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
