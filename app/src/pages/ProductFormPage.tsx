/**
 * Страница добавления/редактирования товара
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getProductById,
  addProduct,
  updateProduct,
  getAllCategories,
  getAllManufacturers,
  getAllSuppliers,
} from '@/db/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import type { Product } from '@/types';
import type { ReactElement } from 'react';

interface ProductFormPageProps {
  productId: number | null;
  onBack: () => void;
  onSave: () => void;
}

export function ProductFormPage({ productId, onBack, onSave }: ProductFormPageProps): ReactElement {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const categories = getAllCategories();
  const manufacturers = getAllManufacturers();
  const suppliers = getAllSuppliers();

  const [formData, setFormData] = useState<Partial<Product>>({
    article: '',
    name: '',
    unit: 'шт.',
    price: 0,
    supplierId: 1,
    manufacturerId: 1,
    categoryId: 1,
    discount: 0,
    stockQuantity: 0,
    description: '',
    photo: null,
  });

  // Загрузка данных при редактировании
  useEffect(() => {
    if (productId) {
      const product = getProductById(productId);
      if (product) {
        setFormData(product);
        setIsEditing(true);
        if (product.photo) {
          setPreviewImage(`/${product.photo}`);
        }
      }
    }
  }, [productId]);

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.article?.trim()) {
      newErrors.article = 'Артикул обязателен';
    }
    if (!formData.name?.trim()) {
      newErrors.name = 'Наименование обязательно';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Описание обязательно';
    }
    if (formData.price === undefined || formData.price < 0) {
      newErrors.price = 'Цена не может быть отрицательной';
    }
    if (formData.stockQuantity === undefined || formData.stockQuantity < 0) {
      newErrors.stockQuantity = 'Количество не может быть отрицательным';
    }
    if (formData.discount === undefined || formData.discount < 0 || formData.discount > 100) {
      newErrors.discount = 'Скидка должна быть от 0 до 100%';
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

    if (isEditing && productId) {
      updateProduct(productId, formData);
    } else {
      addProduct(formData as Omit<Product, 'id'>);
    }
    onSave();
  };

  // Обработка загрузки изображения
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверка размера файла (максимум 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, photo: 'Размер файла не должен превышать 2MB' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewImage(result);
        // Сохраняем имя файла
        setFormData({ ...formData, photo: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  // Обновление поля формы
  const updateField = <K extends keyof Product>(field: K, value: Product[K]): void => {
    setFormData({ ...formData, [field]: value });
    // Очищаем ошибку поля
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
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
                {isEditing ? 'Редактирование товара' : 'Добавление товара'}
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
            {/* ID товара (только для чтения при редактировании) */}
            {isEditing && (
              <div>
                <Label style={{ fontFamily: 'Times New Roman, serif' }}>ID товара</Label>
                <Input
                  value={productId || ''}
                  disabled
                  style={{ fontFamily: 'Times New Roman, serif' }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Фото товара */}
              <div className="md:col-span-2">
                <Label style={{ fontFamily: 'Times New Roman, serif' }}>Фото товара</Label>
                <div className="flex items-center gap-4 mt-2">
                  <img
                    src={previewImage || '/picture.png'}
                    alt="Превью"
                    className="h-32 w-48 object-cover rounded border"
                  />
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Выбрать фото
                    </Button>
                    <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                      Рекомендуемый размер: 300x200 пикселей
                    </p>
                  </div>
                </div>
                {errors.photo && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{errors.photo}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Артикул */}
              <div>
                <Label htmlFor="article" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Артикул *
                </Label>
                <Input
                  id="article"
                  value={formData.article}
                  onChange={(e) => updateField('article', e.target.value)}
                  style={{ fontFamily: 'Times New Roman, serif' }}
                  className={errors.article ? 'border-red-500' : ''}
                />
                {errors.article && (
                  <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {errors.article}
                  </p>
                )}
              </div>

              {/* Наименование */}
              <div>
                <Label htmlFor="name" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Наименование *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  style={{ fontFamily: 'Times New Roman, serif' }}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Категория */}
              <div>
                <Label style={{ fontFamily: 'Times New Roman, serif' }}>Категория</Label>
                <Select
                  value={formData.categoryId?.toString()}
                  onValueChange={(value) => updateField('categoryId', parseInt(value))}
                >
                  <SelectTrigger style={{ fontFamily: 'Times New Roman, serif' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()} style={{ fontFamily: 'Times New Roman, serif' }}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Производитель */}
              <div>
                <Label style={{ fontFamily: 'Times New Roman, serif' }}>Производитель</Label>
                <Select
                  value={formData.manufacturerId?.toString()}
                  onValueChange={(value) => updateField('manufacturerId', parseInt(value))}
                >
                  <SelectTrigger style={{ fontFamily: 'Times New Roman, serif' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {manufacturers.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()} style={{ fontFamily: 'Times New Roman, serif' }}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Поставщик */}
              <div>
                <Label style={{ fontFamily: 'Times New Roman, serif' }}>Поставщик</Label>
                <Select
                  value={formData.supplierId?.toString()}
                  onValueChange={(value) => updateField('supplierId', parseInt(value))}
                >
                  <SelectTrigger style={{ fontFamily: 'Times New Roman, serif' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()} style={{ fontFamily: 'Times New Roman, serif' }}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Единица измерения */}
              <div>
                <Label htmlFor="unit" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Единица измерения
                </Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => updateField('unit', e.target.value)}
                  style={{ fontFamily: 'Times New Roman, serif' }}
                />
              </div>

              {/* Цена */}
              <div>
                <Label htmlFor="price" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Цена *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                  style={{ fontFamily: 'Times New Roman, serif' }}
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {errors.price}
                  </p>
                )}
              </div>

              {/* Количество на складе */}
              <div>
                <Label htmlFor="stockQuantity" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Количество на складе *
                </Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => updateField('stockQuantity', parseInt(e.target.value) || 0)}
                  style={{ fontFamily: 'Times New Roman, serif' }}
                  className={errors.stockQuantity ? 'border-red-500' : ''}
                />
                {errors.stockQuantity && (
                  <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {errors.stockQuantity}
                  </p>
                )}
              </div>

              {/* Скидка */}
              <div>
                <Label htmlFor="discount" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Скидка (%)
                </Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => updateField('discount', parseInt(e.target.value) || 0)}
                  style={{ fontFamily: 'Times New Roman, serif' }}
                  className={errors.discount ? 'border-red-500' : ''}
                />
                {errors.discount && (
                  <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {errors.discount}
                  </p>
                )}
              </div>
            </div>

            {/* Описание */}
            <div>
              <Label htmlFor="description" style={{ fontFamily: 'Times New Roman, serif' }}>
                Описание *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
                style={{ fontFamily: 'Times New Roman, serif' }}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {errors.description}
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
                {isEditing ? 'Сохранить изменения' : 'Добавить товар'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
