"""
Окно списка заказов.
"""

import tkinter as tk
from tkinter import ttk, messagebox
from database.db import db
from utils.constants import COLORS, FONT_FAMILY
from views.order_dialog import OrderDialog


class OrdersWindow:
    """Окно списка заказов."""

    def __init__(self, root, auth):
        """Инициализация окна заказов."""
        self.root = root
        self.auth = auth
        self.orders = []

        # Настройка окна
        self.root.geometry('1000x600')
        self.root.configure(bg=COLORS['primary_bg'])

        # Центрируем окно
        self._center_window()

        # Создаем виджеты
        self._create_header()
        self._create_filters()
        self._create_orders_table()
        self._load_orders()

    def _center_window(self):
        """Центрирование окна."""
        self.root.update_idletasks()
        width = 1000
        height = 600
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')

    def _create_header(self):
        """Создание шапки."""
        header = tk.Frame(self.root, bg=COLORS['secondary_bg'], height=60)
        header.pack(fill='x', padx=10, pady=10)
        header.pack_propagate(False)

        # Заголовок
        title = tk.Label(
            header,
            text='ООО "Обувь" - Список заказов',
            font=(FONT_FAMILY, 16, 'bold'),
            bg=COLORS['secondary_bg']
        )
        title.pack(side='left', padx=10, pady=10)

        # Кнопка назад
        back_btn = tk.Button(
            header,
            text='← Назад к товарам',
            font=(FONT_FAMILY, 11),
            bg=COLORS['primary_bg'],
            command=self.root.destroy
        )
        back_btn.pack(side='right', padx=10, pady=10)

    def _create_filters(self):
        """Создание панели фильтров."""
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

        # Кнопка добавления (только для администратора)
        if self.auth.is_admin():
            add_btn = tk.Button(
                filter_frame,
                text='+ Добавить заказ',
                font=(FONT_FAMILY, 11),
                bg=COLORS['accent'],
                command=self._add_order
            )
            add_btn.pack(side='right')

    def _create_orders_table(self):
        """Создание таблицы заказов."""
        table_frame = tk.Frame(self.root, bg=COLORS['primary_bg'])
        table_frame.pack(fill='both', expand=True, padx=10, pady=10)

        columns = ('id', 'client', 'address', 'order_date', 'delivery_date', 'code', 'total', 'status')

        self.tree = ttk.Treeview(table_frame, columns=columns, show='headings', height=20)

        column_config = {
            'id': ('№ заказа', 70),
            'client': ('Клиент', 150),
            'address': ('Адрес пункта выдачи', 250),
            'order_date': ('Дата заказа', 100),
            'delivery_date': ('Дата доставки', 100),
            'code': ('Код', 70),
            'total': ('Сумма', 80),
            'status': ('Статус', 80)
        }

        for col, (heading, width) in column_config.items():
            self.tree.heading(col, text=heading)
            self.tree.column(col, width=width, anchor='center')

        scrollbar = ttk.Scrollbar(table_frame, orient='vertical', command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)

        self.tree.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')

        # Обработка двойного клика
        self.tree.bind('<Double-1>', self._on_order_double_click)

        # Контекстное меню (для администратора)
        if self.auth.is_admin():
            self.context_menu = tk.Menu(self.root, tearoff=0)
            self.context_menu.add_command(label='Редактировать', command=self._edit_selected_order)
            self.context_menu.add_command(label='Удалить', command=self._delete_selected_order)
            self.tree.bind('<Button-3>', self._show_context_menu)

    def _load_orders(self):
        """Загрузка заказов из БД."""
        self.orders = db.get_all_orders()
        self._apply_filters()

    def _apply_filters(self):
        """Применение фильтров."""
        filtered = self.orders.copy()

        search = self.search_entry.get().lower()
        if search:
            filtered = [
                o for o in filtered
                if (search in str(o['id']) or
                    search in o['client_name'].lower() or
                    search in o['pickup_point_address'].lower() or
                    search in o['pickup_code'].lower() or
                    search in o['status'].lower())
            ]

        self._populate_table(filtered)

    def _populate_table(self, orders):
        """Заполнение таблицы данными."""
        for item in self.tree.get_children():
            self.tree.delete(item)

        for order in orders:
            values = (
                order['id'],
                order['client_name'],
                order['pickup_point_address'],
                order['order_date'],
                order['delivery_date'],
                order['pickup_code'],
                f"{order['total_amount']:.0f} ₽",
                order['status']
            )

            tag = 'new' if order['status'] == 'Новый' else 'completed'
            self.tree.insert('', 'end', values=values, tags=(tag,))

        self.tree.tag_configure('new', background='#E3F2FD')
        self.tree.tag_configure('completed', background='#E8F5E9')

    def _on_order_double_click(self, event):
        """Обработка двойного клика по заказу."""
        if not self.auth.is_admin():
            return

        selection = self.tree.selection()
        if selection:
            item = self.tree.item(selection[0])
            order_id = item['values'][0]
            self._edit_order(order_id)

    def _show_context_menu(self, event):
        """Показать контекстное меню."""
        item = self.tree.identify_row(event.y)
        if item:
            self.tree.selection_set(item)
            self.context_menu.post(event.x_root, event.y_root)

    def _get_selected_order_id(self):
        """Получить ID выбранного заказа."""
        selection = self.tree.selection()
        if selection:
            return self.tree.item(selection[0])['values'][0]
        return None

    def _add_order(self):
        """Добавить новый заказ."""
        dialog = OrderDialog(self.root, None, self._load_orders)
        dialog.show()

    def _edit_order(self, order_id):
        """Редактировать заказ."""
        dialog = OrderDialog(self.root, order_id, self._load_orders)
        dialog.show()

    def _edit_selected_order(self):
        """Редактировать выбранный заказ."""
        order_id = self._get_selected_order_id()
        if order_id:
            self._edit_order(order_id)

    def _delete_selected_order(self):
        """Удалить выбранный заказ."""
        order_id = self._get_selected_order_id()
        if not order_id:
            return

        if messagebox.askyesno(
            'Подтверждение',
            f'Вы уверены, что хотите удалить заказ №{order_id}?',
            parent=self.root
        ):
            if db.delete_order(order_id):
                self._load_orders()
                messagebox.showinfo('Успех', 'Заказ удален', parent=self.root)
            else:
                messagebox.showerror('Ошибка', 'Не удалось удалить заказ', parent=self.root)
