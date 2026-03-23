"""
Модуль представлений (окон).
"""

from .login_window import LoginWindow
from .main_window import MainWindow
from .product_dialog import ProductDialog
from .orders_window import OrdersWindow
from .order_dialog import OrderDialog

__all__ = [
    'LoginWindow',
    'MainWindow',
    'ProductDialog',
    'OrdersWindow',
    'OrderDialog'
]
