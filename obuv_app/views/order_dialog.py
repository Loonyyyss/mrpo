"""
Диалог добавления/редактирования заказа.
"""

import tkinter as tk
from tkinter import ttk, messagebox
import random
from database.db import db
from utils.constants import COLORS, FONT_FAMILY, ORDER_STATUSES


class OrderDialog:
    """Диалог для работы с заказом."""

    def __init__(self, parent, order_id, on_save):
        """Инициализация диалога."""
        self.parent = parent
        self.order_id = order_id
        self.on_save = on_save
        self.is_editing = order_id is not None
        self.order_items = []

        # Создаем окно
        self.dialog = tk.Toplevel(parent)
        self.dialog.title('Редактирование заказа' if self.is_editing else 'Добавление заказа')
        self.dialog.geometry('700x700')
        self.dialog.configure(bg=COLORS['primary_bg'])
        self.dialog.transient(parent)
        self.dialog.grab_set()

        # Центрируем окно
        self._center_window()

        # Загружаем справочники
        self.clients = db.get_all_clients()
        self.pickup_points = db.get_all_pickup_points()
        self.products = db.get_all_products()

        # Создаем виджеты
        self._create_widgets()

        # Если редактирование - загружаем данные
        if self.is_editing:
            self._load_order_data()

    def _center_window(self):
        """Центрирование окна."""
        self.dialog.update_idletasks()
        width = 700
        height = 700
        x = (self.dialog.winfo_screenwidth() // 2) - (width // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (height // 2)
        self.dialog.geometry(f'{width}x{height}+{x}+{y}')

    def _create_widgets(self):
        """Создание виджетов формы."""
        canvas = tk.Canvas(self.dialog, bg=COLORS['primary_bg'])
        scrollbar = ttk.Scrollbar(self.dialog, orient='vertical', command=canvas.yview)
        self.main_frame = tk.Frame(canvas, bg=COLORS['primary_bg'])

        self.main_frame.bind(
            '<Configure>',
            lambda e: canvas.configure(scrollregion=canvas.bbox('all'))
        )

        canvas.create_window((0, 0), window=self.main_frame, anchor='nw', width=680)
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side='left', fill='both', expand=True, padx=10, pady=10)
        scrollbar.pack(side='right', fill='y')

        # Заголовок
        title = tk.Label(
            self.main_frame,
            text='Редактирование заказа' if self.is_editing else 'Добавление заказа',
            font=(FONT_FAMILY, 16, 'bold'),
            bg=COLORS['primary_bg']
        )
        title.pack(pady=(0, 20))

        # ID (только для чтения при редактировании)
        if self.is_editing:
            self._create_readonly_field('№ заказа:', 'id_var', str(self.order_id))

        # Клиент
        self._create_combobox('Клиент:', 'client_var', [c['full_name'] for c in self.clients])

        # Пункт выдачи
        self._create_combobox('Пункт выдачи:', 'pickup_var', [p['address'] for p in self.pickup_points])

        # Дата заказа
        self._create_field('Дата заказа:', 'order_date_var')

        # Дата доставки
        self._create_field('Дата доставки:', 'delivery_date_var')

        # Код получения
        code_frame = tk.Frame(self.main_frame, bg=COLORS['primary_bg'])
        code_frame.pack(fill='x', pady=5, padx=20)

        code_label = tk.Label(code_frame, text='Код получения:', font=(FONT_FAMILY, 11), bg=COLORS['primary_bg'], width=15, anchor='w')
        code_label.pack(side='left')

        self.code_var = tk.StringVar()
        code_entry = tk.Entry(code_frame, font=(FONT_FAMILY, 11), textvariable=self.code_var, width=20)
        code_entry.pack(side='left', padx=5)

        gen_btn = tk.Button(
            code_frame,
            text='Сгенерировать',
            font=(FONT_FAMILY, 10),
            command=self._generate_code
        )
        gen_btn.pack(side='left', padx=5)

        # Статус
        self._create_combobox('Статус:', 'status_var', ORDER_STATUSES)
        self.status_var.set('Новый')

        # Разделитель
        separator = tk.Frame(self.main_frame, bg='gray', height=2)
        separator.pack(fill='x', padx=20, pady=15)

        # Товары в заказе
        items_label = tk.Label(
            self.main_frame,
            text='Товары в заказе',
            font=(FONT_FAMILY, 14, 'bold'),
            bg=COLORS['primary_bg']
        )
        items_label.pack(pady=(0, 10))

        # Добавление товара
        self._create_add_item_section()

        # Таблица товаров заказа
        self._create_items_table()

        # Итоговая сумма
        self.total_label = tk.Label(
            self.main_frame,
            text='Итого: 0 ₽',
            font=(FONT_FAMILY, 14, 'bold'),
            bg=COLORS['primary_bg'],
            fg=COLORS['success']
        )
        self.total_label.pack(pady=10)

        # Кнопки
        btn_frame = tk.Frame(self.main_frame, bg=COLORS['primary_bg'])
        btn_frame.pack(fill='x', pady=20)

        cancel_btn = tk.Button(
            btn_frame,
            text='Отмена',
            font=(FONT_FAMILY, 12),
            bg=COLORS['primary_bg'],
            width=15,
            command=self.dialog.destroy
        )
        cancel_btn.pack(side='left', padx=10)

        save_btn = tk.Button(
            btn_frame,
            text='Сохранить',
            font=(FONT_FAMILY, 12, 'bold'),
            bg=COLORS['accent'],
            width=15,
            command=self._save
        )
        save_btn.pack(side='right', padx=10)

    def _create_readonly_field(self, label, var_name, value):
        """Создать поле только для чтения."""
        frame = tk.Frame(self.main_frame, bg=COLORS['primary_bg'])
        frame.pack(fill='x', pady=5, padx=20)

        lbl = tk.Label(frame, text=label, font=(FONT_FAMILY, 11), bg=COLORS['primary_bg'], width=15, anchor='w')
        lbl.pack(side='left')

        var = tk.StringVar(value=value)
        setattr(self, var_name, var)

        entry = tk.Entry(frame, font=(FONT_FAMILY, 11), textvariable=var, state='readonly', width=40)
        entry.pack(side='left', padx=5)

    def _create_field(self, label, var_name, default=''):
        """Создать текстовое поле."""
        frame = tk.Frame(self.main_frame, bg=COLORS['primary_bg'])
        frame.pack(fill='x', pady=5, padx=20)

        lbl = tk.Label(frame, text=label, font=(FONT_FAMILY, 11), bg=COLORS['primary_bg'], width=15, anchor='w')
        lbl.pack(side='left')

        var = tk.StringVar(value=default)
        setattr(self, var_name, var)

        entry = tk.Entry(frame, font=(FONT_FAMILY, 11), textvariable=var, width=40)
        entry.pack(side='left', padx=5)

    def _create_combobox(self, label, var_name, values):
        """Создать выпадающий список."""
        frame = tk.Frame(self.main_frame, bg=COLORS['primary_bg'])
        frame.pack(fill='x', pady=5, padx=20)

        lbl = tk.Label(frame, text=label, font=(FONT_FAMILY, 11), bg=COLORS['primary_bg'], width=15, anchor='w')
        lbl.pack(side='left')

        var = tk.StringVar()
        setattr(self, var_name, var)

        combo = ttk.Combobox(frame, textvariable=var, values=values, font=(FONT_FAMILY, 11), width=38, state='readonly')
        combo.pack(side='left', padx=5)
        if values:
            combo.current(0)

    def _create_add_item_section(self):
        """Создать секцию добавления товара."""
        frame = tk.Frame(self.main_frame, bg=COLORS['primary_bg'])
        frame.pack(fill='x', pady=5, padx=20)

        # Товар
        product_label = tk.Label(frame, text='Товар:', font=(FONT_FAMILY, 11), bg=COLORS['primary_bg'])
        product_label.pack(side='left')

        self.product_var = tk.StringVar()
        product_names = [f"{p['name']} ({p['article']}) - {p['price']:.0f} ₽" for p in self.products]
        self.product_combo = ttk.Combobox(frame, textvariable=self.product_var, values=product_names, font=(FONT_FAMILY, 11), width=35, state='readonly')
        self.product_combo.pack(side='left', padx=5)

        # Количество
        qty_label = tk.Label(frame, text='Кол-во:', font=(FONT_FAMILY, 11), bg=COLORS['primary_bg'])
        qty_label.pack(side='left', padx=(10, 5))

        self.qty_var = tk.StringVar(value='1')
        qty_entry = tk.Entry(frame, font=(FONT_FAMILY, 11), textvariable=self.qty_var, width=5)
        qty_entry.pack(side='left')

        # Кнопка добавить
        add_btn = tk.Button(
            frame,
            text='+ Добавить',
            font=(FONT_FAMILY, 10),
            bg=COLORS['accent'],
            command=self._add_item
        )
        add_btn.pack(side='left', padx=10)

    def _create_items_table(self):
        """Создать таблицу товаров заказа."""
        frame = tk.Frame(self.main_frame, bg=COLORS['primary_bg'])
        frame.pack(fill='both', expand=True, padx=20, pady=10)

        columns = ('product', 'qty', 'price', 'total')
        self.items_tree = ttk.Treeview(frame, columns=columns, show='headings', height=8)

        self.items_tree.heading('product', text='Товар')
        self.items_tree.heading('qty', text='Кол-во')
        self.items_tree.heading('price', text='Цена')
        self.items_tree.heading('total', text='Сумма')

        self.items_tree.column('product', width=250)
        self.items_tree.column('qty', width=60, anchor='center')
        self.items_tree.column('price', width=80, anchor='center')
        self.items_tree.column('total', width=80, anchor='center')

        scrollbar = ttk.Scrollbar(frame, orient='vertical', command=self.items_tree.yview)
        self.items_tree.configure(yscrollcommand=scrollbar.set)

        self.items_tree.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')

        # Кнопка удалить
        del_btn = tk.Button(
            self.main_frame,
            text='Удалить выбранный товар',
            font=(FONT_FAMILY, 10),
            bg=COLORS['price_old'],
            fg='white',
            command=self._remove_item
        )
        del_btn.pack(pady=5)

    def _generate_code(self):
        """Сгенерировать код получения."""
        code = str(random.randint(100, 999))
        self.code_var.set(code)

    def _get_product_id_by_name(self, name):
        """Получить ID товара по названию."""
        for p in self.products:
            display_name = f"{p['name']} ({p['article']}) - {p['price']:.0f} ₽"
            if display_name == name:
                return p['id'], p
        return None, None

    def _add_item(self):
        """Добавить товар в заказ."""
        product_name = self.product_var.get()
        if not product_name:
            messagebox.showerror('Ошибка', 'Выберите товар', parent=self.dialog)
            return

        try:
            qty = int(self.qty_var.get())
            if qty <= 0:
                raise ValueError
        except ValueError:
            messagebox.showerror('Ошибка', 'Количество должно быть положительным числом', parent=self.dialog)
            return

        product_id, product = self._get_product_id_by_name(product_name)
        if not product_id:
            return

        # Проверяем, есть ли уже такой товар
        for item in self.order_items:
            if item['product_id'] == product_id:
                item['quantity'] += qty
                self._update_items_table()
                return

        # Добавляем новый товар
        final_price = product['price'] * (1 - product['discount'] / 100)
        self.order_items.append({
            'product_id': product_id,
            'product_name': product['name'],
            'quantity': qty,
            'price': final_price
        })

        self._update_items_table()

    def _remove_item(self):
        """Удалить товар из заказа."""
        selection = self.items_tree.selection()
        if not selection:
            return

        item_idx = self.items_tree.index(selection[0])
        if 0 <= item_idx < len(self.order_items):
            del self.order_items[item_idx]
            self._update_items_table()

    def _update_items_table(self):
        """Обновить таблицу товаров."""
        for item in self.items_tree.get_children():
            self.items_tree.delete(item)

        total = 0
        for item in self.order_items:
            item_total = item['price'] * item['quantity']
            total += item_total

            self.items_tree.insert('', 'end', values=(
                item['product_name'],
                item['quantity'],
                f"{item['price']:.0f} ₽",
                f"{item_total:.0f} ₽"
            ))

        self.total_label.config(text=f'Итого: {total:.0f} ₽')

    def _get_client_id(self):
        """Получить ID клиента."""
        name = self.client_var.get()
        for c in self.clients:
            if c['full_name'] == name:
                return c['id']
        return self.clients[0]['id'] if self.clients else 1

    def _get_pickup_point_id(self):
        """Получить ID пункта выдачи."""
        address = self.pickup_var.get()
        for p in self.pickup_points:
            if p['address'] == address:
                return p['id']
        return self.pickup_points[0]['id'] if self.pickup_points else 1

    def _load_order_data(self):
        """Загрузка данных заказа для редактирования."""
        order = db.get_order_by_id(self.order_id)
        if not order:
            messagebox.showerror('Ошибка', 'Заказ не найден', parent=self.dialog)
            self.dialog.destroy()
            return

        # Устанавливаем клиента
        for i, c in enumerate(self.clients):
            if c['id'] == order['client_id']:
                self.client_var.set(c['full_name'])
                break

        # Устанавливаем пункт выдачи
        for i, p in enumerate(self.pickup_points):
            if p['id'] == order['pickup_point_id']:
                self.pickup_var.set(p['address'])
                break

        self.order_date_var.set(order['order_date'])
        self.delivery_date_var.set(order['delivery_date'])
        self.code_var.set(order['pickup_code'])
        self.status_var.set(order['status'])

        # Загружаем товары
        for item in order['items']:
            self.order_items.append({
                'product_id': item['product_id'],
                'product_name': item['product_name'],
                'quantity': item['quantity'],
                'price': item['final_price']
            })

        self._update_items_table()

    def _save(self):
        """Сохранение заказа."""
        # Валидация
        order_date = self.order_date_var.get().strip()
        delivery_date = self.delivery_date_var.get().strip()
        code = self.code_var.get().strip()

        if not order_date:
            messagebox.showerror('Ошибка', 'Дата заказа обязательна', parent=self.dialog)
            return

        if not delivery_date:
            messagebox.showerror('Ошибка', 'Дата доставки обязательна', parent=self.dialog)
            return

        if not code:
            messagebox.showerror('Ошибка', 'Код получения обязателен', parent=self.dialog)
            return

        if not self.order_items:
            messagebox.showerror('Ошибка', 'Добавьте хотя бы один товар', parent=self.dialog)
            return

        # Формируем данные
        order_data = {
            'client_id': self._get_client_id(),
            'pickup_point_id': self._get_pickup_point_id(),
            'order_date': order_date,
            'delivery_date': delivery_date,
            'pickup_code': code,
            'status': self.status_var.get(),
            'items': [{'product_id': i['product_id'], 'quantity': i['quantity']} for i in self.order_items]
        }

        # Сохраняем
        if self.is_editing:
            db.update_order(self.order_id, order_data)
        else:
            db.add_order(order_data)

        messagebox.showinfo('Успех', 'Заказ сохранен', parent=self.dialog)
        self.on_save()
        self.dialog.destroy()

    def show(self):
        """Показать диалог."""
        self.dialog.wait_window()
