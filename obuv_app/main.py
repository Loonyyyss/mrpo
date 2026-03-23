"""
Главный файл приложения ООО "Обувь".
Запуск: python main.py
"""

import tkinter as tk
from tkinter import ttk
from views.login_window import LoginWindow
from views.main_window import MainWindow


def main():
    """Главная функция запуска приложения."""
    # Создаем главное окно
    root = tk.Tk()

    # Настройка стилей ttk
    style = ttk.Style()
    style.theme_use('clam')

    # Настройка шрифтов
    style.configure('Treeview', font=('Times New Roman', 10))
    style.configure('Treeview.Heading', font=('Times New Roman', 10, 'bold'))
    style.configure('TCombobox', font=('Times New Roman', 10))
    style.configure('TButton', font=('Times New Roman', 10))

    # Функция перехода к главному окну после авторизации
    def on_login_success():
        """Обработчик успешной авторизации."""
        # Сохраняем менеджер авторизации
        auth_manager = login_window

        # Закрываем окно авторизации
        root.withdraw()

        # Создаем новое окно для главного интерфейса
        main_root = tk.Tk()
        MainWindow(main_root, auth_manager)
        main_root.mainloop()

        # После закрытия главного окна показываем окно авторизации снова
        root.deiconify()
        login_window.login_entry.delete(0, 'end')
        login_window.password_entry.delete(0, 'end')

    # Создаем окно авторизации
    login_window = LoginWindow(root, on_login_success)

    # Запускаем главный цикл
    root.mainloop()


if __name__ == '__main__':
    main()
