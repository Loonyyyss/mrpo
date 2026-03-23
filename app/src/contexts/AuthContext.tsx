/**
 * Контекст аутентификации
 */

import { createContext, useContext, useState, useEffect, type ReactNode, type ReactElement } from 'react';
import type { User } from '@/types';
import {
  getCurrentUser,
  setCurrentUser,
  authenticateUser,
  initializeDatabase,
} from '@/db/database';

interface AuthContextType {
  currentUser: User | null;
  login: (login: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: string | null;
  isGuest: boolean;
  setGuestMode: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Инициализация базы данных и проверка сессии
  useEffect(() => {
    initializeDatabase();
    const savedUser = getCurrentUser();
    if (savedUser) {
      setCurrentUserState(savedUser);
    }
    setIsInitialized(true);
  }, []);

  // Вход в систему
  const login = (login: string, password: string): boolean => {
    const user = authenticateUser(login, password);
    if (user) {
      setCurrentUserState(user);
      setCurrentUser(user);
      setIsGuest(false);
      return true;
    }
    return false;
  };

  // Выход из системы
  const logout = (): void => {
    setCurrentUserState(null);
    setCurrentUser(null);
    setIsGuest(false);
  };

  // Установка гостевого режима
  const setGuestMode = (value: boolean): void => {
    setIsGuest(value);
    if (value) {
      setCurrentUserState(null);
      setCurrentUser(null);
    }
  };

  const isAuthenticated = currentUser !== null;
  const userRole = currentUser?.role || (isGuest ? 'Гость' : null);

  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAuthenticated,
        userRole,
        isGuest,
        setGuestMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
