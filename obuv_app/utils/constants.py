"""
Константы приложения.
"""

# Цвета из руководства по стилю
COLORS = {
    'primary_bg': '#FFFFFF',      # Основной фон (белый)
    'secondary_bg': '#7FFF00',    # Дополнительный фон (зеленый)
    'accent': '#00FA9A',          # Акцентирование внимания
    'high_discount': '#2E8B57',   # Скидка > 15%
    'out_of_stock': '#E0F7FA',    # Нет на складе (голубой)
    'text_primary': '#000000',    # Основной текст
    'text_white': '#FFFFFF',      # Белый текст
    'price_old': '#FF0000',       # Перечеркнутая цена
    'error': '#FF0000',           # Ошибка
    'success': '#00AA00',         # Успех
}

# Роли пользователей
ROLES = {
    'GUEST': 'Гость',
    'CLIENT': 'Авторизированный клиент',
    'MANAGER': 'Менеджер',
    'ADMIN': 'Администратор',
}

# Статусы заказа
ORDER_STATUSES = ['Новый', 'Завершен']

# Шрифт
FONT_FAMILY = 'Times New Roman'
FONT_SIZE_SMALL = 10
FONT_SIZE_NORMAL = 12
FONT_SIZE_LARGE = 14
FONT_SIZE_TITLE = 16

# Размеры окна
WINDOW_WIDTH = 1200
WINDOW_HEIGHT = 800

# Размеры диалогов
DIALOG_WIDTH = 600
DIALOG_HEIGHT = 700
