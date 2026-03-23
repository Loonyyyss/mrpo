"""
Окно авторизации.
"""

import tkinter as tk
from tkinter import ttk, messagebox
from database.db import db
from utils.constants import COLORS, FONT_FAMILY, ROLES


class LoginWindow:
    """Окно входа в систему."""

    def __init__(self, root: tk.Tk, on_login_success):
        """Инициализация окна авторизации."""
        self.root = root
        self.on_login_success = on_login_success
        self.current_user = None
        self.is_guest = False

        # Настройка окна
        self.root.title('ООО "Обувь" - Авторизация')
        self.root.geometry('500x500')
        self.root.configure(bg=COLORS['primary_bg'])
        self.root.resizable(False, False)

        # Центрируем окно
        self._center_window()

        # Создаем виджеты
        self._create_widgets()

    def _center_window(self):
        """Центрирование окна на экране."""
        self.root.update_idletasks()
        width = 500
        height = 500
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')

    def _create_widgets(self):
        """Создание виджетов окна."""
        # Фрейм для центрирования содержимого
        frame = tk.Frame(self.root, bg=COLORS['primary_bg'])
        frame.place(relx=0.5, rely=0.5, anchor='center')

        # Логотип (заглушка - текст)
        logo_label = tk.Label(
            frame,
            text='👟',
            font=('Arial', 64),
            bg=COLORS['primary_bg']
        )
        logo_label.pack(pady=(0, 10))

        # Заголовок
        title_label = tk.Label(
            frame,
            text='ООО "Обувь"',
            font=(FONT_FAMILY, 24, 'bold'),
            bg=COLORS['primary_bg'],
            fg=COLORS['text_primary']
        )
        title_label.pack()

        # Подзаголовок
        subtitle_label = tk.Label(
            frame,
            text='Система управления продажами',
            font=(FONT_FAMILY, 12),
            bg=COLORS['primary_bg'],
            fg='gray'
        )
        subtitle_label.pack(pady=(0, 30))

        # Поле логина
        login_frame = tk.Frame(frame, bg=COLORS['primary_bg'])
        login_frame.pack(fill='x', pady=5)

        login_label = tk.Label(
            login_frame,
            text='Логин:',
            font=(FONT_FAMILY, 12),
            bg=COLORS['primary_bg'],
            width=10,
            anchor='w'
        )
        login_label.pack(side='left')

        self.login_entry = tk.Entry(
            login_frame,
            font=(FONT_FAMILY, 12),
            width=25
        )
        self.login_entry.pack(side='left', padx=5)

        # Поле пароля
        password_frame = tk.Frame(frame, bg=COLORS['primary_bg'])
        password_frame.pack(fill='x', pady=5)

        password_label = tk.Label(
            password_frame,
            text='Пароль:',
            font=(FONT_FAMILY, 12),
            bg=COLORS['primary_bg'],
            width=10,
            anchor='w'
        )
        password_label.pack(side='left')

        self.password_entry = tk.Entry(
            password_frame,
            font=(FONT_FAMILY, 12),
            width=25,
            show='*'
        )
        self.password_entry.pack(side='left', padx=5)

        # Кнопка показать/скрыть пароль
        self.show_password = False
        self.toggle_btn = tk.Button(
            password_frame,
            text='👁',
            font=('Arial', 10),
            bg=COLORS['primary_bg'],
            command=self._toggle_password
        )
        self.toggle_btn.pack(side='left')

        # Кнопка входа
        login_btn = tk.Button(
            frame,
            text='Войти',
            font=(FONT_FAMILY, 12, 'bold'),
            bg=COLORS['accent'],
            fg=COLORS['text_primary'],
            width=30,
            command=self._login
        )
        login_btn.pack(pady=(20, 10))

        # Кнопка входа как гость
        guest_btn = tk.Button(
            frame,
            text='Войти как гость',
            font=(FONT_FAMILY, 12),
            bg=COLORS['primary_bg'],
            fg=COLORS['text_primary'],
            width=30,
            command=self._login_as_guest
        )
        guest_btn.pack(pady=5)

        # Привязываем Enter к входу
        self.root.bind('<Return>', lambda e: self._login())

    def _toggle_password(self):
        """Показать/скрыть пароль."""
        self.show_password = not self.show_password
        self.password_entry.config(
            show='' if self.show_password else '*'
        )

    def _login(self):
        """Обработка входа."""
        login = self.login_entry.get().strip()
        password = self.password_entry.get().strip()

        if not login or not password:
            messagebox.showerror(
                'Ошибка',
                'Пожалуйста, заполните все поля',
                parent=self.root
            )
            return

        user = db.authenticate_user(login, password)

        if user:
            self.current_user = user
            self.is_guest = False
            self.on_login_success()
        else:
            messagebox.showerror(
                'Ошибка',
                'Неверный логин или пароль',
                parent=self.root
            )

    def _login_as_guest(self):
        """Вход как гость."""
        self.current_user = None
        self.is_guest = True
        self.on_login_success()

    def get_current_user(self):
        """Получить текущего пользователя."""
        return self.current_user

    def get_user_role(self):
        """Получить роль пользователя."""
        if self.is_guest:
            return ROLES['GUEST']
        return self.current_user['role'] if self.current_user else None

    def is_admin(self):
        """Проверить, является ли пользователь администратором."""
        return self.get_user_role() == ROLES['ADMIN']

    def is_manager(self):
        """Проверить, является ли пользователь менеджером."""
        return self.get_user_role() == ROLES['MANAGER']

    def is_client(self):
        """Проверить, является ли пользователь клиентом."""
        return self.get_user_role() == ROLES['CLIENT']

    def is_guest_user(self):
        """Проверить, является ли пользователь гостем."""
        return self.is_guest

    def can_edit_products(self):
        """Проверить, может ли пользователь редактировать товары."""
        return self.is_admin()

    def can_filter_products(self):
        """Проверить, может ли пользователь фильтровать товары."""
        return self.is_admin() or self.is_manager()

    def can_view_orders(self):
        """Проверить, может ли пользователь просматривать заказы."""
        return self.is_admin() or self.is_manager()
