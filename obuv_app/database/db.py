"""
Модуль работы с базой данных SQLite.
"""

import sqlite3
import os
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple

# Путь к файлу базы данных
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'obuv_database.db')


class Database:
    """Класс для работы с базой данных."""

    def __init__(self):
        """Инициализация подключения к БД."""
        self.conn = sqlite3.connect(DB_PATH)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()
        self._create_tables()
        self._insert_initial_data()

    def _create_tables(self) -> None:
        """Создание таблиц базы данных."""
        # Таблица пользователей
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT NOT NULL,
                full_name TEXT NOT NULL,
                login TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            )
        ''')

        # Таблица категорий
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            )
        ''')

        # Таблица производителей
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS manufacturers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            )
        ''')

        # Таблица поставщиков
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS suppliers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            )
        ''')

        # Таблица пунктов выдачи
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS pickup_points (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                address TEXT NOT NULL
            )
        ''')

        # Таблица товаров
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                article TEXT NOT NULL,
                name TEXT NOT NULL,
                unit TEXT NOT NULL DEFAULT 'шт.',
                price REAL NOT NULL,
                supplier_id INTEGER NOT NULL,
                manufacturer_id INTEGER NOT NULL,
                category_id INTEGER NOT NULL,
                discount INTEGER DEFAULT 0,
                stock_quantity INTEGER DEFAULT 0,
                description TEXT,
                photo TEXT,
                FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
                FOREIGN KEY (manufacturer_id) REFERENCES manufacturers (id),
                FOREIGN KEY (category_id) REFERENCES categories (id)
            )
        ''')

        # Таблица заказов
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id INTEGER NOT NULL,
                pickup_point_id INTEGER NOT NULL,
                order_date TEXT NOT NULL,
                delivery_date TEXT NOT NULL,
                pickup_code TEXT NOT NULL,
                status TEXT DEFAULT 'Новый',
                FOREIGN KEY (client_id) REFERENCES users (id),
                FOREIGN KEY (pickup_point_id) REFERENCES pickup_points (id)
            )
        ''')

        # Таблица товаров в заказе
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS order_items (
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                PRIMARY KEY (order_id, product_id),
                FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products (id)
            )
        ''')

        self.conn.commit()

    def _insert_initial_data(self) -> None:
        """Заполнение начальными данными."""
        # Проверяем, есть ли уже данные
        self.cursor.execute('SELECT COUNT(*) FROM users')
        if self.cursor.fetchone()[0] > 0:
            return

        # Категории
        categories = [('Женская обувь',), ('Мужская обувь',)]
        self.cursor.executemany(
            'INSERT INTO categories (name) VALUES (?)', categories
        )

        # Производители
        manufacturers = [
            ('Kari',), ('Marco Tozzi',), ('Рос',),
            ('Rieker',), ('Alessio Nesca',), ('CROSBY',)
        ]
        self.cursor.executemany(
            'INSERT INTO manufacturers (name) VALUES (?)', manufacturers
        )

        # Поставщики
        suppliers = [('Kari',), ('Обувь для вас',)]
        self.cursor.executemany(
            'INSERT INTO suppliers (name) VALUES (?)', suppliers
        )

        # Пользователи
        users = [
            ('Администратор', 'Никифорова Весения Николаевна',
             '94d5ous@gmail.com', 'uzWC67'),
            ('Администратор', 'Сазонов Руслан Германович',
             'uth4iz@mail.com', '2L6KZG'),
            ('Администратор', 'Одинцов Серафим Артёмович',
             'yzls62@outlook.com', 'JlFRCZ'),
            ('Менеджер', 'Степанов Михаил Артёмович',
             '1diph5e@tutanota.com', '8ntwUp'),
            ('Менеджер', 'Ворсин Петр Евгеньевич',
             'tjde7c@yahoo.com', 'YOyhfR'),
            ('Менеджер', 'Старикова Елена Павловна',
             'wpmrc3do@tutanota.com', 'RSbvHv'),
            ('Авторизированный клиент', 'Михайлюк Анна Вячеславовна',
             '5d4zbu@tutanota.com', 'rwVDh9'),
            ('Авторизированный клиент', 'Ситдикова Елена Анатольевна',
             'ptec8ym@yahoo.com', 'LdNyos'),
            ('Авторизированный клиент', 'Ворсин Петр Евгеньевич',
             '1qz4kw@mail.com', 'gynQMT'),
            ('Авторизированный клиент', 'Старикова Елена Павловна',
             '4np6se@mail.com', 'AtnDjr')
        ]
        self.cursor.executemany(
            '''INSERT INTO users (role, full_name, login, password)
               VALUES (?, ?, ?, ?)''', users
        )

        # Пункты выдачи
        pickup_points = [
            ('420151, г. Лесной, ул. Вишневая, 32',),
            ('125061, г. Лесной, ул. Подгорная, 8',),
            ('630370, г. Лесной, ул. Шоссейная, 24',),
            ('400562, г. Лесной, ул. Зеленая, 32',),
            ('614510, г. Лесной, ул. Маяковского, 47',),
            ('410542, г. Лесной, ул. Светлая, 46',),
            ('620839, г. Лесной, ул. Цветочная, 8',),
            ('443890, г. Лесной, ул. Коммунистическая, 1',),
            ('603379, г. Лесной, ул. Спортивная, 46',),
            ('603721, г. Лесной, ул. Гоголя, 41',),
            ('410172, г. Лесной, ул. Северная, 13',),
            ('614611, г. Лесной, ул. Молодежная, 50',),
            ('454311, г.Лесной, ул. Новая, 19',),
            ('660007, г.Лесной, ул. Октябрьская, 19',),
            ('603036, г. Лесной, ул. Садовая, 4',),
            ('394060, г.Лесной, ул. Фрунзе, 43',),
            ('410661, г. Лесной, ул. Школьная, 50',),
            ('625590, г. Лесной, ул. Коммунистическая, 20',),
            ('625683, г. Лесной, ул. 8 Марта',),
            ('450983, г.Лесной, ул. Комсомольская, 26',)
        ]
        self.cursor.executemany(
            'INSERT INTO pickup_points (address) VALUES (?)', pickup_points
        )

        # Товары
        products = [
            ('А112Т4', 'Ботинки', 'шт.', 4990, 1, 1, 1, 3, 6,
             'Женские Ботинки демисезонные kari', '1.jpg'),
            ('F635R4', 'Ботинки', 'шт.', 3244, 2, 2, 1, 2, 13,
             'Ботинки Marco Tozzi женские демисезонные', '2.jpg'),
            ('H782T5', 'Туфли', 'шт.', 4499, 1, 1, 2, 4, 5,
             'Туфли kari мужские классика', '3.jpg'),
            ('G783F5', 'Ботинки', 'шт.', 5900, 1, 3, 2, 2, 8,
             'Мужские ботинки Рос-Обувь', '4.jpg'),
            ('J384T6', 'Ботинки', 'шт.', 3800, 2, 4, 2, 2, 16,
             'Полуботинки мужские Rieker', '5.jpg'),
            ('D572U8', 'Кроссовки', 'шт.', 4100, 2, 3, 2, 3, 6,
             'Кроссовки мужские', '6.jpg'),
            ('F572H7', 'Туфли', 'шт.', 2700, 1, 2, 1, 2, 14,
             'Туфли Marco Tozzi женские', '7.jpg'),
            ('D329H3', 'Полуботинки', 'шт.', 1890, 2, 5, 1, 4, 4,
             'Полуботинки Alessio Nesca женские', '8.jpg'),
            ('B320R5', 'Туфли', 'шт.', 4300, 1, 4, 1, 2, 6,
             'Туфли Rieker женские', '9.jpg'),
            ('G432E4', 'Туфли', 'шт.', 2800, 1, 1, 1, 3, 15,
             'Туфли kari женские', '10.jpg'),
            ('S213E3', 'Полуботинки', 'шт.', 2156, 2, 6, 2, 3, 6,
             'Полуботинки мужские CROSBY', None),
            ('E482R4', 'Полуботинки', 'шт.', 1800, 1, 1, 1, 2, 14,
             'Полуботинки kari женские', None),
            ('S634B5', 'Кеды', 'шт.', 5500, 2, 6, 2, 3, 0,
             'Кеды мужские', None),
            ('K345R4', 'Полуботинки', 'шт.', 2100, 2, 6, 2, 2, 3,
             'Полуботинки мужские CROSBY', None),
            ('O754F4', 'Туфли', 'шт.', 5400, 2, 4, 1, 4, 18,
             'Туфли женские Rieker', None),
            ('G531F4', 'Ботинки', 'шт.', 6600, 1, 1, 1, 12, 9,
             'Ботинки женские зимние', None),
            ('J542F5', 'Тапочки', 'шт.', 500, 1, 1, 2, 13, 0,
             'Тапочки мужские', None),
            ('B431R5', 'Ботинки', 'шт.', 2700, 2, 4, 2, 2, 5,
             'Мужские ботинки', None),
            ('P764G4', 'Туфли', 'шт.', 6800, 1, 6, 1, 15, 15,
             'Туфли женские ARGO', None),
            ('C436G5', 'Ботинки', 'шт.', 10200, 1, 5, 1, 15, 9,
             'Ботинки женские ARGO', None),
            ('F427R5', 'Ботинки', 'шт.', 11800, 2, 4, 1, 15, 11,
             'Ботинки женские FRAU', None),
            ('N457T5', 'Полуботинки', 'шт.', 4600, 1, 6, 1, 3, 13,
             'Полуботинки женские', None),
            ('D364R4', 'Туфли', 'шт.', 12400, 1, 1, 1, 16, 5,
             'Туфли женские Luiza Belly', None),
            ('S326R5', 'Тапочки', 'шт.', 9900, 2, 6, 2, 17, 15,
             'Мужские кожаные тапочки', None),
            ('L754R4', 'Полуботинки', 'шт.', 1700, 1, 1, 1, 2, 7,
             'Полуботинки kari женские', None),
            ('M542T5', 'Кроссовки', 'шт.', 2800, 2, 4, 2, 18, 3,
             'Кроссовки мужские TOFA', None),
            ('D268G5', 'Туфли', 'шт.', 4399, 2, 4, 1, 3, 12,
             'Туфли Rieker женские', None),
            ('T324F5', 'Сапоги', 'шт.', 4699, 1, 6, 1, 2, 5,
             'Сапоги женские', None),
            ('K358H6', 'Тапочки', 'шт.', 599, 1, 4, 2, 20, 2,
             'Тапочки мужские', None),
            ('H535R5', 'Ботинки', 'шт.', 2300, 2, 4, 1, 2, 7,
             'Женские ботинки', None)
        ]
        self.cursor.executemany(
            '''INSERT INTO products (article, name, unit, price, supplier_id,
               manufacturer_id, category_id, discount, stock_quantity,
               description, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            products
        )

        # Заказы
        orders = [
            (7, 1, '2025-02-27', '2025-04-20', '901', 'Завершен'),
            (8, 11, '2022-09-28', '2025-04-21', '902', 'Завершен'),
            (9, 2, '2025-03-21', '2025-04-22', '903', 'Завершен'),
            (10, 11, '2025-02-20', '2025-04-23', '904', 'Завершен'),
            (7, 2, '2025-03-17', '2025-04-24', '905', 'Завершен'),
            (8, 15, '2025-03-01', '2025-04-25', '906', 'Завершен'),
            (9, 3, '2025-02-28', '2025-04-26', '907', 'Завершен'),
            (10, 19, '2025-03-31', '2025-04-27', '908', 'Новый'),
            (7, 5, '2025-04-02', '2025-04-28', '909', 'Новый'),
            (7, 19, '2025-04-03', '2025-04-29', '910', 'Новый')
        ]
        self.cursor.executemany(
            '''INSERT INTO orders (client_id, pickup_point_id, order_date,
               delivery_date, pickup_code, status) VALUES (?, ?, ?, ?, ?, ?)''',
            orders
        )

        # Товары в заказах
        order_items = [
            (1, 1, 2), (1, 2, 2),
            (2, 3, 1), (2, 4, 1),
            (3, 5, 10), (3, 6, 10),
            (4, 7, 5), (4, 8, 4),
            (5, 1, 2), (5, 2, 2),
            (6, 3, 1), (6, 4, 1),
            (7, 5, 10), (7, 6, 10),
            (8, 7, 5), (8, 8, 4),
            (9, 9, 5), (9, 10, 1),
            (10, 11, 5), (10, 12, 5)
        ]
        self.cursor.executemany(
            'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)',
            order_items
        )

        self.conn.commit()

    # === Методы для работы с пользователями ===

    def authenticate_user(self, login: str, password: str) -> Optional[Dict[str, Any]]:
        """Аутентификация пользователя."""
        self.cursor.execute(
            'SELECT * FROM users WHERE login = ? AND password = ?',
            (login, password)
        )
        row = self.cursor.fetchone()
        return dict(row) if row else None

    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Получить пользователя по ID."""
        self.cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        row = self.cursor.fetchone()
        return dict(row) if row else None

    def get_all_clients(self) -> List[Dict[str, Any]]:
        """Получить всех клиентов."""
        self.cursor.execute(
            "SELECT * FROM users WHERE role = 'Авторизированный клиент'"
        )
        return [dict(row) for row in self.cursor.fetchall()]

    # === Методы для работы со справочниками ===

    def get_all_categories(self) -> List[Dict[str, Any]]:
        """Получить все категории."""
        self.cursor.execute('SELECT * FROM categories')
        return [dict(row) for row in self.cursor.fetchall()]

    def get_all_manufacturers(self) -> List[Dict[str, Any]]:
        """Получить всех производителей."""
        self.cursor.execute('SELECT * FROM manufacturers')
        return [dict(row) for row in self.cursor.fetchall()]

    def get_all_suppliers(self) -> List[Dict[str, Any]]:
        """Получить всех поставщиков."""
        self.cursor.execute('SELECT * FROM suppliers')
        return [dict(row) for row in self.cursor.fetchall()]

    def get_all_pickup_points(self) -> List[Dict[str, Any]]:
        """Получить все пункты выдачи."""
        self.cursor.execute('SELECT * FROM pickup_points')
        return [dict(row) for row in self.cursor.fetchall()]

    # === Методы для работы с товарами ===

    def get_all_products(self) -> List[Dict[str, Any]]:
        """Получить все товары с расширенной информацией."""
        self.cursor.execute('''
            SELECT p.*,
                   s.name as supplier_name,
                   m.name as manufacturer_name,
                   c.name as category_name
            FROM products p
            JOIN suppliers s ON p.supplier_id = s.id
            JOIN manufacturers m ON p.manufacturer_id = m.id
            JOIN categories c ON p.category_id = c.id
            ORDER BY p.id
        ''')
        return [dict(row) for row in self.cursor.fetchall()]

    def get_product_by_id(self, product_id: int) -> Optional[Dict[str, Any]]:
        """Получить товар по ID."""
        self.cursor.execute(
            '''SELECT p.*, s.name as supplier_name, m.name as manufacturer_name,
                      c.name as category_name
               FROM products p
               JOIN suppliers s ON p.supplier_id = s.id
               JOIN manufacturers m ON p.manufacturer_id = m.id
               JOIN categories c ON p.category_id = c.id
               WHERE p.id = ?''',
            (product_id,)
        )
        row = self.cursor.fetchone()
        return dict(row) if row else None

    def add_product(self, product_data: Dict[str, Any]) -> int:
        """Добавить новый товар."""
        self.cursor.execute('''
            INSERT INTO products (article, name, unit, price, supplier_id,
                                manufacturer_id, category_id, discount,
                                stock_quantity, description, photo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            product_data['article'],
            product_data['name'],
            product_data['unit'],
            product_data['price'],
            product_data['supplier_id'],
            product_data['manufacturer_id'],
            product_data['category_id'],
            product_data['discount'],
            product_data['stock_quantity'],
            product_data['description'],
            product_data.get('photo')
        ))
        self.conn.commit()
        return self.cursor.lastrowid

    def update_product(self, product_id: int, product_data: Dict[str, Any]) -> bool:
        """Обновить товар."""
        self.cursor.execute('''
            UPDATE products SET
                article = ?, name = ?, unit = ?, price = ?,
                supplier_id = ?, manufacturer_id = ?, category_id = ?,
                discount = ?, stock_quantity = ?, description = ?, photo = ?
            WHERE id = ?
        ''', (
            product_data['article'],
            product_data['name'],
            product_data['unit'],
            product_data['price'],
            product_data['supplier_id'],
            product_data['manufacturer_id'],
            product_data['category_id'],
            product_data['discount'],
            product_data['stock_quantity'],
            product_data['description'],
            product_data.get('photo'),
            product_id
        ))
        self.conn.commit()
        return self.cursor.rowcount > 0

    def delete_product(self, product_id: int) -> bool:
        """Удалить товар."""
        # Проверяем, есть ли товар в заказах
        self.cursor.execute(
            'SELECT COUNT(*) FROM order_items WHERE product_id = ?',
            (product_id,)
        )
        if self.cursor.fetchone()[0] > 0:
            return False

        self.cursor.execute('DELETE FROM products WHERE id = ?', (product_id,))
        self.conn.commit()
        return self.cursor.rowcount > 0

    def can_delete_product(self, product_id: int) -> bool:
        """Проверить, можно ли удалить товар."""
        self.cursor.execute(
            'SELECT COUNT(*) FROM order_items WHERE product_id = ?',
            (product_id,)
        )
        return self.cursor.fetchone()[0] == 0

    # === Методы для работы с заказами ===

    def get_all_orders(self) -> List[Dict[str, Any]]:
        """Получить все заказы с расширенной информацией."""
        self.cursor.execute('''
            SELECT o.*,
                   u.full_name as client_name,
                   pp.address as pickup_point_address
            FROM orders o
            JOIN users u ON o.client_id = u.id
            JOIN pickup_points pp ON o.pickup_point_id = pp.id
            ORDER BY o.id
        ''')
        orders = [dict(row) for row in self.cursor.fetchall()]

        # Добавляем товары и сумму для каждого заказа
        for order in orders:
            order['items'] = self.get_order_items(order['id'])
            order['total_amount'] = self._calculate_order_total(order['items'])

        return orders

    def get_order_by_id(self, order_id: int) -> Optional[Dict[str, Any]]:
        """Получить заказ по ID."""
        self.cursor.execute('''
            SELECT o.*,
                   u.full_name as client_name,
                   pp.address as pickup_point_address
            FROM orders o
            JOIN users u ON o.client_id = u.id
            JOIN pickup_points pp ON o.pickup_point_id = pp.id
            WHERE o.id = ?
        ''', (order_id,))
        row = self.cursor.fetchone()
        if row:
            order = dict(row)
            order['items'] = self.get_order_items(order_id)
            order['total_amount'] = self._calculate_order_total(order['items'])
            return order
        return None

    def get_order_items(self, order_id: int) -> List[Dict[str, Any]]:
        """Получить товары заказа."""
        self.cursor.execute('''
            SELECT oi.*, p.name as product_name, p.article,
                   p.price, p.discount,
                   ROUND(p.price * (1 - p.discount / 100.0), 2) as final_price
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        ''', (order_id,))
        return [dict(row) for row in self.cursor.fetchall()]

    def _calculate_order_total(self, items: List[Dict[str, Any]]) -> float:
        """Рассчитать общую сумму заказа."""
        return sum(item['final_price'] * item['quantity'] for item in items)

    def add_order(self, order_data: Dict[str, Any]) -> int:
        """Добавить новый заказ."""
        self.cursor.execute('''
            INSERT INTO orders (client_id, pickup_point_id, order_date,
                              delivery_date, pickup_code, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            order_data['client_id'],
            order_data['pickup_point_id'],
            order_data['order_date'],
            order_data['delivery_date'],
            order_data['pickup_code'],
            order_data.get('status', 'Новый')
        ))
        order_id = self.cursor.lastrowid

        # Добавляем товары заказа
        for item in order_data['items']:
            self.cursor.execute('''
                INSERT INTO order_items (order_id, product_id, quantity)
                VALUES (?, ?, ?)
            ''', (order_id, item['product_id'], item['quantity']))

        self.conn.commit()
        return order_id

    def update_order(self, order_id: int, order_data: Dict[str, Any]) -> bool:
        """Обновить заказ."""
        self.cursor.execute('''
            UPDATE orders SET
                client_id = ?, pickup_point_id = ?, order_date = ?,
                delivery_date = ?, pickup_code = ?, status = ?
            WHERE id = ?
        ''', (
            order_data['client_id'],
            order_data['pickup_point_id'],
            order_data['order_date'],
            order_data['delivery_date'],
            order_data['pickup_code'],
            order_data['status'],
            order_id
        ))

        # Удаляем старые товары и добавляем новые
        self.cursor.execute('DELETE FROM order_items WHERE order_id = ?', (order_id,))
        for item in order_data['items']:
            self.cursor.execute('''
                INSERT INTO order_items (order_id, product_id, quantity)
                VALUES (?, ?, ?)
            ''', (order_id, item['product_id'], item['quantity']))

        self.conn.commit()
        return self.cursor.rowcount > 0

    def delete_order(self, order_id: int) -> bool:
        """Удалить заказ."""
        self.cursor.execute('DELETE FROM orders WHERE id = ?', (order_id,))
        self.conn.commit()
        return self.cursor.rowcount > 0

    def close(self) -> None:
        """Закрыть соединение с БД."""
        self.conn.close()


# Глобальный экземпляр базы данных
db = Database()
