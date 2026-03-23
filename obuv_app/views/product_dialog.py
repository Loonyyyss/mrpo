"""
Диалог добавления/редактирования товара.
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import os
import shutil
from database.db import db
from utils.constants import COLORS, FONT_FAMILY, DIALOG_WIDTH, DIALOG_HEIGHT


class ProductDialog:
    """Диалог для работы с товаром."""

    def __init__(self, parent, product_id, on_save):
        """Инициализация диалога."""
        self.parent = parent
        self.product_id = product_id
        self.on_save = on_save
        self.is_editing = product_id is not None
        self.photo_path = None

        # Создаем окно
        self.dialog = tk.Toplevel(parent)
        self.dialog.title('Редактирование товара' if self.is_editing else 'Добавление товара')
        self.dialog.geometry(f'{DIALOG_WIDTH}x{DIALOG_HEIGHT}')
        self.dialog.configure(bg=COLORS['primary_bg'])
        self.dialog.transient(parent)
        self.dialog.grab_set()

        # Центрируем окно
        self._center_window()

        # Загружаем справочники
        self.categories = db.get_all_categories()
        self.manufacturers = db.get_all_manufacturers()
        self.suppliers = db.get_all_suppliers()

        # Создаем виджеты
        self._create_widgets()

        # Если редактирование - загружаем данные
        if self.is_editing:
            self._load_product_data()

    def _center_window(self):
        """Центрирование окна."""
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (DIALOG_WIDTH // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (DIALOG_HEIGHT // 2)
        self.dialog.geometry(f'{DIALOG_WIDTH}x{DIALOG_HEIGHT}+{x}+{y}')

    def _create_widgets(self):
        """Создание виджетов формы."""
        # Основной фрейм с прокруткой
        canvas = tk.Canvas(self.dialog, bg=COLORS['primary_bg'])
        scrollbar = ttk.Scrollbar(self.dialog, orient='vertical', command=canvas.yview)
        self.main_frame = tk.Frame(canvas, bg=COLORS['primary_bg'])

        self.main_frame.bind(
            '<Configure>',
            lambda e: canvas.configure(scrollregion=canvas.bbox('all'))
        )

        canvas.create_window((0, 0), window=self.main_frame, anchor='nw', width=DIALOG_WIDTH - 20)
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side='left', fill='both', expand=True, padx=10, pady=10)
        scrollbar.pack(side='right', fill='y')

        # Заголовок
        title = tk.Label(
            self.main_frame,
            text='Редактирование товара' if self.is_editing else 'Добавление товара',
            font=(FONT_FAMILY, 16, 'bold'),
            bg=COLORS['primary_bg']
        )
        title.pack(pady=(0, 20))

        # ID (только для чтения при редактировании)
        if self.is_editing:
            self._create_readonly_field('ID:', 'id_var', str(self.product_id))

        # Фото товара
        self._create_photo_section()

        # Артикул
        self._create_field('Артикул *:', 'article_var')

        # Наименование
        self._create_field('Наименование *:', 'name_var')

        # Категория
        self._create_combobox('Категория:', 'category_var', [c['name'] for c in self.categories])

        # Производитель
        self._create_combobox('Производитель:', 'manufacturer_var', [m['name'] for m in self.manufacturers])

        # Поставщик
        self._create_combobox('Поставщик:', 'supplier_var', [s['name'] for s in self.suppliers])

        # Единица измерения
        self._create_field('Ед. изм.:', 'unit_var', 'шт.')

        # Цена
        self._create_numeric_field('Цена *:', 'price_var')

        # Количество на складе
        self._create_numeric_field('Количество на складе *:', 'stock_var', 0)

        # Скидка
        self._create_numeric_field('Скидка (%):', 'discount_var', 0)

        # Описание
        self._create_textarea('Описание *:', 'description_text')

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

        lbl = tk.Label(frame, text=label, font=(FONT_FAMILY, 11), bg=COLORS['primary_bg'], width=20, anchor='w')
        lbl.pack(side='left')

        var = tk.StringVar(value=value)
        setattr(self, var_name, var)

        entry = tk.Entry(frame, font=(FONT_FAMILY, 11), textvariable=var, state='readonly', width=40)
        entry.pack(side='left', padx=5)

    def _create_field(self, label, var_name, default=''):
        """Создать текстовое поле."""
        frame = tk.Frame(self.main_frame, bg=COLORS['primary_bg'])
        frame.pack(fill='x', pady=5, padx=20)

        lbl = tk.Label(frame, text=label, font=(FONT_FAMILY, 11), bg=COLORS['primary_bg'], width=20, anchor='w')
        lbl.pack(side='left')

        var = tk.StringVar(value=default)
        setattr(self, var_name, var)

        entry = tk.Entry(frame, font=(FONT_FAMILY, 11), textvariable=var, width=40)
        entry.pack(side='left', padx=5)

    def _create_numeric_field(self, label, var_name, default=0):
        """Создать числовое поле."""
        frame = tk.Frame(self.main_frame, bg=COLORS['primary_bg'])
        frame.pack(fill='x', pady=5, padx=20)

        lbl = tk.Label(frame, text=label, font=(FONT_FAMILY, 11), bg=COLORS['primary_bg'], width=20, anchor='w')
        lbl.pack(side='left')

        var = tk.StringVar(value=str(default))
        setattr(self, var_name, var)

        entry = tk.Entry(frame, font=(FONT_FAMILY, 11), textvariable=var, width=40)
        entry.pack(side='left', padx=5)

    def _create_combobox(self, label, var_name, values):
        """Создать выпадающий список."""
        frame = tk.Frame(self.main_frame, bg=COLORS['primary_bg'])
        frame.pack(fill='x', pady=5, padx=20)

        lbl = tk.Label(frame, text=label, font=(FONT_FAMILY, 11), bg=COLORS['primary_bg'], width=20, anchor='w')
        lbl.pack(side='left')

        var = tk.StringVar()
        setattr(self, var_name, var)

        combo = ttk.Combobox(frame, textvariable=var, values=values, font=(FONT_FAMILY, 11), width=38, state='readonly')
        combo.pack(side='left', padx=5)
        if values:
            combo.current(0)

    def _create_textarea(self, label, text_name):
        """Создать многострочное поле."""
        frame = tk.Frame(self.main_frame, bg=COLORS['primary_bg'])
        frame.pack(fill='x', pady=5, padx=20)

        lbl = tk.Label(frame, text=label, font=(FONT_FAMILY, 11), bg=COLORS['primary_bg'], width=20, anchor='nw')
        lbl.pack(side='left', anchor='n')

        text_frame = tk.Frame(frame, bg=COLORS['primary_bg'])
        text_frame.pack(side='left', padx=5)

        text = tk.Text(text_frame, font=(FONT_FAMILY, 11), width=38, height=5, wrap='word')
        text.pack(side='left')

        scrollbar = ttk.Scrollbar(text_frame, orient='vertical', command=text.yview)
        text.configure(yscrollcommand=scrollbar.set)
        scrollbar.pack(side='right', fill='y')

        setattr(self, text_name, text)

    def _create_photo_section(self):
        """Создать секцию для фото."""
        frame = tk.Frame(self.main_frame, bg=COLORS['primary_bg'])
        frame.pack(fill='x', pady=10, padx=20)

        lbl = tk.Label(frame, text='Фото:', font=(FONT_FAMILY, 11), bg=COLORS['primary_bg'], width=20, anchor='nw')
        lbl.pack(side='left', anchor='n')

        photo_frame = tk.Frame(frame, bg=COLORS['primary_bg'])
        photo_frame.pack(side='left', padx=5)

        # Метка для отображения фото
        self.photo_label = tk.Label(
            photo_frame,
            text='Нет фото',
            font=(FONT_FAMILY, 10),
            bg='lightgray',
            width=20,
            height=5
        )
        self.photo_label.pack()

        btn_frame = tk.Frame(photo_frame, bg=COLORS['primary_bg'])
        btn_frame.pack(pady=5)

        select_btn = tk.Button(
            btn_frame,
            text='Выбрать фото',
            font=(FONT_FAMILY, 10),
            command=self._select_photo
        )
        select_btn.pack(side='left', padx=2)

        clear_btn = tk.Button(
            btn_frame,
            text='Удалить',
            font=(FONT_FAMILY, 10),
            command=self._clear_photo
        )
        clear_btn.pack(side='left', padx=2)

    def _select_photo(self):
        """Выбрать фото товара."""
        file_path = filedialog.askopenfilename(
            parent=self.dialog,
            title='Выберите изображение',
            filetypes=[('Изображения', '*.png *.jpg *.jpeg *.gif *.bmp')]
        )

        if file_path:
            self.photo_path = file_path
            self.photo_label.config(text=os.path.basename(file_path))

    def _clear_photo(self):
        """Удалить фото."""
        self.photo_path = None
        self.photo_label.config(text='Нет фото')

    def _load_product_data(self):
        """Загрузка данных товара для редактирования."""
        product = db.get_product_by_id(self.product_id)
        if not product:
            messagebox.showerror('Ошибка', 'Товар не найден', parent=self.dialog)
            self.dialog.destroy()
            return

        self.article_var.set(product['article'])
        self.name_var.set(product['name'])
        self.unit_var.set(product['unit'])
        self.price_var.set(str(product['price']))
        self.stock_var.set(str(product['stock_quantity']))
        self.discount_var.set(str(product['discount']))
        self.description_text.insert('1.0', product['description'])

        # Устанавливаем категорию
        for i, cat in enumerate(self.categories):
            if cat['id'] == product['category_id']:
                self.category_var.set(cat['name'])
                break

        # Устанавливаем производителя
        for i, man in enumerate(self.manufacturers):
            if man['id'] == product['manufacturer_id']:
                self.manufacturer_var.set(man['name'])
                break

        # Устанавливаем поставщика
        for i, sup in enumerate(self.suppliers):
            if sup['id'] == product['supplier_id']:
                self.supplier_var.set(sup['name'])
                break

        # Загружаем фото
        if product['photo']:
            self.photo_label.config(text=product['photo'])

    def _get_category_id(self):
        """Получить ID выбранной категории."""
        name = self.category_var.get()
        for cat in self.categories:
            if cat['name'] == name:
                return cat['id']
        return 1

    def _get_manufacturer_id(self):
        """Получить ID выбранного производителя."""
        name = self.manufacturer_var.get()
        for man in self.manufacturers:
            if man['name'] == name:
                return man['id']
        return 1

    def _get_supplier_id(self):
        """Получить ID выбранного поставщика."""
        name = self.supplier_var.get()
        for sup in self.suppliers:
            if sup['name'] == name:
                return sup['id']
        return 1

    def _save(self):
        """Сохранение товара."""
        # Валидация
        article = self.article_var.get().strip()
        name = self.name_var.get().strip()
        description = self.description_text.get('1.0', 'end').strip()

        if not article:
            messagebox.showerror('Ошибка', 'Артикул обязателен', parent=self.dialog)
            return

        if not name:
            messagebox.showerror('Ошибка', 'Наименование обязательно', parent=self.dialog)
            return

        if not description:
            messagebox.showerror('Ошибка', 'Описание обязательно', parent=self.dialog)
            return

        try:
            price = float(self.price_var.get())
            if price < 0:
                raise ValueError
        except ValueError:
            messagebox.showerror('Ошибка', 'Цена должна быть положительным числом', parent=self.dialog)
            return

        try:
            stock = int(self.stock_var.get())
            if stock < 0:
                raise ValueError
        except ValueError:
            messagebox.showerror('Ошибка', 'Количество должно быть неотрицательным числом', parent=self.dialog)
            return

        try:
            discount = int(self.discount_var.get())
            if discount < 0 or discount > 100:
                raise ValueError
        except ValueError:
            messagebox.showerror('Ошибка', 'Скидка должна быть от 0 до 100', parent=self.dialog)
            return

        # Формируем данные
        product_data = {
            'article': article,
            'name': name,
            'unit': self.unit_var.get().strip() or 'шт.',
            'price': price,
            'supplier_id': self._get_supplier_id(),
            'manufacturer_id': self._get_manufacturer_id(),
            'category_id': self._get_category_id(),
            'discount': discount,
            'stock_quantity': stock,
            'description': description,
            'photo': os.path.basename(self.photo_path) if self.photo_path else None
        }

        # Копируем фото если есть
        if self.photo_path and os.path.exists(self.photo_path):
            assets_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'products')
            os.makedirs(assets_dir, exist_ok=True)
            dest_path = os.path.join(assets_dir, os.path.basename(self.photo_path))
            shutil.copy2(self.photo_path, dest_path)

        # Сохраняем
        if self.is_editing:
            db.update_product(self.product_id, product_data)
        else:
            db.add_product(product_data)

        messagebox.showinfo('Успех', 'Товар сохранен', parent=self.dialog)
        self.on_save()
        self.dialog.destroy()

    def show(self):
        """Показать диалог."""
        self.dialog.wait_window()
