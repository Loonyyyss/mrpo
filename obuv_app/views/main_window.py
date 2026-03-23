"""
Главное окно приложения со списком товаров.
"""

import tkinter as tk
from tkinter import ttk, messagebox
from database.db import db
from utils.constants import COLORS, FONT_FAMILY, FONT_SIZE_NORMAL
from views.product_dialog import ProductDialog
from views.orders_window import OrdersWindow


class MainWindow:
    """Главное окно приложения."""

    def __init__(self, root: tk.Tk, auth_manager):
        """Инициализация главного окна."""
        self.root = root
        self.auth = auth_manager
        self.products = []
        self.sort_ascending = True

        # Настройка окна
        self.root.title('ООО "Обувь" - Список товаров')
        self.root.geometry('1200x700')
        self.root.configure(bg=COLORS['primary_bg'])

        # Центрируем окно
        self._center_window()

        # Создаем виджеты
        self._create_header()
        self._create_filters()
        self._create_product_table()
        self._load_products()

    def _center_window(self):
        """Центрирование окна."""
        self.root.update_idletasks()
        width = 1200
        height = 700
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')

    def _create_header(self):
        """Создание шапки."""
        header = tk.Frame(self.root, bg=COLORS['secondary_bg'], height=80)
        header.pack(fill='x', padx=10, pady=10)
        header.pack_propagate(False)

        # Логотип и название
        left_frame = tk.Frame(header, bg=COLORS['secondary_bg'])
        left_frame.pack(side='left', padx=10, pady=10)

        logo_label = tk.Label(
            left_frame,
            text='👟',
            font=('Arial', 32),
            bg=COLORS['secondary_bg']
        )
        logo_label.pack(side='left', padx=(0, 10))

        title_frame = tk.Frame(left_frame, bg=COLORS['secondary_bg'])
        title_frame.pack(side='left')

        title = tk.Label(
            title_frame,
            text='ООО "Обувь" - Список товаров',
            font=(FONT_FAMILY, 16, 'bold'),
            bg=COLORS['secondary_bg']
        )
        title.pack(anchor='w')

        # Информация о пользователе
        user_text = 'Гость' if self.auth.is_guest_user() else self.auth.get_current_user()['full_name']
        role_text = f" ({self.auth.get_user_role()})"
        user_label = tk.Label(
            title_frame,
            text=user_text + role_text,
            font=(FONT_FAMILY, 10),
            bg=COLORS['secondary_bg']
        )
        user_label.pack(anchor='w')

        # Кнопки справа
        right_frame = tk.Frame(header, bg=COLORS['secondary_bg'])
        right_frame.pack(side='right', padx=10, pady=10)

        if self.auth.can_view_orders():
            orders_btn = tk.Button(
                right_frame,
                text='Заказы',
                font=(FONT_FAMILY, 11),
                bg=COLORS['primary_bg'],
                command=self._open_orders
            )
            orders_btn.pack(side='left', padx=5)

        logout_btn = tk.Button(
            right_frame,
            text='Выйти',
            font=(FONT_FAMILY, 11),
            bg=COLORS['primary_bg'],
            command=self._logout
        )
        logout_btn.pack(side='left', padx=5)

    def _create_filters(self):
        """Создание панели фильтров."""
        if not self.auth.can_filter_products():
            # Для гостей и клиентов - только кнопка добавления (если админ)
            if self.auth.can_edit_products():
                btn_frame = tk.Frame(self.root, bg=COLORS['primary_bg'])
                btn_frame.pack(fill='x', padx=10, pady=5)

                add_btn = tk.Button(
                    btn_frame,
                    text='+ Добавить товар',
                    font=(FONT_FAMILY, 11),
                    bg=COLORS['accent'],
                    command=self._add_product
                )
                add_btn.pack(side='right')
            return

        # Для менеджеров и администраторов - полные фильтры
        filter_frame = tk.Frame(self.root, bg=COLORS['primary_bg'])
        filter_frame.pack(fill='x', padx=10, pady=5)

        # Поиск
        search_label = tk.Label(
            filter_frame,
            text='Поиск:',
            font=(FONT_FAMILY, 11),
            bg=COLORS['primary_bg']
        )
        search_label.pack(side='left', padx=(0, 5))

        self.search_entry = tk.Entry(
            filter_frame,
            font=(FONT_FAMILY, 11),
            width=30
        )
        self.search_entry.pack(side='left', padx=5)
        self.search_entry.bind('<KeyRelease>', lambda e: self._apply_filters())

        # Фильтр по поставщику
        supplier_label = tk.Label(
            filter_frame,
            text='Поставщик:',
            font=(FONT_FAMILY, 11),
            bg=COLORS['primary_bg']
        )
        supplier_label.pack(side='left', padx=(20, 5))

        suppliers = db.get_all_suppliers()
        supplier_options = [('Все поставщики', None)] + [(s['name'], s['id']) for s in suppliers]

        self.supplier_var = tk.StringVar(value='Все поставщики')
        self.supplier_combo = ttk.Combobox(
            filter_frame,
            textvariable=self.supplier_var,
            values=[s[0] for s in supplier_options],
            font=(FONT_FAMILY, 11),
            width=20,
            state='readonly'
        )
        self.supplier_combo.pack(side='left', padx=5)
        self.supplier_combo.bind('<<ComboboxSelected>>', lambda e: self._apply_filters())

        self.supplier_options = supplier_options

        # Сортировка
        sort_btn = tk.Button(
            filter_frame,
            text='Сортировать по количеству ↑',
            font=(FONT_FAMILY, 11),
            bg=COLORS['primary_bg'],
            command=self._toggle_sort
        )
        sort_btn.pack(side='left', padx=20)
        self.sort_btn = sort_btn

        # Кнопка добавления
        if self.auth.can_edit_products():
            add_btn = tk.Button(
                filter_frame,
                text='+ Добавить товар',
                font=(FONT_FAMILY, 11),
                bg=COLORS['accent'],
                command=self._add_product
            )
            add_btn.pack(side='right')

    def _create_product_table(self):
        """Создание таблицы товаров."""
        # Фрейм для таблицы
        table_frame = tk.Frame(self.root, bg=COLORS['primary_bg'])
        table_frame.pack(fill='both', expand=True, padx=10, pady=10)

        # Создаем Treeview
        columns = (
            'id', 'photo', 'article', 'name', 'category', 'manufacturer',
            'supplier', 'price', 'unit', 'stock', 'discount'
        )

        self.tree = ttk.Treeview(
            table_frame,
            columns=columns,
            show='headings',
            height=20
        )

        # Определяем заголовки и ширину колонок
        column_config = {
            'id': ('ID', 40),
            'photo': ('Фото', 60),
            'article': ('Артикул', 80),
            'name': ('Наименование', 150),
            'category': ('Категория', 100),
            'manufacturer': ('Производитель', 100),
            'supplier': ('Поставщик', 100),
            'price': ('Цена', 100),
            'unit': ('Ед.', 50),
            'stock': ('На складе', 70),
            'discount': ('Скидка', 60)
        }

        for col, (heading, width) in column_config.items():
            self.tree.heading(col, text=heading)
            self.tree.column(col, width=width, anchor='center')

        # Скроллбар
        scrollbar = ttk.Scrollbar(table_frame, orient='vertical', command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)

        self.tree.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')

        # Обработка двойного клика
        self.tree.bind('<Double-1>', self._on_product_double_click)

        # Контекстное меню (для администратора)
        if self.auth.can_edit_products():
            self.context_menu = tk.Menu(self.root, tearoff=0)
            self.context_menu.add_command(label='Редактировать', command=self._edit_selected_product)
            self.context_menu.add_command(label='Удалить', command=self._delete_selected_product)
            self.tree.bind('<Button-3>', self._show_context_menu)

    def _load_products(self):
        """Загрузка товаров из БД."""
        self.products = db.get_all_products()
        self._apply_filters()

    def _apply_filters(self):
        """Применение фильтров."""
        filtered = self.products.copy()

        # Фильтр по поиску
        if hasattr(self, 'search_entry'):
            search = self.search_entry.get().lower()
            if search:
                filtered = [
                    p for p in filtered
                    if (search in p['article'].lower() or
                        search in p['name'].lower() or
                        search in p['description'].lower() or
                        search in p['supplier_name'].lower() or
                        search in p['manufacturer_name'].lower() or
                        search in p['category_name'].lower())
                ]

        # Фильтр по поставщику
        if hasattr(self, 'supplier_var'):
            supplier_name = self.supplier_var.get()
            if supplier_name != 'Все поставщики':
                for sup_name, sup_id in self.supplier_options:
                    if sup_name == supplier_name and sup_id:
                        filtered = [p for p in filtered if p['supplier_id'] == sup_id]
                        break

        # Сортировка
        if hasattr(self, 'sort_ascending'):
            filtered.sort(
                key=lambda x: x['stock_quantity'],
                reverse=not self.sort_ascending
            )

        self._populate_table(filtered)

    def _populate_table(self, products):
        """Заполнение таблицы данными."""
        # Очищаем таблицу
        for item in self.tree.get_children():
            self.tree.delete(item)

        # Заполняем данными
        for product in products:
            # Рассчитываем итоговую цену
            final_price = product['price'] * (1 - product['discount'] / 100)

            # Форматируем цену
            if product['discount'] > 0:
                price_text = f"{product['price']:.0f} → {final_price:.0f}"
            else:
                price_text = f"{product['price']:.0f}"

            # Форматируем скидку
            discount_text = f"{product['discount']}%" if product['discount'] > 0 else ""

            # Фото (заглушка)
            photo_text = "📷" if product['photo'] else "❌"

            values = (
                product['id'],
                photo_text,
                product['article'],
                product['name'],
                product['category_name'],
                product['manufacturer_name'],
                product['supplier_name'],
                price_text,
                product['unit'],
                product['stock_quantity'],
                discount_text
            )

            # Определяем тег для подсветки
            tag = ''
            if product['stock_quantity'] == 0:
                tag = 'out_of_stock'
            elif product['discount'] > 15:
                tag = 'high_discount'
            elif product['discount'] > 0:
                tag = 'has_discount'

            item_id = self.tree.insert('', 'end', values=values, tags=(tag,))

        # Настраиваем цвета
        self.tree.tag_configure('out_of_stock', background=COLORS['out_of_stock'])
        self.tree.tag_configure('high_discount', background=COLORS['high_discount'], foreground='white')
        self.tree.tag_configure('has_discount', foreground='red')

    def _toggle_sort(self):
        """Переключение направления сортировки."""
        self.sort_ascending = not self.sort_ascending
        text = 'Сортировать по количеству ↑' if self.sort_ascending else 'Сортировать по количеству ↓'
        self.sort_btn.config(text=text)
        self._apply_filters()

    def _on_product_double_click(self, event):
        """Обработка двойного клика по товару."""
        if not self.auth.can_edit_products():
            return

        selection = self.tree.selection()
        if selection:
            item = self.tree.item(selection[0])
            product_id = item['values'][0]
            self._edit_product(product_id)

    def _show_context_menu(self, event):
        """Показать контекстное меню."""
        item = self.tree.identify_row(event.y)
        if item:
            self.tree.selection_set(item)
            self.context_menu.post(event.x_root, event.y_root)

    def _get_selected_product_id(self):
        """Получить ID выбранного товара."""
        selection = self.tree.selection()
        if selection:
            return self.tree.item(selection[0])['values'][0]
        return None

    def _add_product(self):
        """Добавить новый товар."""
        dialog = ProductDialog(self.root, None, self._load_products)
        dialog.show()

    def _edit_product(self, product_id):
        """Редактировать товар."""
        dialog = ProductDialog(self.root, product_id, self._load_products)
        dialog.show()

    def _edit_selected_product(self):
        """Редактировать выбранный товар."""
        product_id = self._get_selected_product_id()
        if product_id:
            self._edit_product(product_id)

    def _delete_selected_product(self):
        """Удалить выбранный товар."""
        product_id = self._get_selected_product_id()
        if not product_id:
            return

        # Проверяем, можно ли удалить
        if not db.can_delete_product(product_id):
            messagebox.showerror(
                'Ошибка',
                'Невозможно удалить товар, который присутствует в заказе',
                parent=self.root
            )
            return

        # Подтверждение удаления
        if messagebox.askyesno(
            'Подтверждение',
            'Вы уверены, что хотите удалить этот товар?',
            parent=self.root
        ):
            if db.delete_product(product_id):
                self._load_products()
                messagebox.showinfo('Успех', 'Товар удален', parent=self.root)
            else:
                messagebox.showerror('Ошибка', 'Не удалось удалить товар', parent=self.root)

    def _open_orders(self):
        """Открыть окно заказов."""
        orders_window = tk.Toplevel(self.root)
        orders_window.title('ООО "Обувь" - Заказы')
        OrdersWindow(orders_window, self.auth)

    def _logout(self):
        """Выход из системы."""
        if messagebox.askyesno('Подтверждение', 'Вы действительно хотите выйти?', parent=self.root):
            self.root.destroy()
            # Перезапускаем приложение
            import main
            main.main()
