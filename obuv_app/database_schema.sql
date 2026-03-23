-- SQL Script for OOO "Obuv" Database (Python Version)
-- SQLite Database Schema in 3rd Normal Form

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================
-- Таблица пользователей
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL CHECK(role IN ('Администратор', 'Менеджер', 'Авторизированный клиент')),
    full_name TEXT NOT NULL,
    login TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- ============================================
-- Таблица категорий товаров
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- ============================================
-- Таблица производителей
-- ============================================
CREATE TABLE IF NOT EXISTS manufacturers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- ============================================
-- Таблица поставщиков
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- ============================================
-- Таблица пунктов выдачи
-- ============================================
CREATE TABLE IF NOT EXISTS pickup_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL
);

-- ============================================
-- Таблица товаров
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article TEXT NOT NULL,
    name TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'шт.',
    price REAL NOT NULL CHECK(price >= 0),
    supplier_id INTEGER NOT NULL,
    manufacturer_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    discount INTEGER DEFAULT 0 CHECK(discount >= 0 AND discount <= 100),
    stock_quantity INTEGER DEFAULT 0 CHECK(stock_quantity >= 0),
    description TEXT,
    photo TEXT,
    FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE RESTRICT,
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers (id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
);

-- ============================================
-- Таблица заказов
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    pickup_point_id INTEGER NOT NULL,
    order_date TEXT NOT NULL,
    delivery_date TEXT NOT NULL,
    pickup_code TEXT NOT NULL,
    status TEXT DEFAULT 'Новый' CHECK(status IN ('Новый', 'Завершен')),
    FOREIGN KEY (client_id) REFERENCES users (id) ON DELETE RESTRICT,
    FOREIGN KEY (pickup_point_id) REFERENCES pickup_points (id) ON DELETE RESTRICT
);

-- ============================================
-- Таблица товаров в заказе (связующая)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
);

-- ============================================
-- Индексы для оптимизации
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_article ON products(article);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ============================================
-- Представление для расширенной информации о товарах
-- ============================================
CREATE VIEW IF NOT EXISTS v_products_extended AS
SELECT 
    p.*,
    s.name as supplier_name,
    m.name as manufacturer_name,
    c.name as category_name,
    ROUND(p.price * (1 - p.discount / 100.0), 2) as final_price
FROM products p
JOIN suppliers s ON p.supplier_id = s.id
JOIN manufacturers m ON p.manufacturer_id = m.id
JOIN categories c ON p.category_id = c.id;

-- ============================================
-- Представление для расширенной информации о заказах
-- ============================================
CREATE VIEW IF NOT EXISTS v_orders_extended AS
SELECT 
    o.*,
    u.full_name as client_name,
    pp.address as pickup_point_address,
    (SELECT SUM(oi.quantity * ROUND(p.price * (1 - p.discount / 100.0), 2))
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = o.id) as total_amount
FROM orders o
JOIN users u ON o.client_id = u.id
JOIN pickup_points pp ON o.pickup_point_id = pp.id;

-- ============================================
-- Триггер для проверки наличия товара перед добавлением в заказ
-- ============================================
CREATE TRIGGER IF NOT EXISTS check_stock_before_insert
BEFORE INSERT ON order_items
BEGIN
    SELECT CASE
        WHEN (SELECT stock_quantity FROM products WHERE id = NEW.product_id) < NEW.quantity
        THEN RAISE(ABORT, 'Недостаточно товара на складе')
    END;
END;

-- ============================================
-- Начальные данные
-- ============================================

-- Категории
INSERT OR IGNORE INTO categories (id, name) VALUES (1, 'Женская обувь');
INSERT OR IGNORE INTO categories (id, name) VALUES (2, 'Мужская обувь');

-- Производители
INSERT OR IGNORE INTO manufacturers (id, name) VALUES (1, 'Kari');
INSERT OR IGNORE INTO manufacturers (id, name) VALUES (2, 'Marco Tozzi');
INSERT OR IGNORE INTO manufacturers (id, name) VALUES (3, 'Рос');
INSERT OR IGNORE INTO manufacturers (id, name) VALUES (4, 'Rieker');
INSERT OR IGNORE INTO manufacturers (id, name) VALUES (5, 'Alessio Nesca');
INSERT OR IGNORE INTO manufacturers (id, name) VALUES (6, 'CROSBY');

-- Поставщики
INSERT OR IGNORE INTO suppliers (id, name) VALUES (1, 'Kari');
INSERT OR IGNORE INTO suppliers (id, name) VALUES (2, 'Обувь для вас');

-- Пользователи
INSERT OR IGNORE INTO users (id, role, full_name, login, password) VALUES
(1, 'Администратор', 'Никифорова Весения Николаевна', '94d5ous@gmail.com', 'uzWC67'),
(2, 'Администратор', 'Сазонов Руслан Германович', 'uth4iz@mail.com', '2L6KZG'),
(3, 'Администратор', 'Одинцов Серафим Артёмович', 'yzls62@outlook.com', 'JlFRCZ'),
(4, 'Менеджер', 'Степанов Михаил Артёмович', '1diph5e@tutanota.com', '8ntwUp'),
(5, 'Менеджер', 'Ворсин Петр Евгеньевич', 'tjde7c@yahoo.com', 'YOyhfR'),
(6, 'Менеджер', 'Старикова Елена Павловна', 'wpmrc3do@tutanota.com', 'RSbvHv'),
(7, 'Авторизированный клиент', 'Михайлюк Анна Вячеславовна', '5d4zbu@tutanota.com', 'rwVDh9'),
(8, 'Авторизированный клиент', 'Ситдикова Елена Анатольевна', 'ptec8ym@yahoo.com', 'LdNyos'),
(9, 'Авторизированный клиент', 'Ворсин Петр Евгеньевич', '1qz4kw@mail.com', 'gynQMT'),
(10, 'Авторизированный клиент', 'Старикова Елена Павловна', '4np6se@mail.com', 'AtnDjr');
