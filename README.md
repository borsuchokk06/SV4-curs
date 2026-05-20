# SportArena — онлайн-платформа для управления магазином спортивной одежды

Курсовой проект по дисциплине **"Средства взаимодействия человека с вычислительными системами"** (Белорусско-Российский университет, факультет программной инженерии / компьютерных наук).

Полноценное full-stack веб-приложение для спортивного магазина: с клиентской витриной для покупателей **и** административной панелью для управления данными.

## Технологический стек

| Слой | Технологии |
| --- | --- |
| Frontend | React 18 · TypeScript · Vite · Material UI · Redux Toolkit · React Router 6 · Recharts · Axios |
| Backend | Node.js 18+ · Express 4 · Sequelize 6 · JWT auth · bcryptjs · PDFKit |
| База данных | PostgreSQL |
| Инструменты | npm scripts, ESM modules |

## Структура проекта

```
/
├── server/                 — backend на Express + Sequelize
│   └── src/
│       ├── config/         — подключение к базе данных
│       ├── models/         — 10 моделей Sequelize, 3НФ
│       ├── routes/         — REST-эндпоинты
│       ├── middleware/     — авторизация, обработчики ошибок
│       ├── utils/          — генератор PDF
│       └── seeders/        — скрипт наполнения БД (200+ записей)
└── client/                 — frontend на Vite + React + TS
    └── src/
        ├── api/            — axios и функции для работы с API
        ├── components/     — переиспользуемые UI-компоненты (Header, Footer, ProductCard, …)
        ├── pages/          — страницы покупателя и администратора
        ├── store/          — Redux-слайсы (auth, cart, filters, wishlist, snackbar)
        ├── theme/          — тема MUI
        └── types/          — общие TypeScript-типы
```

## База данных — 10 таблиц в 3НФ

`users`, `categories`, `brands`, `products`, `product_sizes`, `orders`, `order_items`, `reviews`, `wishlist`, `promo_codes`. Связи реализованы через внешние ключи; связь многие-ко-многим `User ↔ Product` для списка желаний вынесена в отдельную таблицу.

## Возможности

### Покупатель
- Регистрация и вход в систему (JWT)
- Просмотр каталога с фильтрами (категория, бренд, пол, вид спорта, размер, диапазон цены, популярные товары) и сортировкой
- Полнотекстовый поиск по названию товара
- Страница товара с выбором размера, индикатором наличия, изображением, описанием, отзывами и рейтингом
- Список желаний (хранится в БД и `localStorage`)
- Корзина с управлением количеством товаров (хранится в `localStorage`)
- Промокоды (`WELCOME10`, `SPORT20`, `SUMMER15`, `BLACKFRI30`, `STUDENT5` добавляются через seed-скрипт)
- Оформление заказа с данными доставки и выбором способа оплаты
- История заказов и детальная страница заказа с **загружаемым PDF-чеком**
- Редактируемый профиль пользователя

### Администратор
- Dashboard с KPI-карточками, графиком выручки (area), топом товаров (bar) и распределением заказов по статусам (pie)
- CRUD для товаров с управлением размерами и остатками
- Список заказов с фильтром по статусу и обновлением статусов
- Список пользователей с управлением ролями
- Управление категориями и брендами
- CRUD для промокодов
- **Загружаемый PDF-отчёт по продажам** за любой диапазон дат

### UX и технические особенности
- Адаптивный дизайн: desktop (≥1200), tablet (≥600), mobile (320+). На мобильных устройствах фильтры открываются в drawer-панели, навигация — через burger menu.
- Состояние корзины, фильтров и списка желаний сохраняется после перезагрузки страницы через `localStorage`. Кнопки сброса очищают сохранённые данные.
- RESTful API с единым JSON-форматом ответа и корректными HTTP-статусами
- Авторизация через JWT в заголовке `Authorization: Bearer …`
- Использовано 25+ компонентов MUI (Card, Button, TextField, Select, Slider, Pagination, Table, Tabs, Drawer, Dialog, Snackbar, Chip, Badge, Avatar, Tooltip, Switch, ToggleButton, Rating, Alert, Breadcrumbs, Accordion, Skeleton, Menu, IconButton, …)

## Начало работы

### 1. Требования

- **Node.js 18+** и **npm**
- **PostgreSQL 14+**, запущенный локально или на удалённом сервере

Создайте пустую базу данных:

```sql
CREATE DATABASE sportstore;
```

### 2. Установка зависимостей

```bash
npm run install:all
```

### 3. Настройка переменных окружения сервера

```bash
cd server
cp .env.example .env
# отредактируйте .env — минимум проверьте DB_USER / DB_PASSWORD
```

### 4. Наполнение базы данных

Команда удаляет и заново создаёт все таблицы, а затем добавляет 200+ реалистичных тестовых записей: 10 категорий, 10 брендов, 25 товаров, около 150 записей `product_sizes`, 12 покупателей + 1 администратора, 25 заказов, около 60 позиций заказов, около 35 отзывов, около 25 записей списка желаний и 6 промокодов.

```bash
npm run seed
```

В конце выполнения должно появиться сообщение `=== TOTAL ROWS: ... ===`.

### 5. Запуск серверов разработки

В двух терминалах:

```bash
# Терминал 1 — API на :4000
npm run dev:server

# Терминал 2 — Vite на :5173 (проксирует /api → :4000)
npm run dev:client
```

Откройте **http://localhost:5173**.

### Учётные записи по умолчанию

| Роль | Email | Пароль |
| --- | --- | --- |
| Администратор | `admin@sportarena.com` | `admin12345` |
| Покупатель | `ivan@mail.com` | `user12345` |
| Покупатель | `olga@mail.com` | `user12345` |

Любой из 12 тестовых покупателей использует пароль `user12345`.

## Сборка для production

```bash
npm run build:client   # создаёт client/dist
npm run start          # запускает API
```

Папку `client/dist` можно разместить на любом статическом хостинге и направить приложение на базовый URL API.

## Поддержка браузеров

Приложение протестировано в актуальной версии **Google Chrome** согласно требованиям проекта.

## Краткий справочник API

| Метод | Путь | Доступ | Назначение |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | — | Регистрация покупателя |
| POST | `/api/auth/login` | — | Вход в систему |
| GET | `/api/auth/me` | user | Текущий пользователь |
| PATCH | `/api/auth/me` | user | Обновление профиля |
| GET | `/api/products` | — | Список товаров с фильтрами, сортировкой и пагинацией |
| GET | `/api/products/popular` | — | Популярные товары |
| GET | `/api/products/:id` | — | Детальная информация о товаре |
| POST/PATCH/DELETE | `/api/products[/:id]` | admin | CRUD для товаров |
| GET | `/api/categories`, `/api/brands` | — | Списки категорий и брендов |
| POST/PATCH/DELETE | `/api/categories`, `/api/brands` | admin | CRUD для категорий и брендов |
| POST | `/api/orders` | user | Создание заказа из корзины |
| GET | `/api/orders/mine` | user | Мои заказы |
| GET | `/api/orders` | admin | Все заказы |
| GET | `/api/orders/:id` | user | Детали заказа |
| PATCH | `/api/orders/:id/status` | admin | Изменение статуса заказа |
| GET | `/api/reviews/product/:id` | — | Отзывы о товаре |
| POST | `/api/reviews` | user | Добавление или обновление отзыва |
| DELETE | `/api/reviews/:id` | user/admin | Удаление отзыва |
| GET/POST/DELETE | `/api/wishlist[/:id]` | user | Список желаний |
| GET | `/api/promo-codes/validate/:code` | — | Проверка промокода |
| GET/POST/PATCH/DELETE | `/api/promo-codes[/:id]` | admin | CRUD для промокодов |
| GET | `/api/users` | admin | Список пользователей |
| PATCH | `/api/users/:id/role` | admin | Изменение роли пользователя |
| GET | `/api/reports/analytics` | admin | Данные dashboard |
| GET | `/api/reports/sales-pdf` | admin | PDF-отчёт по продажам |
| GET | `/api/reports/order-pdf/:id` | user/admin | PDF-чек заказа |

## Лицензия

Курсовой проект — только для образовательного использования.
