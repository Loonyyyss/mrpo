/**
 * Страница списка товаров
 */

import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getExtendedProducts,
  getAllSuppliers,
  deleteProduct,
  canDeleteProduct,
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
import { Search, Plus, ArrowUpDown, Trash2, Edit, ShoppingCart } from 'lucide-react';
import type { ProductExtended } from '@/types';
import type { ReactElement } from 'react';

interface ProductsPageProps {
  onEditProduct: (productId: number) => void;
  onAddProduct: () => void;
  onViewOrders: () => void;
  onLogout: () => void;
}

export function ProductsPage({
  onEditProduct,
  onAddProduct,
  onViewOrders,
  onLogout,
}: ProductsPageProps): ReactElement {
  const { currentUser, userRole, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductExtended | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const products = getExtendedProducts();
  const suppliers = getAllSuppliers();

  // Фильтрация и сортировка товаров
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Поиск по текстовым полям
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.article.toLowerCase().includes(query) ||
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.supplierName.toLowerCase().includes(query) ||
          p.manufacturerName.toLowerCase().includes(query) ||
          p.categoryName.toLowerCase().includes(query)
      );
    }

    // Фильтрация по поставщику
    if (selectedSupplier && selectedSupplier !== 'all') {
      result = result.filter((p) => p.supplierId === parseInt(selectedSupplier));
    }

    // Сортировка по количеству на складе
    if (sortDirection) {
      result.sort((a, b) => {
        if (sortDirection === 'asc') {
          return a.stockQuantity - b.stockQuantity;
        } else {
          return b.stockQuantity - a.stockQuantity;
        }
      });
    }

    return result;
  }, [products, searchQuery, selectedSupplier, sortDirection]);

  // Проверка прав доступа
  const canEdit = userRole === 'Администратор';
  const canFilter = userRole === 'Менеджер' || userRole === 'Администратор';
  const canViewOrders = userRole === 'Менеджер' || userRole === 'Администратор';

  // Обработка удаления товара
  const handleDelete = (product: ProductExtended): void => {
    if (!canDeleteProduct(product.id)) {
      setDeleteError('Невозможно удалить товар, который присутствует в заказе');
      return;
    }
    setProductToDelete(product);
    setDeleteError(null);
  };

  const confirmDelete = (): void => {
    if (productToDelete) {
      const success = deleteProduct(productToDelete.id);
      if (success) {
        setProductToDelete(null);
        // Обновляем страницу
        window.location.reload();
      } else {
        setDeleteError('Ошибка при удалении товара');
      }
    }
  };

  // Получение стиля строки в зависимости от скидки и наличия
  const getRowStyle = (product: ProductExtended): React.CSSProperties => {
    // Если товара нет на складе - голубой фон
    if (product.stockQuantity === 0) {
      return { backgroundColor: '#E0F7FA' };
    }
    // Если скидка > 15% - зеленый фон
    if (product.discount > 15) {
      return { backgroundColor: '#2E8B57', color: 'white' };
    }
    return {};
  };

  // Переключение сортировки
  const toggleSort = (): void => {
    if (sortDirection === null) {
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortDirection(null);
    }
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
                ООО "Обувь" - Список товаров
              </h1>
              {currentUser && (
                <p className="text-sm text-gray-700" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {currentUser.fullName} ({currentUser.role})
                </p>
              )}
              {userRole === 'Гость' && (
                <p className="text-sm text-gray-700" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Гость
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {canViewOrders && (
              <Button
                variant="outline"
                onClick={onViewOrders}
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Заказы
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                logout();
                onLogout();
              }}
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Выйти
            </Button>
          </div>
        </div>
      </div>

      {/* Панель фильтров (только для менеджера и администратора) */}
      {canFilter && (
        <div className="mb-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label style={{ fontFamily: 'Times New Roman, serif' }}>Поиск</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по товарам..."
                  className="pl-10"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                />
              </div>
            </div>
            <div className="w-[200px]">
              <Label style={{ fontFamily: 'Times New Roman, serif' }}>Поставщик</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger style={{ fontFamily: 'Times New Roman, serif' }}>
                  <SelectValue placeholder="Все поставщики" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" style={{ fontFamily: 'Times New Roman, serif' }}>
                    Все поставщики
                  </SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()} style={{ fontFamily: 'Times New Roman, serif' }}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={toggleSort}
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {sortDirection === null
                ? 'Сортировать по количеству'
                : sortDirection === 'asc'
                ? 'Количество ↑'
                : 'Количество ↓'}
            </Button>
            {canEdit && (
              <Button
                onClick={onAddProduct}
                style={{ backgroundColor: '#00FA9A', fontFamily: 'Times New Roman, serif' }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Добавить товар
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Если не может фильтровать, но может добавлять */}
      {!canFilter && canEdit && (
        <div className="mb-4 flex justify-end">
          <Button
            onClick={onAddProduct}
            style={{ backgroundColor: '#00FA9A', fontFamily: 'Times New Roman, serif' }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Добавить товар
          </Button>
        </div>
      )}

      {/* Таблица товаров */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: '#f5f5f5' }}>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Фото</TableHead>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Артикул</TableHead>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Наименование</TableHead>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Категория</TableHead>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Производитель</TableHead>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Поставщик</TableHead>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Цена</TableHead>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Ед. изм.</TableHead>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>На складе</TableHead>
              <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Скидка</TableHead>
              {canEdit && <TableHead style={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>Действия</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow
                key={product.id}
                style={getRowStyle(product)}
                className="cursor-pointer hover:opacity-80"
                onClick={() => canEdit && onEditProduct(product.id)}
              >
                <TableCell>
                  <img
                    src={product.photo ? `/${product.photo}` : '/picture.png'}
                    alt={product.name}
                    className="h-12 w-16 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/picture.png';
                    }}
                  />
                </TableCell>
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>{product.article}</TableCell>
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>{product.name}</TableCell>
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>{product.categoryName}</TableCell>
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>{product.manufacturerName}</TableCell>
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>{product.supplierName}</TableCell>
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>
                  {product.discount > 0 ? (
                    <div>
                      <span className="line-through text-red-500">{product.price} ₽</span>
                      <br />
                      <span className={product.discount > 15 ? 'text-white' : 'text-black'}>
                        {product.finalPrice} ₽
                      </span>
                    </div>
                  ) : (
                    `${product.price} ₽`
                  )}
                </TableCell>
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>{product.unit}</TableCell>
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>
                  <Badge variant={product.stockQuantity === 0 ? 'destructive' : 'default'}>
                    {product.stockQuantity}
                  </Badge>
                </TableCell>
                <TableCell style={{ fontFamily: 'Times New Roman, serif' }}>
                  {product.discount > 0 && (
                    <Badge variant={product.discount > 15 ? 'default' : 'secondary'}>
                      {product.discount}%
                    </Badge>
                  )}
                </TableCell>
                {canEdit && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProduct(product.id);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product);
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
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: 'Times New Roman, serif' }}>
              Подтверждение удаления
            </AlertDialogTitle>
            <AlertDialogDescription style={{ fontFamily: 'Times New Roman, serif' }}>
              Вы уверены, что хотите удалить товар "{productToDelete?.name}" (артикул: {productToDelete?.article})?
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

      {/* Ошибка удаления */}
      {deleteError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          {deleteError}
          <button
            className="ml-4 font-bold"
            onClick={() => setDeleteError(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
