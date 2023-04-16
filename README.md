# Бекенд дипломного проекта по инвентаризации

Команда для генерации секрета

```ts
   node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
```

## Переменные окружения

Создавать в корне приложения (скажите спасибо `docker-compose`)

`.env`

```md
# app

GLOBAL_PORT=80 APP_PORT=5000 UPLOADED_FILES_DESTINATION=./uploads

# auth

JWT_ACCESS_SECRET=any JWT_REFRESH_SECRET=any

# `ACCESS_TIMEOUT` и `REFRESH_TIMEOUT` в секундах (например 30 минут и 7 дней в секунды)

ACCESS_TIMEOUT=1800 REFRESH_TIMEOUT=604800 JWT_COOKIE=any

# db

POSTGRES_PORT=5436 POSTGRES_USER=postgres POSTGRES_PASSWORD=any POSTGRES_DB=default_back POSTGRES_HOST=nest_pg

POSTGRES_TEST_PORT=5437 POSTGRES_TEST_USER=postgres POSTGRES_TEST_PASSWORD=any POSTGRES_TEST_DB=default_back POSTGRES_TEST_HOST=nest_test_pg
```

## Shorthand-команды для БД

1. `psql -d default_back -U postgres -p 5437;`
2. `select * from public.user;`
3. `INSERT INTO public.user ("id", "fullName", "role", "password", "refreshToken", "email") VALUES ('8b7c86bc-b8d8-4a7d-8805-89f956fb25d8', 'Фамилия Имя Отчество', 'admin', '$argon2id$v=19$m=65536,t=3,p=4$USXvM0Gx1hAnsazvNNQkXA$py/zN5qguEElCxEoP+nLMkaaB1NiRFX+BnRZBvyOoS4', '$argon2id$v=19$m=65536,t=3,p=4$TQdGNricgWcDhwNrpZIQmQ$FCnImpZM/Z7j+OurlfcegctyXiVObOXHSI/d+fUh+EE', 'test@mail.com');`
   > P.S. почта `test@mail.com`, пароль - `any-password`

## Что необходимо выполнить

1. [ ] Роуты
   1. [x] Роут авторизации учителей/админов (jwt)
      1. [x] авторизация посредствам почты и пароля
         1. [x] access и refresh токены
   2. [x] Роут учителей / админов
      1. [x] создание / удаление каскадом (из всех комнат) учителя
      2. [x] Изменение пользователя
      3. [x] редактирование назначенных комнат учителем
      4. [x] редактирование любой комнаты админом
      5. [x] удаление комнаты назначенным учителем
      6. [x] удаление комнаты админом
      7. [x] получение данных о себе (у админа ещё поле `institutions`)
   3. [x] Роут комнат
      1. [x] добавление / удаление из них предметов
      2. [x] добавление / удаление из них учителей админом
      3. [x] поиск комнаты и подгрузка всех предметов и учителей в ней
   4. [x] Роут предметов
      1. [x] создание / удаление каскадом (из всех комнат) предмета
      2. [x] поиск предмета по артикулу
   5. [ ] Роут учереждений (админ)
      1. [ ] создание / удаление учереждений
      2. [x] НЕ удаление учереждений при удалении админа
      3. [ ] изменение учереждения
2. [ ] Остальные технические решения
   1. [x] DB (Postgres)
   2. [ ] Поиск (ElasticSearch)?
   3. [ ] S3 хранилище для изображений предмета (Яндекс/Amazon) / локальное хранение
   4. [ ] Телеграм бот?
   5. [ ] Метрики и логи?
      1. [ ] Метрики (prometheus + grafana)
      2. [ ] Логи (gray log + kibana)
   6. [x] Документация
      1. [x] Swagger настроить
         1. [-] Разобраться с куками для логина и использования API внутри GUI
   7. [ ] Безопасность
      1. [ ] Поставить `secure` в куки () когда будет фронт писаться (если всё же в не том-же `docker compose`) (`auth.controller.ts`)
      2. [ ] включить (`appSetup.ts`, все контроллеры) и разобраться с CSRF (`ncsrf` и `@Csrf` декоратором), понять когда создавать токен безопасности
      3. [ ] решить что делать с CORS и `same-site` у кук (если всё-же фронт будет не в том-же `docker compose`)
3. [ ] Связь с внешним миром
   1. [ ] Nginx
4. [x] Системная сторона
   1. [x] Docker

## Проблемы

1. При использовании декоратора `@Patch` не приходит `@Body`,
2. Сырая имплементация создания новой пары токенов после `expire'а` `access` токена
3. Нет миграций, в проде используется `synchronize: true`
