# Настройка бэкенда

## Статус

✅ PostgreSQL запущен в Docker (контейнер `diptan-pg`, порт 5432)  
✅ Схема БД применена  
✅ Сервер запущен на http://localhost:4000  
✅ Фронтенд запущен на http://localhost:5173

---

## Управление PostgreSQL (Docker)

```powershell
# Запустить (если остановлен)
docker start diptan-pg

# Остановить
docker stop diptan-pg

# Посмотреть логи
docker logs diptan-pg

# Удалить контейнер (данные пропадут!)
docker rm -f diptan-pg
```

## Запуск сервера

```powershell
cd server
npm run dev
```

## Переменные окружения (`server/.env`)

| Переменная | Значение |
|---|---|
| `DATABASE_URL` | postgresql://postgres:postgres@localhost:5432/diptan |
| `PORT` | 4000 |
| `JWT_ACCESS_SECRET` | ✅ задан (15 мин) |
| `JWT_REFRESH_SECRET` | ✅ задан (30 дней) |
| `GOOGLE_CLIENT_ID` | ⚠️ не задан (Google OAuth выключен) |

## Настройка Google OAuth (опционально)

1. Перейдите на https://console.cloud.google.com/
2. Создайте проект → APIs & Services → Credentials → Create credentials → OAuth 2.0 Client ID
3. Application type: **Web application**
4. Authorized redirect URIs: `http://localhost:4000/auth/google/callback`
5. Скопируйте **Client ID** и **Client Secret**
6. Добавьте в `server/.env`:
   ```
   GOOGLE_CLIENT_ID=ваш_client_id
   GOOGLE_CLIENT_SECRET=ваш_client_secret
   ```
7. Перезапустите сервер: `npm run dev`

## API Endpoints

| Метод | URL | Описание |
|---|---|---|
| GET | /health | Статус сервера |
| POST | /auth/register | Регистрация (email + пароль) |
| POST | /auth/login | Вход |
| POST | /auth/refresh | Обновить access token |
| POST | /auth/logout | Выйти |
| GET | /auth/me | Текущий пользователь |
| GET | /auth/google | Вход через Google |
| GET | /api/goals | Список целей |
| POST | /api/goals | Создать цель |
| … | … | … |
