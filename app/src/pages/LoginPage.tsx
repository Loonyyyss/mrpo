/**
 * Страница входа в систему
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, LogIn, User } from 'lucide-react';
import type { ReactElement } from 'react';

export function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }): ReactElement {
  const { login, setGuestMode } = useAuth();
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!loginInput.trim() || !password.trim()) {
      setError('Пожалуйста, заполните все поля');
      setIsLoading(false);
      return;
    }

    const success = login(loginInput, password);
    if (success) {
      onLoginSuccess();
    } else {
      setError('Неверный логин или пароль');
    }
    setIsLoading(false);
  };

  const handleGuestLogin = (): void => {
    setGuestMode(true);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md border-2 border-gray-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/Icon.png"
              alt="Логотип ООО Обувь"
              className="h-24 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Times New Roman, serif' }}>
            ООО "Обувь"
          </CardTitle>
          <CardDescription style={{ fontFamily: 'Times New Roman, serif' }}>
            Система управления продажами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="login" style={{ fontFamily: 'Times New Roman, serif' }}>
                Логин
              </Label>
              <Input
                id="login"
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="Введите логин"
                style={{ fontFamily: 'Times New Roman, serif' }}
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" style={{ fontFamily: 'Times New Roman, serif' }}>
                Пароль
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                  className="border-gray-300 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              style={{ backgroundColor: '#00FA9A', fontFamily: 'Times New Roman, serif' }}
              disabled={isLoading}
            >
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGuestLogin}
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              <User className="mr-2 h-4 w-4" />
              Войти как гость
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
