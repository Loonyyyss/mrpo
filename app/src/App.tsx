/**
 * Главный компонент приложения ООО "Обувь"
 * Управляет навигацией между страницами
 */

import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductFormPage } from '@/pages/ProductFormPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderFormPage } from '@/pages/OrderFormPage';
import type { ReactElement } from 'react';

// Типы страниц
type PageType =
  | 'login'
  | 'products'
  | 'product-form'
  | 'orders'
  | 'order-form';

// Интерфейс состояния навигации
interface NavigationState {
  page: PageType;
  productId: number | null;
  orderId: number | null;
}

// Основной контент приложения
function AppContent(): ReactElement {
  const [navigation, setNavigation] = useState<NavigationState>({
    page: 'login',
    productId: null,
    orderId: null,
  });

  // Обработка успешного входа
  const handleLoginSuccess = (): void => {
    setNavigation({ page: 'products', productId: null, orderId: null });
  };

  // Обработка выхода
  const handleLogout = (): void => {
    setNavigation({ page: 'login', productId: null, orderId: null });
  };

  // Навигация к форме товара
  const handleEditProduct = (productId: number): void => {
    setNavigation({ page: 'product-form', productId, orderId: null });
  };

  // Навигация к добавлению товара
  const handleAddProduct = (): void => {
    setNavigation({ page: 'product-form', productId: null, orderId: null });
  };

  // Навигация к списку заказов
  const handleViewOrders = (): void => {
    setNavigation({ page: 'orders', productId: null, orderId: null });
  };

  // Навигация к форме заказа
  const handleEditOrder = (orderId: number): void => {
    setNavigation({ page: 'order-form', productId: null, orderId });
  };

  // Навигация к добавлению заказа
  const handleAddOrder = (): void => {
    setNavigation({ page: 'order-form', productId: null, orderId: null });
  };

  // Возврат к списку товаров
  const handleBackToProducts = (): void => {
    setNavigation({ page: 'products', productId: null, orderId: null });
  };

  // Возврат к списку заказов
  const handleBackToOrders = (): void => {
    setNavigation({ page: 'orders', productId: null, orderId: null });
  };

  // Сохранение товара
  const handleSaveProduct = (): void => {
    setNavigation({ page: 'products', productId: null, orderId: null });
  };

  // Сохранение заказа
  const handleSaveOrder = (): void => {
    setNavigation({ page: 'orders', productId: null, orderId: null });
  };

  // Рендер текущей страницы
  const renderPage = (): ReactElement => {
    switch (navigation.page) {
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;

      case 'products':
        return (
          <ProductsPage
            onEditProduct={handleEditProduct}
            onAddProduct={handleAddProduct}
            onViewOrders={handleViewOrders}
            onLogout={handleLogout}
          />
        );

      case 'product-form':
        return (
          <ProductFormPage
            productId={navigation.productId}
            onBack={handleBackToProducts}
            onSave={handleSaveProduct}
          />
        );

      case 'orders':
        return (
          <OrdersPage
            onBack={handleBackToProducts}
            onAddOrder={handleAddOrder}
            onEditOrder={handleEditOrder}
          />
        );

      case 'order-form':
        return (
          <OrderFormPage
            orderId={navigation.orderId}
            onBack={handleBackToOrders}
            onSave={handleSaveOrder}
          />
        );

      default:
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return renderPage();
}

// Главный компонент с провайдером
function App(): ReactElement {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
