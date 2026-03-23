/**
 * База данных приложения на основе localStorage
 * Имитирует работу с SQLite
 */

import type {
  User,
  Product,
  Order,
  PickupPoint,
  Category,
  Manufacturer,
  Supplier,
  ProductExtended,
  OrderExtended,
} from '@/types';

// Ключи для localStorage
const STORAGE_KEYS = {
  USERS: 'obuv_users',
  PRODUCTS: 'obuv_products',
  ORDERS: 'obuv_orders',
  PICKUP_POINTS: 'obuv_pickup_points',
  CATEGORIES: 'obuv_categories',
  MANUFACTURERS: 'obuv_manufacturers',
  SUPPLIERS: 'obuv_suppliers',
  CURRENT_USER: 'obuv_current_user',
} as const;

// Начальные данные пользователей
const initialUsers: User[] = [
  { id: 1, role: 'Администратор', fullName: 'Никифорова Весения Николаевна', login: '94d5ous@gmail.com', password: 'uzWC67' },
  { id: 2, role: 'Администратор', fullName: 'Сазонов Руслан Германович', login: 'uth4iz@mail.com', password: '2L6KZG' },
  { id: 3, role: 'Администратор', fullName: 'Одинцов Серафим Артёмович', login: 'yzls62@outlook.com', password: 'JlFRCZ' },
  { id: 4, role: 'Менеджер', fullName: 'Степанов Михаил Артёмович', login: '1diph5e@tutanota.com', password: '8ntwUp' },
  { id: 5, role: 'Менеджер', fullName: 'Ворсин Петр Евгеньевич', login: 'tjde7c@yahoo.com', password: 'YOyhfR' },
  { id: 6, role: 'Менеджер', fullName: 'Старикова Елена Павловна', login: 'wpmrc3do@tutanota.com', password: 'RSbvHv' },
  { id: 7, role: 'Авторизированный клиент', fullName: 'Михайлюк Анна Вячеславовна', login: '5d4zbu@tutanota.com', password: 'rwVDh9' },
  { id: 8, role: 'Авторизированный клиент', fullName: 'Ситдикова Елена Анатольевна', login: 'ptec8ym@yahoo.com', password: 'LdNyos' },
  { id: 9, role: 'Авторизированный клиент', fullName: 'Ворсин Петр Евгеньевич', login: '1qz4kw@mail.com', password: 'gynQMT' },
  { id: 10, role: 'Авторизированный клиент', fullName: 'Старикова Елена Павловна', login: '4np6se@mail.com', password: 'AtnDjr' },
];

// Начальные категории
const initialCategories: Category[] = [
  { id: 1, name: 'Женская обувь' },
  { id: 2, name: 'Мужская обувь' },
];

// Начальные производители
const initialManufacturers: Manufacturer[] = [
  { id: 1, name: 'Kari' },
  { id: 2, name: 'Marco Tozzi' },
  { id: 3, name: 'Рос' },
  { id: 4, name: 'Rieker' },
  { id: 5, name: 'Alessio Nesca' },
  { id: 6, name: 'CROSBY' },
];

// Начальные поставщики
const initialSuppliers: Supplier[] = [
  { id: 1, name: 'Kari' },
  { id: 2, name: 'Обувь для вас' },
];

// Начальные пункты выдачи
const initialPickupPoints: PickupPoint[] = [
  { id: 1, address: '420151, г. Лесной, ул. Вишневая, 32' },
  { id: 2, address: '125061, г. Лесной, ул. Подгорная, 8' },
  { id: 3, address: '630370, г. Лесной, ул. Шоссейная, 24' },
  { id: 4, address: '400562, г. Лесной, ул. Зеленая, 32' },
  { id: 5, address: '614510, г. Лесной, ул. Маяковского, 47' },
  { id: 6, address: '410542, г. Лесной, ул. Светлая, 46' },
  { id: 7, address: '620839, г. Лесной, ул. Цветочная, 8' },
  { id: 8, address: '443890, г. Лесной, ул. Коммунистическая, 1' },
  { id: 9, address: '603379, г. Лесной, ул. Спортивная, 46' },
  { id: 10, address: '603721, г. Лесной, ул. Гоголя, 41' },
  { id: 11, address: '410172, г. Лесной, ул. Северная, 13' },
  { id: 12, address: '614611, г. Лесной, ул. Молодежная, 50' },
  { id: 13, address: '454311, г.Лесной, ул. Новая, 19' },
  { id: 14, address: '660007, г.Лесной, ул. Октябрьская, 19' },
  { id: 15, address: '603036, г. Лесной, ул. Садовая, 4' },
  { id: 16, address: '394060, г.Лесной, ул. Фрунзе, 43' },
  { id: 17, address: '410661, г. Лесной, ул. Школьная, 50' },
  { id: 18, address: '625590, г. Лесной, ул. Коммунистическая, 20' },
  { id: 19, address: '625683, г. Лесной, ул. 8 Марта' },
  { id: 20, address: '450983, г.Лесной, ул. Комсомольская, 26' },
];

// Начальные товары
const initialProducts: Product[] = [
  { id: 1, article: 'А112Т4', name: 'Ботинки', unit: 'шт.', price: 4990, supplierId: 1, manufacturerId: 1, categoryId: 1, discount: 3, stockQuantity: 6, description: 'Женские Ботинки демисезонные kari', photo: '1.jpg' },
  { id: 2, article: 'F635R4', name: 'Ботинки', unit: 'шт.', price: 3244, supplierId: 2, manufacturerId: 2, categoryId: 1, discount: 2, stockQuantity: 13, description: 'Ботинки Marco Tozzi женские демисезонные, размер 39, цвет бежевый', photo: '2.jpg' },
  { id: 3, article: 'H782T5', name: 'Туфли', unit: 'шт.', price: 4499, supplierId: 1, manufacturerId: 1, categoryId: 2, discount: 4, stockQuantity: 5, description: 'Туфли kari мужские классика MYZ21AW-450A, размер 43, цвет: черный', photo: '3.jpg' },
  { id: 4, article: 'G783F5', name: 'Ботинки', unit: 'шт.', price: 5900, supplierId: 1, manufacturerId: 3, categoryId: 2, discount: 2, stockQuantity: 8, description: 'Мужские ботинки Рос-Обувь кожаные с натуральным мехом', photo: '4.jpg' },
  { id: 5, article: 'J384T6', name: 'Ботинки', unit: 'шт.', price: 3800, supplierId: 2, manufacturerId: 4, categoryId: 2, discount: 2, stockQuantity: 16, description: 'B3430/14 Полуботинки мужские Rieker', photo: '5.jpg' },
  { id: 6, article: 'D572U8', name: 'Кроссовки', unit: 'шт.', price: 4100, supplierId: 2, manufacturerId: 3, categoryId: 2, discount: 3, stockQuantity: 6, description: '129615-4 Кроссовки мужские', photo: '6.jpg' },
  { id: 7, article: 'F572H7', name: 'Туфли', unit: 'шт.', price: 2700, supplierId: 1, manufacturerId: 2, categoryId: 1, discount: 2, stockQuantity: 14, description: 'Туфли Marco Tozzi женские летние, размер 39, цвет черный', photo: '7.jpg' },
  { id: 8, article: 'D329H3', name: 'Полуботинки', unit: 'шт.', price: 1890, supplierId: 2, manufacturerId: 5, categoryId: 1, discount: 4, stockQuantity: 4, description: 'Полуботинки Alessio Nesca женские 3-30797-47, размер 37, цвет: бордовый', photo: '8.jpg' },
  { id: 9, article: 'B320R5', name: 'Туфли', unit: 'шт.', price: 4300, supplierId: 1, manufacturerId: 4, categoryId: 1, discount: 2, stockQuantity: 6, description: 'Туфли Rieker женские демисезонные, размер 41, цвет коричневый', photo: '9.jpg' },
  { id: 10, article: 'G432E4', name: 'Туфли', unit: 'шт.', price: 2800, supplierId: 1, manufacturerId: 1, categoryId: 1, discount: 3, stockQuantity: 15, description: 'Туфли kari женские TR-YR-413017, размер 37, цвет: черный', photo: '10.jpg' },
  { id: 11, article: 'S213E3', name: 'Полуботинки', unit: 'шт.', price: 2156, supplierId: 2, manufacturerId: 6, categoryId: 2, discount: 3, stockQuantity: 6, description: '407700/01-01 Полуботинки мужские CROSBY', photo: null },
  { id: 12, article: 'E482R4', name: 'Полуботинки', unit: 'шт.', price: 1800, supplierId: 1, manufacturerId: 1, categoryId: 1, discount: 2, stockQuantity: 14, description: 'Полуботинки kari женские MYZ20S-149, размер 41, цвет: черный', photo: null },
  { id: 13, article: 'S634B5', name: 'Кеды', unit: 'шт.', price: 5500, supplierId: 2, manufacturerId: 6, categoryId: 2, discount: 3, stockQuantity: 0, description: 'Кеды Caprice мужские демисезонные, размер 42, цвет черный', photo: null },
  { id: 14, article: 'K345R4', name: 'Полуботинки', unit: 'шт.', price: 2100, supplierId: 2, manufacturerId: 6, categoryId: 2, discount: 2, stockQuantity: 3, description: '407700/01-02 Полуботинки мужские CROSBY', photo: null },
  { id: 15, article: 'O754F4', name: 'Туфли', unit: 'шт.', price: 5400, supplierId: 2, manufacturerId: 4, categoryId: 1, discount: 4, stockQuantity: 18, description: 'Туфли женские демисезонные Rieker артикул 55073-68/37', photo: null },
  { id: 16, article: 'G531F4', name: 'Ботинки', unit: 'шт.', price: 6600, supplierId: 1, manufacturerId: 1, categoryId: 1, discount: 12, stockQuantity: 9, description: 'Ботинки женские зимние ROMER арт. 893167-01 Черный', photo: null },
  { id: 17, article: 'J542F5', name: 'Тапочки', unit: 'шт.', price: 500, supplierId: 1, manufacturerId: 1, categoryId: 2, discount: 13, stockQuantity: 0, description: 'Тапочки мужские Арт.70701-55-67син р.41', photo: null },
  { id: 18, article: 'B431R5', name: 'Ботинки', unit: 'шт.', price: 2700, supplierId: 2, manufacturerId: 4, categoryId: 2, discount: 2, stockQuantity: 5, description: 'Мужские кожаные ботинки/мужские ботинки', photo: null },
  { id: 19, article: 'P764G4', name: 'Туфли', unit: 'шт.', price: 6800, supplierId: 1, manufacturerId: 6, categoryId: 1, discount: 15, stockQuantity: 15, description: 'Туфли женские, ARGO, размер 38', photo: null },
  { id: 20, article: 'C436G5', name: 'Ботинки', unit: 'шт.', price: 10200, supplierId: 1, manufacturerId: 5, categoryId: 1, discount: 15, stockQuantity: 9, description: 'Ботинки женские, ARGO, размер 40', photo: null },
  { id: 21, article: 'F427R5', name: 'Ботинки', unit: 'шт.', price: 11800, supplierId: 2, manufacturerId: 4, categoryId: 1, discount: 15, stockQuantity: 11, description: 'Ботинки на молнии с декоративной пряжкой FRAU', photo: null },
  { id: 22, article: 'N457T5', name: 'Полуботинки', unit: 'шт.', price: 4600, supplierId: 1, manufacturerId: 6, categoryId: 1, discount: 3, stockQuantity: 13, description: 'Полуботинки Ботинки черные зимние, мех', photo: null },
  { id: 23, article: 'D364R4', name: 'Туфли', unit: 'шт.', price: 12400, supplierId: 1, manufacturerId: 1, categoryId: 1, discount: 16, stockQuantity: 5, description: 'Туфли Luiza Belly женские Kate-lazo черные из натуральной замши', photo: null },
  { id: 24, article: 'S326R5', name: 'Тапочки', unit: 'шт.', price: 9900, supplierId: 2, manufacturerId: 6, categoryId: 2, discount: 17, stockQuantity: 15, description: 'Мужские кожаные тапочки "Профиль С.Дали"', photo: null },
  { id: 25, article: 'L754R4', name: 'Полуботинки', unit: 'шт.', price: 1700, supplierId: 1, manufacturerId: 1, categoryId: 1, discount: 2, stockQuantity: 7, description: 'Полуботинки kari женские WB2020SS-26, размер 38, цвет: черный', photo: null },
  { id: 26, article: 'M542T5', name: 'Кроссовки', unit: 'шт.', price: 2800, supplierId: 2, manufacturerId: 4, categoryId: 2, discount: 18, stockQuantity: 3, description: 'Кроссовки мужские TOFA', photo: null },
  { id: 27, article: 'D268G5', name: 'Туфли', unit: 'шт.', price: 4399, supplierId: 2, manufacturerId: 4, categoryId: 1, discount: 3, stockQuantity: 12, description: 'Туфли Rieker женские демисезонные, размер 36, цвет коричневый', photo: null },
  { id: 28, article: 'T324F5', name: 'Сапоги', unit: 'шт.', price: 4699, supplierId: 1, manufacturerId: 6, categoryId: 1, discount: 2, stockQuantity: 5, description: 'Сапоги замша Цвет: синий', photo: null },
  { id: 29, article: 'K358H6', name: 'Тапочки', unit: 'шт.', price: 599, supplierId: 1, manufacturerId: 4, categoryId: 2, discount: 20, stockQuantity: 2, description: 'Тапочки мужские син р.41', photo: null },
  { id: 30, article: 'H535R5', name: 'Ботинки', unit: 'шт.', price: 2300, supplierId: 2, manufacturerId: 4, categoryId: 1, discount: 2, stockQuantity: 7, description: 'Женские Ботинки демисезонные', photo: null },
];

// Начальные заказы
const initialOrders: Order[] = [
  { id: 1, orderItems: [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 2 }], orderDate: '2025-02-27', deliveryDate: '2025-04-20', pickupPointId: 1, clientId: 4, pickupCode: '901', status: 'Завершен' },
  { id: 2, orderItems: [{ productId: 3, quantity: 1 }, { productId: 4, quantity: 1 }], orderDate: '2022-09-28', deliveryDate: '2025-04-21', pickupPointId: 11, clientId: 2, pickupCode: '902', status: 'Завершен' },
  { id: 3, orderItems: [{ productId: 5, quantity: 10 }, { productId: 6, quantity: 10 }], orderDate: '2025-03-21', deliveryDate: '2025-04-22', pickupPointId: 2, clientId: 3, pickupCode: '903', status: 'Завершен' },
  { id: 4, orderItems: [{ productId: 7, quantity: 5 }, { productId: 8, quantity: 4 }], orderDate: '2025-02-20', deliveryDate: '2025-04-23', pickupPointId: 11, clientId: 3, pickupCode: '904', status: 'Завершен' },
  { id: 5, orderItems: [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 2 }], orderDate: '2025-03-17', deliveryDate: '2025-04-24', pickupPointId: 2, clientId: 4, pickupCode: '905', status: 'Завершен' },
  { id: 6, orderItems: [{ productId: 3, quantity: 1 }, { productId: 4, quantity: 1 }], orderDate: '2025-03-01', deliveryDate: '2025-04-25', pickupPointId: 15, clientId: 2, pickupCode: '906', status: 'Завершен' },
  { id: 7, orderItems: [{ productId: 5, quantity: 10 }, { productId: 6, quantity: 10 }], orderDate: '2025-02-28', deliveryDate: '2025-04-26', pickupPointId: 3, clientId: 3, pickupCode: '907', status: 'Завершен' },
  { id: 8, orderItems: [{ productId: 7, quantity: 5 }, { productId: 8, quantity: 4 }], orderDate: '2025-03-31', deliveryDate: '2025-04-27', pickupPointId: 19, clientId: 3, pickupCode: '908', status: 'Новый' },
  { id: 9, orderItems: [{ productId: 9, quantity: 5 }, { productId: 10, quantity: 1 }], orderDate: '2025-04-02', deliveryDate: '2025-04-28', pickupPointId: 5, clientId: 4, pickupCode: '909', status: 'Новый' },
  { id: 10, orderItems: [{ productId: 11, quantity: 5 }, { productId: 12, quantity: 5 }], orderDate: '2025-04-03', deliveryDate: '2025-04-29', pickupPointId: 19, clientId: 4, pickupCode: '910', status: 'Новый' },
];

// Инициализация базы данных
export function initializeDatabase(): void {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PICKUP_POINTS)) {
    localStorage.setItem(STORAGE_KEYS.PICKUP_POINTS, JSON.stringify(initialPickupPoints));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MANUFACTURERS)) {
    localStorage.setItem(STORAGE_KEYS.MANUFACTURERS, JSON.stringify(initialManufacturers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(initialSuppliers));
  }
}

// Сброс базы данных к начальному состоянию
export function resetDatabase(): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
  localStorage.setItem(STORAGE_KEYS.PICKUP_POINTS, JSON.stringify(initialPickupPoints));
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
  localStorage.setItem(STORAGE_KEYS.MANUFACTURERS, JSON.stringify(initialManufacturers));
  localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(initialSuppliers));
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Получить текущего пользователя
export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userJson ? JSON.parse(userJson) : null;
}

// Установить текущего пользователя
export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// Аутентификация пользователя
export function authenticateUser(login: string, password: string): User | null {
  const users = getAllUsers();
  return users.find(u => u.login === login && u.password === password) || null;
}

// Получить всех пользователей
export function getAllUsers(): User[] {
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
  return usersJson ? JSON.parse(usersJson) : [];
}

// Получить все категории
export function getAllCategories(): Category[] {
  const categoriesJson = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  return categoriesJson ? JSON.parse(categoriesJson) : [];
}

// Получить всех производителей
export function getAllManufacturers(): Manufacturer[] {
  const manufacturersJson = localStorage.getItem(STORAGE_KEYS.MANUFACTURERS);
  return manufacturersJson ? JSON.parse(manufacturersJson) : [];
}

// Получить всех поставщиков
export function getAllSuppliers(): Supplier[] {
  const suppliersJson = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
  return suppliersJson ? JSON.parse(suppliersJson) : [];
}

// Получить все пункты выдачи
export function getAllPickupPoints(): PickupPoint[] {
  const pickupPointsJson = localStorage.getItem(STORAGE_KEYS.PICKUP_POINTS);
  return pickupPointsJson ? JSON.parse(pickupPointsJson) : [];
}

// Получить все товары
export function getAllProducts(): Product[] {
  const productsJson = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return productsJson ? JSON.parse(productsJson) : [];
}

// Получить расширенные товары (с названиями вместо ID)
export function getExtendedProducts(): ProductExtended[] {
  const products = getAllProducts();
  const suppliers = getAllSuppliers();
  const manufacturers = getAllManufacturers();
  const categories = getAllCategories();

  return products.map(product => {
    const supplier = suppliers.find(s => s.id === product.supplierId);
    const manufacturer = manufacturers.find(m => m.id === product.manufacturerId);
    const category = categories.find(c => c.id === product.categoryId);
    const discountMultiplier = 1 - product.discount / 100;

    return {
      ...product,
      supplierName: supplier?.name || 'Неизвестно',
      manufacturerName: manufacturer?.name || 'Неизвестно',
      categoryName: category?.name || 'Неизвестно',
      finalPrice: Math.round(product.price * discountMultiplier),
    };
  });
}

// Получить товар по ID
export function getProductById(id: number): Product | null {
  const products = getAllProducts();
  return products.find(p => p.id === id) || null;
}

// Добавить товар
export function addProduct(product: Omit<Product, 'id'>): Product {
  const products = getAllProducts();
  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const newProduct = { ...product, id: newId };
  products.push(newProduct);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  return newProduct;
}

// Обновить товар
export function updateProduct(id: number, updates: Partial<Product>): Product | null {
  const products = getAllProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  return products[index];
}

// Удалить товар
export function deleteProduct(id: number): boolean {
  // Проверяем, есть ли товар в заказах
  const orders = getAllOrders();
  const isInOrders = orders.some(order => order.orderItems.some(item => item.productId === id));
  if (isInOrders) return false;

  const products = getAllProducts();
  const filteredProducts = products.filter(p => p.id !== id);
  if (filteredProducts.length === products.length) return false;
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filteredProducts));
  return true;
}

// Получить все заказы
export function getAllOrders(): Order[] {
  const ordersJson = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return ordersJson ? JSON.parse(ordersJson) : [];
}

// Получить расширенные заказы (с названиями вместо ID)
export function getExtendedOrders(): OrderExtended[] {
  const orders = getAllOrders();
  const users = getAllUsers();
  const pickupPoints = getAllPickupPoints();
  const products = getAllProducts();

  return orders.map(order => {
    const client = users.find(u => u.id === order.clientId);
    const pickupPoint = pickupPoints.find(p => p.id === order.pickupPointId);

    const totalAmount = order.orderItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const discountMultiplier = 1 - product.discount / 100;
        return sum + Math.round(product.price * discountMultiplier) * item.quantity;
      }
      return sum;
    }, 0);

    return {
      ...order,
      clientName: client?.fullName || 'Неизвестно',
      pickupPointAddress: pickupPoint?.address || 'Неизвестно',
      totalAmount,
    };
  });
}

// Получить заказ по ID
export function getOrderById(id: number): Order | null {
  const orders = getAllOrders();
  return orders.find(o => o.id === id) || null;
}

// Добавить заказ
export function addOrder(order: Omit<Order, 'id'>): Order {
  const orders = getAllOrders();
  const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
  const newOrder = { ...order, id: newId };
  orders.push(newOrder);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  return newOrder;
}

// Обновить заказ
export function updateOrder(id: number, updates: Partial<Order>): Order | null {
  const orders = getAllOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return null;
  orders[index] = { ...orders[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  return orders[index];
}

// Удалить заказ
export function deleteOrder(id: number): boolean {
  const orders = getAllOrders();
  const filteredOrders = orders.filter(o => o.id !== id);
  if (filteredOrders.length === orders.length) return false;
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filteredOrders));
  return true;
}

// Проверить, может ли товар быть удален
export function canDeleteProduct(productId: number): boolean {
  const orders = getAllOrders();
  return !orders.some(order => order.orderItems.some(item => item.productId === productId));
}

// Экспортировать скрипт базы данных
export function exportDatabaseScript(): string {
  const data = {
    users: getAllUsers(),
    products: getAllProducts(),
    orders: getAllOrders(),
    pickupPoints: getAllPickupPoints(),
    categories: getAllCategories(),
    manufacturers: getAllManufacturers(),
    suppliers: getAllSuppliers(),
  };
  return JSON.stringify(data, null, 2);
}
