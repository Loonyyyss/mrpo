/**
 * Типы данных для приложения ООО "Обувь"
 */

// Роли пользователей
export type UserRole = 'Гость' | 'Авторизированный клиент' | 'Менеджер' | 'Администратор';

// Пользователь
export interface User {
  id: number;
  role: UserRole;
  fullName: string;
  login: string;
  password: string;
}

// Категория товара
export interface Category {
  id: number;
  name: string;
}

// Производитель
export interface Manufacturer {
  id: number;
  name: string;
}

// Поставщик
export interface Supplier {
  id: number;
  name: string;
}

// Товар
export interface Product {
  id: number;
  article: string;
  name: string;
  unit: string;
  price: number;
  supplierId: number;
  manufacturerId: number;
  categoryId: number;
  discount: number;
  stockQuantity: number;
  description: string;
  photo: string | null;
}

// Пункт выдачи
export interface PickupPoint {
  id: number;
  address: string;
}

// Статус заказа
export type OrderStatus = 'Новый' | 'Завершен';

// Заказ
export interface Order {
  id: number;
  orderItems: OrderItem[];
  orderDate: string;
  deliveryDate: string;
  pickupPointId: number;
  clientId: number;
  pickupCode: string;
  status: OrderStatus;
}

// Элемент заказа (товар + количество)
export interface OrderItem {
  productId: number;
  quantity: number;
}

// Расширенный товар (с названиями вместо ID)
export interface ProductExtended extends Product {
  supplierName: string;
  manufacturerName: string;
  categoryName: string;
  finalPrice: number;
}

// Расширенный заказ (с названиями вместо ID)
export interface OrderExtended extends Order {
  clientName: string;
  pickupPointAddress: string;
  totalAmount: number;
}

// Фильтры для товаров
export interface ProductFilters {
  searchQuery: string;
  supplierId: number | null;
  sortByStock: 'asc' | 'desc' | null;
}
