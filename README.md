# Бекенд димпломного проекта по инвентаризации

Команда для генерации секрета

```ts
   node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
```

## Переменные окружения

Создавать в корне приложения (скажите спасибо `docker-compose`)

`.env`

```md
# app

GLOBAL_PORT=80 APP_PORT=5000

# auth

JWT_ACCESS_SECRET=any JWT_REFRESH_SECRET=any

# `ACCESS_TIMEOUT` и `REFRESH_TIMEOUT` в секундах (например 30 минут и 7 дней в секунды)

ACCESS_TIMEOUT=1800 REFRESH_TIMEOUT=604800 JWT_COOKIE=any

# db

POSTGRES_PORT=5436 POSTGRES_USER=postgres POSTGRES_PASSWORD=any POSTGRES_DB=default_back POSTGRES_HOST=nest_pg

POSTGRES_TEST_PORT=5437 POSTGRES_TEST_USER=postgres POSTGRES_TEST_PASSWORD=any POSTGRES_TEST_DB=default_back POSTGRES_TEST_HOST=nest_test_pg
```

## Shorthand-команды для БД

1. `psql -d default_back -U postgres -p 5437`
2. `select * from public.user`
3. `INSERT INTO public.user ("id", "fullName", "role", "password", "refreshToken", "email") VALUES (0, '{"surname":"Фамилия","name":"Имя","patronymic":"Отчество"}', 'admin', '$argon2id$v=19$m=65536,t=3,p=4$USXvM0Gx1hAnsazvNNQkXA$py/zN5qguEElCxEoP+nLMkaaB1NiRFX+BnRZBvyOoS4', '$argon2id$v=19$m=65536,t=3,p=4$TQdGNricgWcDhwNrpZIQmQ$FCnImpZM/Z7j+OurlfcegctyXiVObOXHSI/d+fUh+EE', 'test@mail.com');`
   > P.S. почта `test@mail.com`, пароль - `any-password`

## Что необходимо выполнить

1. [ ] Роуты
   1. [ ] Роут авторизации учителей/админов (jwt)
      1. [ ] авторизация посредствам айди и пароля
         1. [ ] access и refresh токены
   2. [ ] Роут учителей / админов
      1. [ ] создание / удаление каскадом (из всех комнат) учителя
         1. [ ] ошибка если в пароле пробел (регистрация или логин) (защита от идиота), проверка насколько пароль слабый
      2. [ ] редактирование назначенных комнат учителем
      3. [ ] редактирование любой комнаты админом
   3. [ ] Роут комнат
      1. [ ] добавление / удаление из них предметов
      2. [x] добавление / удаление из них учителей админом
      3. [x] поиск комнаты и подгрузка всех предметов и учителей в ней
   4. [ ] Роут предметов
      1. [ ] создание / удаление каскадом (из всех комнат) предмета
      2. [ ] поиск предмета по артикулу
2. [ ] Остальные технические решения
   1. [x] DB (Postgres)
   2. [ ] Поиск (ElasticSearch)?
   3. [ ] S3 хранилище для изображений предмета (Яндекс/Amazon) / локальное хранение
   4. [ ] Телеграм бот?
   5. [ ] Метрики и логи?
      1. [ ] Метрики (prometheus + grafana)
      2. [ ] Логи (gray log + kibana)
   6. [ ] Документация
      1. [ ] Swagger настроить
         1. [ ] Разобраться с куками для логина и использования API внутри GUI
   7. [ ] Авторизация на уровнях
      1. [ ] Учитель
         1. [ ] Редактирование классов
      2. [ ] Админ
         1. [ ] Создание / удаление / редактирование классов
         2. [ ] Добавление / удаление предметов из реестра
   8. [ ] Безопасность
      1. [ ] Поставить `secure` в куки () когда будет фронт писаться (если всё же в не том-же `docker compose`) (`auth.controller.ts`)
      2. [ ] включить (`appSetup.ts`, все контроллеры) и разобраться с CSRF (`ncsrf` и `@Csrf` декоратором), понять когда создавать токен безопасности
      3. [ ] решить что делать с CORS и `same-site` у кук (если всё-же фронт будет не в том-же `docker compose`)
3. [ ] Связь с внешним миром
   1. [ ] Nginx
4. [x] Системная сторона
   1. [x] Docker
