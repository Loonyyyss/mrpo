/**
 * Страница списка заказов
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getExtendedOrders,
  deleteOrder,
} from '@/db/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react';
import type { OrderExtended } from '@/types';
import type { ReactElement } from 'react';

interface OrdersPageProps {
  onBack: () => void;
  onAddOrder: () => void;
  onEditOrder: (orderId: number) => void;
}

export function OrdersPage({ onBack, onAddOrder, onEditOrder }: OrdersPageProps): ReactElement {
  const { currentUser, userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [orderToDelete, setOrderToDelete] = useState<OrderExtended | null>(null);

  const orders = getExtendedOrders();

  // Фильтрация заказов
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.id.toString().includes(query) ||
      order.clientName.toLowerCase().includes(query) ||
      order.pickupPointAddress.toLowerCase().includes(query) ||
      order.pickupCode.includes(query) ||
      order.status.toLowerCase().includes(query)
    );
  });

  // Проверка прав доступа
  const canEdit = userRole === 'Администратор';

  // Обработка удаления заказа
  const handleDelete = (order: OrderExtended): void => {
    setOrderToDelete(order);
  };

  const confirmDelete = (): void => {
    if (orderToDelete) {
      deleteOrder(orderToDelete.id);
      setOrderToDelete(null);
      // Обновляем страницу
      window.location.reload();
    }
  };

  // Получение цвета статуса
  const getStatusColor = (status: string): string => {
    return status === 'Новый' ? 'bg-blue-500' : 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Шапка */}
      <div className="mb-6" style={{ backgroundColor: '#7FFF00', padding: '16px', borderRadius: '8px' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/Icon.png" alt="Логотип" className="h-16 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Times New Roman, serif' }}>
                ООО "Обувь" - Список заказов
              </h1>
              {currentUser && (
                <p className="text-sm text-gray-700" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {currentUser.fullName} ({currentUser.role})
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onBack}
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к товарам
            </Button>
          </div>
        </div>
      </div>

      {/* Панель поиска */}
      <div className="mb-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label style={{ fontFamily: 'Times New Roman, serif' }}>Поиск</Label>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по заказам..."
              style={{ fontFamily: 'Times New Roman, serif' }}
            />
          </div>
          {canEdit && (
            <Button
              onClick={onAddOrder}
              style={{ backgroundColor: '#00FA9A', fontFamily: 'Times New Roman, serif' }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Добавить заказ
            </Button>
          )}
        </div>
      </div>

      {/* Таблица заказов */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: '#f5f5f5' }}>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>№ заказа</TableHead>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Клиент</TableHead>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Адрес пункта выдачи</TableHead>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Дата заказа</TableHead>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Дата доставки</TableHead>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Код получения</TableHead>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Сумма</TableHead>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Статус</TableHead>
              {canEdit && <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Действия</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => canEdit && onEditOrder(order.id)}
              >
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>{order.id}</TableCell>
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>{order.clientName}</TableCell>
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>{order.pickupPointAddress}</TableCell>
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>{order.orderDate}</TableCell>
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>{order.deliveryDate}</TableCell>
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>{order.pickupCode}</TableCell>
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>{order.totalAmount} ₽</TableCell>
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                {canEdit && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditOrder(order.id);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(order);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: 'Times New Roman, serif' }}>
              Подтверждение удаления
            </AlertDialogTitle>
            <AlertDialogDescription style={{ fontFamily: 'Times New Roman, serif' }}>
              Вы уверены, что хотите удалить заказ №{orderToDelete?.id}?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ fontFamily: 'Times New Roman, serif' }}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
