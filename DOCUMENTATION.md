# Bless Analytics

## 1. Обзор проекта

### Цель
Веб-приложение для аналитики и мониторинга продаж, предназначенное для интеграции с NetHunt CRM. Система обеспечивает визуализацию данных, управление пользователями и автоматическую синхронизацию информации о клиентах, курсах, семинарах и вебинарах.

### Бизнес-контекст
Приложение разработано для анализа эффективности образовательных продуктов и продаж. Система позволяет отслеживать воронки продаж, сегментацию клиентов, производительность менеджеров и аналитику рекламных кампаний на основе данных из NetHunt CRM.

### Ключевые функции
- Многостраничная панель аналитики с различными разделами (реклама, продажи, обучение)
- Интерактивная визуализация данных с использованием графиков и таблиц
- Управление пользователями с ролевой системой доступа (admin/manager)
- Автоматическая синхронизация данных с NetHunt CRM
- Экспорт отчетов в различных форматах
- Фильтрация по датам и сегментам
- Поддержка многоязычности (английский/русский)
- Система аутентификации на основе JWT токенов

## 2. Архитектура и структура системы

### Описание основных модулей / сервисов с назначением

**Серверная часть (Node.js/Express.js):**
- `server.js` - основной сервер приложения с настройкой маршрутов и middleware
- `routes/api.js` - API маршруты для аналитических данных (1650+ строк кода)
- `routes/auth.js` - маршруты аутентификации и авторизации
- `services/nethunt.js` - сервис интеграции с NetHunt CRM API
- `db/` - модули работы с базой данных (пул соединений, миграции)
- `middleware/auth.js` - middleware для аутентификации и проверки ролей

**Клиентская часть (React/Vite):**
- `src/pages/` - компоненты страниц (Dashboard, Advertising, Sales, Students и др.)
- `src/components/` - переиспользуемые React компоненты
- `src/contexts/` - контексты React для управления состоянием
- `src/assets/` - статические ресурсы

**База данных (PostgreSQL):**
- Таблицы: users, contacts, course_deals, seminars, webinars, stage_history, sync_history
- Система миграций для управления схемой БД

### Взаимодействие между модулями: поток данных

```
NetHunt CRM API → Backend Services → PostgreSQL → API Routes → Frontend Components
     ↑                                                              ↓
     └─────────────── Sync Service ←─────────── User Actions ───────┘

Последовательность:
1. Пользователь аутентифицируется (JWT токен)
2. Frontend запрашивает данные через API endpoints
3. Backend проверяет права доступа (middleware)
4. API маршруты выполняют SQL запросы к PostgreSQL
5. Данные возвращаются в JSON формате
6. Frontend отображает данные в компонентах
7. Периодическая синхронизация с NetHunt CRM обновляет данные
```

### Реальная структура каталогов

```
bless-analytics/
├── backend/                      # Серверное приложение
│   ├── routes/                   # API маршруты
│   │   ├── api.js               # Основные API endpoints (1650 строк)
│   │   └── auth.js              # Аутентификация (180 строк)
│   ├── services/                # Бизнес-логика
│   │   └── nethunt.js           # Интеграция с NetHunt CRM (72 строки)
│   ├── middleware/              # Express middleware
│   │   └── auth.js              # Проверка аутентификации
│   ├── db/                      # Работа с базой данных
│   │   ├── pool.js              # Пул соединений PostgreSQL
│   │   ├── migrate.js           # Система миграций
│   │   └── reset.js             # Сброс базы данных
│   ├── migrations/              # SQL миграции
│   │   ├── 001_create_users_table.sql
│   │   ├── 002_create_contacts_table.sql
│   │   ├── 003_create_course_deals_table.sql
│   │   ├── 004_create_webinars_table.sql
│   │   ├── 005_create_seminars_table.sql
│   │   └── 006_create_deal_stage_history_table.sql
│   ├── server.js                # Точка входа сервера
│   ├── sync.js                  # Синхронизация с NetHunt
│   ├── package.json             # Зависимости backend
│   └── [вспомогательные скрипты]
├── frontend/                    # Клиентское приложение
│   ├── src/
│   │   ├── pages/              # Компоненты страниц
│   │   │   ├── Dashboard.jsx   # Главная панель
│   │   │   ├── Advertising.jsx # Аналитика рекламы
│   │   │   ├── Sales.jsx       # Аналитика продаж
│   │   │   ├── Students.jsx    # Аналитика студентов
│   │   │   ├── Funnels.jsx     # Воронки продаж
│   │   │   ├── Products.jsx    # Управление продуктами
│   │   │   ├── UserManagement.jsx # Управление пользователями
│   │   │   └── [другие страницы]
│   │   ├── components/         # Переиспользуемые компоненты
│   │   ├── contexts/           # React контексты
│   │   ├── assets/             # Статические файлы
│   │   └── main.jsx            # Точка входа React
│   ├── public/                 # Публичные статические файлы
│   ├── package.json            # Зависимости frontend
│   └── vite.config.js          # Конфигурация Vite
├── ecosystem.config.js         # Конфигурация PM2
├── [деплойментные скрипты]     # AWS и server setup
└── docs/                       # Документация проекта
```

## 3. Используемые технологии и библиотеки

| Component/Library | Version | Назначение | Примечания по конфигурации |
|---|---|---|---|
| **Backend** |
| Node.js | 18+ | Серверная среда выполнения | Требуется для запуска backend |
| Express.js | ^5.1.0 | Веб-фреймворк | Основной HTTP сервер |
| PostgreSQL | 12+ | База данных | Хранение всех данных приложения |
| pg | ^8.16.2 | PostgreSQL драйвер | Подключение к БД через пул соединений |
| bcryptjs | ^3.0.2 | Хеширование паролей | Соль rounds = 12 |
| jsonwebtoken | ^9.0.2 | JWT аутентификация | Токены действительны 24 часа |
| axios | ^1.10.0 | HTTP клиент | Для запросов к NetHunt API |
| cors | ^2.8.5 | CORS policy | Разрешение кросс-доменных запросов |
| dotenv | ^16.5.0 | Переменные окружения | Загрузка из .env файла |
| **Frontend** |
| React | ^19.1.0 | UI библиотека | Основа пользовательского интерфейса |
| Vite | ^6.3.5 | Сборщик проекта | Быстрая разработка и сборка |
| React Router DOM | ^7.6.2 | Маршрутизация | Навигация между страницами |
| Recharts | ^2.15.3 | Визуализация данных | Графики и диаграммы |
| Tailwind CSS | ^4.1.11 | CSS фреймворк | Основная система стилизации |
| Bootstrap | ^5.3.7 | UI компоненты | Дополнительные компоненты |
| React Bootstrap | ^2.10.10 | React Bootstrap компоненты | Интеграция Bootstrap с React |
| React Bootstrap Icons | ^1.11.6 | Иконки | Набор иконок для интерфейса |
| js-cookie | ^3.0.5 | Управление cookies | Хранение JWT токенов |
| **DevOps & Deployment** |
| PM2 | Не указана | Менеджер процессов | Управление Node.js процессами |
| Nginx | Не указана | Обратный прокси | Веб-сервер и балансировщик |
| AWS EC2 | - | Хостинг сервера | Виртуальный сервер |
| AWS RDS | - | Хостинг базы данных | Управляемая PostgreSQL |

## 4. API endpoints

### Аутентификация

#### POST /api/auth/login
**Назначение:** Вход пользователя в систему  
**Request parameters:** Отсутствуют  
**Request body schema:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```
**Response schema (успех):**
```json
{
  "message": "Login successful",
  "token": "string (JWT)",
  "user": {
    "id": "number",
    "email": "string", 
    "role": "admin|manager"
  }
}
```
**Error codes:**
- 400: Email and password are required
- 401: Invalid credentials
- 500: Internal Server Error

**Authentication/authorization:** Не требуется  
**Пример запроса:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

#### POST /api/auth/register
**Назначение:** Регистрация нового пользователя  
**Request parameters:** Отсутствуют  
**Request body schema:**
```json
{
  "email": "string (required)",
  "password": "string (required, min 6 chars)",
  "role": "admin|manager (optional, default: manager)"
}
```
**Response schema (успех):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "number",
    "email": "string",
    "role": "string"
  }
}
```
**Error codes:**
- 400: Validation errors
- 409: Email already exists
- 500: Internal Server Error

**Authentication/authorization:** Не требуется  
**Пример запроса:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","role":"manager"}'
```

#### GET /api/auth/me
**Назначение:** Получение информации о текущем пользователе  
**Request parameters:** Отсутствуют  
**Request body schema:** Отсутствует  
**Response schema:**
```json
{
  "id": "number",
  "email": "string",
  "role": "admin|manager",
  "created_at": "timestamp",
  "last_login": "timestamp"
}
```
**Error codes:**
- 401: Unauthorized
- 404: User not found
- 500: Internal Server Error

**Authentication/authorization:** JWT токен в заголовке Authorization  
**Пример запроса:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Управление пользователями

#### GET /api/users
**Назначение:** Получение списка всех пользователей  
**Request parameters:** Отсутствуют  
**Request body schema:** Отсутствует  
**Response schema:**
```json
[
  {
    "id": "number",
    "email": "string",
    "role": "admin|manager",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "last_login": "timestamp"
  }
]
```
**Error codes:**
- 401: Unauthorized
- 403: Forbidden (requires admin role)
- 500: Internal Server Error

**Authentication/authorization:** JWT токен + admin роль

#### POST /api/users
**Назначение:** Создание нового пользователя (admin only)  
**Request parameters:** Отсутствуют  
**Request body schema:**
```json
{
  "email": "string (required)",
  "password": "string (required, min 6 chars)",
  "role": "admin|manager (required)"
}
```
**Response schema (успех):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "number",
    "email": "string",
    "role": "string",
    "created_at": "timestamp"
  }
}
```
**Authentication/authorization:** JWT токен + admin роль

#### PUT /api/users/:id
**Назначение:** Обновление пользователя  
**Request parameters:**
- id (path): number (required) - ID пользователя

**Request body schema:**
```json
{
  "email": "string (optional)",
  "password": "string (optional, min 6 chars)",
  "role": "admin|manager (optional)"
}
```
**Authentication/authorization:** JWT токен + admin роль

#### DELETE /api/users/:id
**Назначение:** Удаление пользователя  
**Request parameters:**
- id (path): number (required) - ID пользователя

**Error codes:**
- 400: Cannot delete your own account
- 404: User not found

**Authentication/authorization:** JWT токен + admin роль

### Аналитические данные

#### GET /api/contacts
**Назначение:** Получение списка контактов  
**Request parameters:** Отсутствуют  
**Request body schema:** Отсутствует  
**Response schema:**
```json
[
  {
    "record_id": "string",
    "name": "string",
    "phone_number": "string",
    "country": "string",
    "manager_responsible": "string",
    "sales_department": "string",
    "contact_status": "string",
    "email": "string",
    "created_how": "string",
    "number_of_emails": "number",
    "number_of_phone_calls": "number",
    "number_of_calendar_events": "number",
    "number_of_files": "number",
    "created_at": "timestamp"
  }
]
```
**Authentication/authorization:** JWT токен + manager роль или выше

#### GET /api/seminars
**Назначение:** Получение данных о семинарах  
**Authentication/authorization:** JWT токен + manager роль или выше

#### GET /api/webinars  
**Назначение:** Получение данных о вебинарах  
**Authentication/authorization:** JWT токен + manager роль или выше

#### GET /api/course-deals
**Назначение:** Получение данных о курсах  
**Authentication/authorization:** JWT токен + manager роль или выше

#### GET /api/mnp-stats
**Назначение:** Статистика МНП курсов по дням  
**Request parameters (query):**
- courses: string (optional) - Список курсов через запятую
- startDate: string (optional) - Начальная дата (YYYY-MM-DD)
- endDate: string (optional) - Конечная дата (YYYY-MM-DD)

**Response schema:**
```json
[
  {
    "day": "date",
    "enrolled": "number",
    "paid": "number", 
    "completed": "number"
  }
]
```
**Authentication/authorization:** JWT токен + manager роль или выше

#### GET /api/learning/overview
**Назначение:** Обзорная аналитика обучения  
**Request parameters (query):**
- type: string (optional) - all|courses|seminars|webinars (default: all)
- dateRange: string (optional) - 7d|30d|90d|all (default: 30d)

**Response schema:**
```json
{
  "total_interested": "number",
  "total_paid": "number",
  "total_completed": "number",
  "conversion_rate": "number"
}
```
**Authentication/authorization:** JWT токен + manager роль или выше

#### GET /api/learning/funnels
**Назначение:** Данные воронок продаж  
**Request parameters (query):**
- type: string (required) - courses|seminars|webinars

**Response schema:**
```json
{
  "funnel": [
    {
      "label": "string",
      "count": "number",
      "dropped": "number"
    }
  ],
  "lost": "number",
  "converted": "number",
  "totalLeads": "number"
}
```
**Authentication/authorization:** JWT токен + manager роль или выше

#### GET /api/learning/products
**Назначение:** Список образовательных продуктов  
**Request parameters (query):**
- type: string (optional) - all|courses|seminars|webinars (default: all)
- search: string (optional) - Поиск по названию
- limit: number (optional) - Лимит записей (default: 50)
- offset: number (optional) - Смещение (default: 0)

**Response schema:**
```json
[
  {
    "type": "courses|seminars|webinars",
    "name": "string",
    "stage": "string",
    "manager_responsible": "string",
    "created_at": "timestamp",
    "record_id": "string"
  }
]
```
**Authentication/authorization:** JWT токен + manager роль или выше

#### GET /api/students
**Назначение:** Аналитика студентов с сегментацией  
**Request parameters (query):**
- segment: string (optional) - Фильтр по сегменту
- search: string (optional) - Поиск по имени/email

**Authentication/authorization:** JWT токен + manager роль или выше

### Синхронизация данных

#### POST /api/sync/trigger
**Назначение:** Запуск синхронизации с NetHunt CRM  
**Request parameters:** Отсутствуют  
**Request body schema:** Отсутствует  
**Response schema:**
```json
{
  "message": "Sync completed successfully",
  "summary": {
    "contacts": "number",
    "course_deals": "number",
    "seminars": "number", 
    "webinars": "number"
  },
  "duration": "string"
}
```
**Error codes:**
- 500: Sync failed with error details

**Authentication/authorization:** JWT токен + manager роль или выше  
**Пример запроса:**
```bash
curl -X POST http://localhost:3001/api/sync/trigger \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### GET /api/sync/status
**Назначение:** Получение статуса синхронизации  
**Response schema:**
```json
{
  "last_sync": "timestamp",
  "status": "success|failed|in_progress",
  "summary": "object"
}
```
**Authentication/authorization:** JWT токен + manager роль или выше

### Отладочные endpoints

#### GET /api/debug/compare
**Назначение:** Сравнение данных между различными источниками  
**Request parameters (query):**
- type: string (optional) - courses|seminars|webinars (default: courses)
- dateRange: string (optional) - 7d|30d|90d|all (default: all)

**Authentication/authorization:** JWT токен + admin роль  

#### GET /api/test
**Назначение:** Тестовый endpoint для проверки работоспособности  
**Response schema:**
```json
{
  "message": "Backend is working correctly!"
}
```
**Authentication/authorization:** JWT токен + manager роль или выше

## 5. Инструкции по установке и запуску

### Предварительные требования
- Node.js версии 18 или выше
- npm или yarn
- PostgreSQL версии 12 или выше  
- Учетная запись NetHunt CRM с доступом к API
- (Для production) AWS аккаунт с EC2 и RDS

### Настройка окружения

Создайте файл `.env` в директории `backend/`:

```env
# Конфигурация сервера
PORT=3001

# База данных PostgreSQL
DB_USER=your_db_user
DB_HOST=localhost
DB_DATABASE=your_database_name
DB_PASSWORD=your_db_password
DB_PORT=5432

# NetHunt CRM API
NETHUNT_API_KEY=your_api_key
NETHUNT_EMAIL=your_email

# JWT секрет
JWT_SECRET=your_super_secret_jwt_key_here
```

### Установка зависимостей

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Миграции / инициализация данных

```bash
cd backend
npm run db:migrate
```

Создание администратора:
```bash
node create-admin.js
```

Создание менеджера:
```bash
node create-manager.js
```

### Запуск

**Development режим:**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend  
npm run dev
```

**Production режим:**

Сборка frontend:
```bash
cd frontend
npm run build
```

Запуск с PM2:
```bash
pm2 start ecosystem.config.js
```

### Проверка работоспособности (health checks)

1. **Backend проверка:**
```bash
curl http://localhost:3001/
# Ожидаемый ответ: "Hello from the backend!"
```

2. **API проверка (требует токен):**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/test
# Ожидаемый ответ: {"message": "Backend is working correctly!"}
```

3. **Database проверка:**
```bash
cd backend
node test-db.js
```

4. **NetHunt интеграция:**
```bash
cd backend
node test-nethunt.js
```

5. **API endpoints тестирование:**
```bash
cd backend
node test-api-endpoints.js
```

### Деплоймент и откат

**AWS деплоймент:**

Первоначальная настройка:
```bash
./aws-setup.sh
```

Настройка базы данных:
```bash
./aws-setup-database.sh
```

Обновление приложения:
```bash
./deploy-update.sh
```

**Откат изменений:**
```bash
# Остановка приложения
pm2 stop all

# Откат к предыдущей версии через git
git checkout previous_commit_hash

# Установка зависимостей
cd backend && npm install
cd ../frontend && npm install && npm run build

# Запуск приложения
pm2 start ecosystem.config.js
```

**Синхронизация данных:**
```bash
cd backend
npm run db:sync
```

**Сброс и пересоздание базы данных:**
```bash
cd backend
npm run db:reset
```

## 6. Лучшие практики и заметки для участников

### Стиль кода и соглашения

**Backend (JavaScript/Node.js):**
- Использование ES6+ синтаксиса
- Async/await для асинхронных операций
- Обработка ошибок с помощью try/catch блоков
- Логирование с помощью console.error для ошибок
- Использование parametrized queries для защиты от SQL инъекций
- Валидация входных данных на уровне API

**Frontend (React/JavaScript):**
- Функциональные компоненты с React Hooks
- Использование JSX синтаксиса
- Разделение компонентов на переиспользуемые части
- Управление состоянием через React контексты
- Tailwind CSS классы для стилизации

**База данных:**
- Использование миграций для изменения схемы
- Индексирование часто запрашиваемых полей
- Нормализованная структура данных

### Веточная стратегия / workflow

Отсутствует на данный момент - [нужно доуточнение: требования к git workflow].

### Тестирование

**Текущие тестовые скрипты:**
- `backend/test-api-endpoints.js` - тестирование API endpoints
- `backend/test-db.js` - тестирование подключения к базе данных  
- `backend/test-nethunt.js` - тестирование интеграции с NetHunt
- `backend/test-sync-logging.js` - тестирование синхронизации
- `backend/check-data.js` - проверка целостности данных

**Запуск тестов:**
```bash
cd backend
node test-api-endpoints.js
node test-db.js  
node test-nethunt.js
node check-data.js
```

**Требования по покрытию:**  
[нужно доуточнение: требования к покрытию тестами]

### Логирование и обработка ошибок

**Логирование:**
- Использование console.log для информационных сообщений
- console.error для ошибок с детальным стектрейсом
- PM2 логи сохраняются в файлы: `./logs/err.log`, `./logs/out.log`, `./logs/combined.log`

**Обработка ошибок:**
- Все API endpoints обернуты в try/catch блоки
- Возврат стандартизированных HTTP кодов ошибок
- Детальные сообщения об ошибках только в development режиме
- Graceful handling для ошибок подключения к базе данных

**Мониторинг:**
```bash
# Просмотр логов PM2
pm2 logs

# Мониторинг состояния процессов
pm2 status

# Перезапуск при ошибках
pm2 restart all
```

### Безопасность

**Хранение секретов:**
- Все чувствительные данные в `.env` файлах
- `.env` файлы исключены из git репозитория
- JWT секреты должны быть криптографически стойкими
- Периодическая ротация API ключей

**Валидация входящих данных:**
- Проверка типов данных на уровне API
- Валидация email адресов
- Минимальные требования к паролям (6+ символов)
- Sanitization входящих SQL параметров через parametrized queries
- CORS политика настроена для разрешенных доменов

**Аутентификация и авторизация:**
- JWT токены с ограниченным временем жизни (24 часа)
- Проверка ролей пользователей на каждом защищенном endpoint
- Хеширование паролей с bcrypt (salt rounds = 12)
- Защита от повторного использования старых токенов

**Безопасность базы данных:**
- Использование отдельного пользователя БД с ограниченными правами
- Encrypted соединения с базой данных в production
- Регулярные бэкапы базы данных

### Обновления зависимостей и rollback

**Обновление зависимостей:**
```bash
# Проверка устаревших пакетов
npm outdated

# Обновление с проверкой совместимости
npm update

# Аудит безопасности
npm audit
npm audit fix
```

**Rollback процедура:**
1. Остановка приложения: `pm2 stop all`
2. Откат кода: `git checkout previous_stable_commit`
3. Восстановление зависимостей: `npm install`
4. Откат миграций БД (если необходимо)
5. Перезапуск: `pm2 start ecosystem.config.js`

**Автоматическое восстановление:**
- PM2 автоматически перезапускает упавшие процессы
- Мониторинг использования памяти (максимум 1GB)
- Логирование всех перезапусков и ошибок

**Резервное копирование:**
```bash
# Создание бэкапа базы данных
pg_dump -h $DB_HOST -U $DB_USER $DB_DATABASE > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из бэкапа
psql -h $DB_HOST -U $DB_USER $DB_DATABASE < backup_file.sql
```