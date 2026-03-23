-- SQL Script for OOO "Obuv" Database
-- Database Schema in 3rd Normal Form

-- Create tables
CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role VARCHAR(50) NOT NULL,
    fullName VARCHAR(200) NOT NULL,
    login VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE Categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE Manufacturers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE Suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE PickupPoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address VARCHAR(300) NOT NULL
);

CREATE TABLE Products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    supplierId INTEGER NOT NULL,
    manufacturerId INTEGER NOT NULL,
    categoryId INTEGER NOT NULL,
    discount INTEGER DEFAULT 0,
    stockQuantity INTEGER DEFAULT 0,
    description TEXT,
    photo VARCHAR(200),
    FOREIGN KEY (supplierId) REFERENCES Suppliers(id),
    FOREIGN KEY (manufacturerId) REFERENCES Manufacturers(id),
    FOREIGN KEY (categoryId) REFERENCES Categories(id)
);

CREATE TABLE Orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientId INTEGER NOT NULL,
    pickupPointId INTEGER NOT NULL,
    orderDate DATE NOT NULL,
    deliveryDate DATE NOT NULL,
    pickupCode VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'Новый',
    FOREIGN KEY (clientId) REFERENCES Users(id),
    FOREIGN KEY (pickupPointId) REFERENCES PickupPoints(id)
);

CREATE TABLE OrderItems (
    orderId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    PRIMARY KEY (orderId, productId),
    FOREIGN KEY (orderId) REFERENCES Orders(id),
    FOREIGN KEY (productId) REFERENCES Products(id)
);

-- Insert sample data
INSERT INTO Categories (name) VALUES 
    ('Женская обувь'),
    ('Мужская обувь');

INSERT INTO Manufacturers (name) VALUES 
    ('Kari'),
    ('Marco Tozzi'),
    ('Рос'),
    ('Rieker'),
    ('Alessio Nesca'),
    ('CROSBY');

INSERT INTO Suppliers (name) VALUES 
    ('Kari'),
    ('Обувь для вас');

-- Users data (from Excel)
INSERT INTO Users (role, fullName, login, password) VALUES 
    ('Администратор', 'Никифорова Весения Николаевна', '94d5ous@gmail.com', 'uzWC67'),
    ('Администратор', 'Сазонов Руслан Германович', 'uth4iz@mail.com', '2L6KZG'),
    ('Администратор', 'Одинцов Серафим Артёмович', 'yzls62@outlook.com', 'JlFRCZ'),
    ('Менеджер', 'Степанов Михаил Артёмович', '1diph5e@tutanota.com', '8ntwUp'),
    ('Менеджер', 'Ворсин Петр Евгеньевич', 'tjde7c@yahoo.com', 'YOyhfR'),
    ('Менеджер', 'Старикова Елена Павловна', 'wpmrc3do@tutanota.com', 'RSbvHv'),
    ('Авторизированный клиент', 'Михайлюк Анна Вячеславовна', '5d4zbu@tutanota.com', 'rwVDh9'),
    ('Авторизированный клиент', 'Ситдикова Елена Анатольевна', 'ptec8ym@yahoo.com', 'LdNyos'),
    ('Авторизированный клиент', 'Ворсин Петр Евгеньевич', '1qz4kw@mail.com', 'gynQMT'),
    ('Авторизированный клиент', 'Старикова Елена Павловна', '4np6se@mail.com', 'AtnDjr');

-- Pickup points (from Excel)
INSERT INTO PickupPoints (address) VALUES 
    ('420151, г. Лесной, ул. Вишневая, 32'),
    ('125061, г. Лесной, ул. Подгорная, 8'),
    ('630370, г. Лесной, ул. Шоссейная, 24'),
    ('400562, г. Лесной, ул. Зеленая, 32'),
    ('614510, г. Лесной, ул. Маяковского, 47'),
    ('410542, г. Лесной, ул. Светлая, 46'),
    ('620839, г. Лесной, ул. Цветочная, 8'),
    ('443890, г. Лесной, ул. Коммунистическая, 1'),
    ('603379, г. Лесной, ул. Спортивная, 46'),
    ('603721, г. Лесной, ул. Гоголя, 41'),
    ('410172, г. Лесной, ул. Северная, 13'),
    ('614611, г. Лесной, ул. Молодежная, 50'),
    ('454311, г.Лесной, ул. Новая, 19'),
    ('660007, г.Лесной, ул. Октябрьская, 19'),
    ('603036, г. Лесной, ул. Садовая, 4'),
    ('394060, г.Лесной, ул. Фрунзе, 43'),
    ('410661, г. Лесной, ул. Школьная, 50'),
    ('625590, г. Лесной, ул. Коммунистическая, 20'),
    ('625683, г. Лесной, ул. 8 Марта'),
    ('450983, г.Лесной, ул. Комсомольская, 26');

-- Products (from Tovar.xlsx)
INSERT INTO Products (article, name, unit, price, supplierId, manufacturerId, categoryId, discount, stockQuantity, description, photo) VALUES 
    ('А112Т4', 'Ботинки', 'шт.', 4990, 1, 1, 1, 3, 6, 'Женские Ботинки демисезонные kari', '1.jpg'),
    ('F635R4', 'Ботинки', 'шт.', 3244, 2, 2, 1, 2, 13, 'Ботинки Marco Tozzi женские демисезонные, размер 39, цвет бежевый', '2.jpg'),
    ('H782T5', 'Туфли', 'шт.', 4499, 1, 1, 2, 4, 5, 'Туфли kari мужские классика MYZ21AW-450A, размер 43, цвет: черный', '3.jpg'),
    ('G783F5', 'Ботинки', 'шт.', 5900, 1, 3, 2, 2, 8, 'Мужские ботинки Рос-Обувь кожаные с натуральным мехом', '4.jpg'),
    ('J384T6', 'Ботинки', 'шт.', 3800, 2, 4, 2, 2, 16, 'B3430/14 Полуботинки мужские Rieker', '5.jpg'),
    ('D572U8', 'Кроссовки', 'шт.', 4100, 2, 3, 2, 3, 6, '129615-4 Кроссовки мужские', '6.jpg'),
    ('F572H7', 'Туфли', 'шт.', 2700, 1, 2, 1, 2, 14, 'Туфли Marco Tozzi женские летние, размер 39, цвет черный', '7.jpg'),
    ('D329H3', 'Полуботинки', 'шт.', 1890, 2, 5, 1, 4, 4, 'Полуботинки Alessio Nesca женские 3-30797-47, размер 37, цвет: бордовый', '8.jpg'),
    ('B320R5', 'Туфли', 'шт.', 4300, 1, 4, 1, 2, 6, 'Туфли Rieker женские демисезонные, размер 41, цвет коричневый', '9.jpg'),
    ('G432E4', 'Туфли', 'шт.', 2800, 1, 1, 1, 3, 15, 'Туфли kari женские TR-YR-413017, размер 37, цвет: черный', '10.jpg');

-- Add more products as needed...
