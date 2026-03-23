/**
 * Страница добавления/редактирования заказа
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getOrderById,
  addOrder,
  updateOrder,
  getAllUsers,
  getAllPickupPoints,
  getExtendedProducts,
} from '@/db/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import type { Order, OrderItem, OrderStatus } from '@/types';
import type { ReactElement } from 'react';

interface OrderFormPageProps {
  orderId: number | null;
  onBack: () => void;
  onSave: () => void;
}

export function OrderFormPage({ orderId, onBack, onSave }: OrderFormPageProps): ReactElement {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clients = getAllUsers().filter(u => u.role === 'Авторизированный клиент');
  const pickupPoints = getAllPickupPoints();
  const products = getExtendedProducts();

  const [formData, setFormData] = useState<Partial<Order>>({
    orderItems: [],
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    pickupPointId: 1,
    clientId: clients.length > 0 ? clients[0].id : 1,
    pickupCode: '',
    status: 'Новый' as OrderStatus,
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  // Загрузка данных при редактировании
  useEffect(() => {
    if (orderId) {
      const order = getOrderById(orderId);
      if (order) {
        setFormData(order);
        setOrderItems(order.orderItems);
        setIsEditing(true);
      }
    }
  }, [orderId]);

  // Генерация кода получения
  const generatePickupCode = (): string => {
    return Math.floor(100 + Math.random() * 900).toString();
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.orderDate) {
      newErrors.orderDate = 'Дата заказа обязательна';
    }
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Дата доставки обязательна';
    }
    if (orderItems.length === 0) {
      newErrors.items = 'Добавьте хотя бы один товар';
    }
    if (!formData.pickupCode?.trim()) {
      newErrors.pickupCode = 'Код получения обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка сохранения
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const orderData = {
      ...formData,
      orderItems,
    };

    if (isEditing && orderId) {
      updateOrder(orderId, orderData);
    } else {
      addOrder(orderData as Omit<Order, 'id'>);
    }
    onSave();
  };

  // Добавление товара в заказ
  const addItem = (): void => {
    if (!selectedProduct) return;

    const productId = parseInt(selectedProduct);
    const existingItem = orderItems.find(item => item.productId === productId);

    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + selectedQuantity }
          : item
      ));
    } else {
      setOrderItems([...orderItems, { productId, quantity: selectedQuantity }]);
    }

    setSelectedProduct('');
    setSelectedQuantity(1);

    // Очищаем ошибку
    if (errors.items) {
      const newErrors = { ...errors };
      delete newErrors.items;
      setErrors(newErrors);
    }
  };

  // Удаление товара из заказа
  const removeItem = (productId: number): void => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  };

  // Обновление поля формы
  const updateField = <K extends keyof Order>(field: K, value: Order[K]): void => {
    setFormData({ ...formData, [field]: value });
    // Очищаем ошибку поля
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // Получение названия товара по ID
  const getProductName = (productId: number): string => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Неизвестный товар';
  };

  // Получение цены товара по ID
  const getProductPrice = (productId: number): number => {
    const product = products.find(p => p.id === productId);
    return product?.finalPrice || 0;
  };

  // Расчет общей суммы заказа
  const totalAmount = orderItems.reduce((sum, item) => {
    return sum + getProductPrice(item.productId) * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Шапка */}
      <div className="mb-6" style={{ backgroundColor: '#7FFF00', padding: '16px', borderRadius: '8px' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/Icon.png" alt="Логотип" className="h-16 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Times New Roman, serif' }}>
                {isEditing ? 'Редактирование заказа' : 'Добавление заказа'}
              </h1>
              {currentUser && (
                <p className="text-sm text-gray-700" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {currentUser.fullName} ({currentUser.role})
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onBack}
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
        </div>
      </div>

      {/* Форма */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ID заказа (только для чтения при редактировании) */}
            {isEditing && (
              <div>
                <Label style={{ fontFamily: 'Times New Roman, serif' }}>№ заказа</Label>
                <Input
                  value={orderId || ''}
                  disabled
                  style={{ fontFamily: 'Times New Roman, serif' }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Клиент */}
              <div>
                <Label style={{ fontFamily: 'Times New Roman, serif' }}>Клиент</Label>
                <Select
                  value={formData.clientId?.toString()}
                  onValueChange={(value) => updateField('clientId', parseInt(value))}
                >
                  <SelectTrigger style={{ fontFamily: 'Times New Roman, serif' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()} style={{ fontFamily: 'Times New Roman, serif' }}>
                        {c.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Пункт выдачи */}
              <div>
                <Label style={{ fontFamily: 'Times New Roman, serif' }}>Пункт выдачи</Label>
                <Select
                  value={formData.pickupPointId?.toString()}
                  onValueChange={(value) => updateField('pickupPointId', parseInt(value))}
                >
                  <SelectTrigger style={{ fontFamily: 'Times New Roman, serif' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pickupPoints.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()} style={{ fontFamily: 'Times New Roman, serif' }}>
                        {p.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Дата заказа */}
              <div>
                <Label htmlFor="orderDate" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Дата заказа *
                </Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => updateField('orderDate', e.target.value)}
                  style={{ fontFamily: 'Times New Roman, serif' }}
                  className={errors.orderDate ? 'border-red-500' : ''}
                />
                {errors.orderDate && (
                  <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {errors.orderDate}
                  </p>
                )}
              </div>

              {/* Дата доставки */}
              <div>
                <Label htmlFor="deliveryDate" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Дата доставки *
                </Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => updateField('deliveryDate', e.target.value)}
                  style={{ fontFamily: 'Times New Roman, serif' }}
                  className={errors.deliveryDate ? 'border-red-500' : ''}
                />
                {errors.deliveryDate && (
                  <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {errors.deliveryDate}
                  </p>
                )}
              </div>

              {/* Код получения */}
              <div>
                <Label htmlFor="pickupCode" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Код получения *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="pickupCode"
                    value={formData.pickupCode}
                    onChange={(e) => updateField('pickupCode', e.target.value)}
                    placeholder="Введите код или сгенерируйте"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                    className={errors.pickupCode ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => updateField('pickupCode', generatePickupCode())}
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    Сгенерировать
                  </Button>
                </div>
                {errors.pickupCode && (
                  <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {errors.pickupCode}
                  </p>
                )}
              </div>

              {/* Статус */}
              <div>
                <Label style={{ fontFamily: 'Times New Roman, serif' }}>Статус</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateField('status', value as OrderStatus)}
                >
                  <SelectTrigger style={{ fontFamily: 'Times New Roman, serif' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Новый" style={{ fontFamily: 'Times New Roman, serif' }}>Новый</SelectItem>
                    <SelectItem value="Завершен" style={{ fontFamily: 'Times New Roman, serif' }}>Завершен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Товары в заказе */}
            <div className="border rounded-lg p-4">
              <Label style={{ fontFamily: 'Times New Roman, serif' }}>Товары в заказе</Label>

              {errors.items && (
                <Alert variant="destructive" className="mt-2 mb-4">
                  <AlertDescription>{errors.items}</AlertDescription>
                </Alert>
              )}

              {/* Добавление товара */}
              <div className="flex gap-4 mt-4 mb-4">
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger className="flex-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                    <SelectValue placeholder="Выберите товар" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()} style={{ fontFamily: 'Times New Roman, serif' }}>
                        {p.name} ({p.article}) - {p.finalPrice} ₽
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                  className="w-24"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                />
                <Button
                  type="button"
                  onClick={addItem}
                  disabled={!selectedProduct}
                  style={{ backgroundColor: '#00FA9A', fontFamily: 'Times New Roman, serif' }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить
                </Button>
              </div>

              {/* Список товаров */}
              {orderItems.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left" style={{ fontFamily: 'Times New Roman, serif' }}>Товар</th>
                        <th className="p-2 text-left" style={{ fontFamily: 'Times New Roman, serif' }}>Количество</th>
                        <th className="p-2 text-left" style={{ fontFamily: 'Times New Roman, serif' }}>Цена</th>
                        <th className="p-2 text-left" style={{ fontFamily: 'Times New Roman, serif' }}>Сумма</th>
                        <th className="p-2 text-left" style={{ fontFamily: 'Times New Roman, serif' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item) => (
                        <tr key={item.productId} className="border-t">
                          <td className="p-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                            {getProductName(item.productId)}
                          </td>
                          <td className="p-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                            {item.quantity}
                          </td>
                          <td className="p-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                            {getProductPrice(item.productId)} ₽
                          </td>
                          <td className="p-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                            {getProductPrice(item.productId) * item.quantity} ₽
                          </td>
                          <td className="p-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeItem(item.productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td colSpan={3} className="p-2 text-right font-bold" style={{ fontFamily: 'Times New Roman, serif' }}>
                          Итого:
                        </td>
                        <td colSpan={2} className="p-2 font-bold" style={{ fontFamily: 'Times New Roman, serif' }}>
                          {totalAmount} ₽
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Нет товаров в заказе
                </p>
              )}
            </div>

            {/* Кнопки */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                style={{ backgroundColor: '#00FA9A', fontFamily: 'Times New Roman, serif' }}
              >
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Сохранить изменения' : 'Добавить заказ'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
