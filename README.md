# Бекенд дипломного проекта по инвентаризации

[![Деплой бекенда](https://github.com/nmgix/QRInventory-backend/actions/workflows/action.yml/badge.svg?branch=main)](https://github.com/nmgix/QRInventory-backend/actions/workflows/action.yml)

Команда для генерации секрета

```ts
   node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
```

## Переменные окружения

Создавать в корне приложения (скажите спасибо `docker-compose`)

`.env`

```md
# nginx

DOMAIN=localhost CONTAINER=qr-inventory-api:5000

# app

APP_PORT=5000 UPLOADED_FILES_DESTINATION=./uploads

# auth

JWT_ACCESS_SECRET=any JWT_REFRESH_SECRET=any

# `ACCESS_TIMEOUT` и `REFRESH_TIMEOUT` в секундах (например 30 минут и 7 дней в секунды)

ACCESS_TIMEOUT=1800 REFRESH_TIMEOUT=604800 JWT_COOKIE=any

# db

POSTGRES_PORT=5436 POSTGRES_USER=postgres POSTGRES_PASSWORD=any POSTGRES_DB=default_back POSTGRES_HOST=nest_pg

POSTGRES_TEST_PORT=5437 POSTGRES_TEST_USER=postgres POSTGRES_TEST_PASSWORD=any POSTGRES_TEST_DB=default_back POSTGRES_TEST_HOST=nest_test_pg

# db admin panel

PGADMIN_EMAIL=test@mail.com PGADMIN_PASSWORD=any-password PGADMIN_PORT=5480

# test admin for showcase

TEST_ADMIN_MAIL=admin@mail.com TEST_ADMIN_PASSWORD='$argon2id$v=19$m=65536,t=3,p=4$USXvM0Gx1hAnsazvNNQkXA$py/zN5qguEElCxEoP+nLMkaaB1NiRFX+BnRZBvyOoS4'
```

## Shorthand-команды для БД

1. `psql -d default_back -U postgres -p 5437;`
2. `select * from public.user;`
3. `INSERT INTO public.user ("id", "fullName", "role", "password", "refreshToken", "email") VALUES ('8b7c86bc-b8d8-4a7d-8805-89f956fb25d8', 'Фамилия Имя Отчество', 'admin', '$argon2id$v=19$m=65536,t=3,p=4$USXvM0Gx1hAnsazvNNQkXA$py/zN5qguEElCxEoP+nLMkaaB1NiRFX+BnRZBvyOoS4', '$argon2id$v=19$m=65536,t=3,p=4$TQdGNricgWcDhwNrpZIQmQ$FCnImpZM/Z7j+OurlfcegctyXiVObOXHSI/d+fUh+EE', 'test@mail.com');`
   > P.S. почта `test@mail.com`, пароль - `any-password`

## Что необходимо выполнить

1. [x] Роуты
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
   5. [x] Роут учереждений (админ)
      1. [x] создание / удаление учереждений
      2. [x] НЕ удаление учереждений при удалении админа
      3. [x] изменение учереждения (косвенное)
2. [x] Остальные технические решения
   1. [x] DB (Postgres)
   2. [-] Поиск (ElasticSearch)?
   3. [x] ~~S3 хранилище для изображений предмета (Яндекс/Amazon)~~ / локальное хранение
   4. [x] Документация
      1. [x] Swagger настроить
         1. [-] Разобраться с куками для логина и использования API внутри GUI
   5. [x] Безопасность
      1. [x] Поставить `secure` в куки () когда будет фронт писаться (если всё же в не том-же `docker compose`) (`auth.controller.ts`)
3. [x] Системная сторона
   1. [x] Docker
      1. [+/-] Nginx

## Проблемы

1. При использовании декоратора `@Patch` не приходит `@Body`,
2. Сырая имплементация создания новой пары токенов после `expire'а` `access` токена
3. Нет миграций, в проде используется `synchronize: true`

# ChatGPT симфония о ReactJS и NestJS

```
In the symphony of coding, two frameworks take the stage,
React and NestJS, a powerful duo engaged.

React, the front-end virtuoso, dances with grace,
Building user interfaces, at a rapid pace.
Components and states, creating a visual delight,
With JSX as the melody, everything feels right.

NestJS, the back-end maestro, orchestrates the show,
A framework for Node.js, bringing harmony to and fro.
Controllers and services, working hand in hand,
Creating APIs and servers, across the digital land.

Together they perform, a symphony of modern web,
React's virtual DOM and NestJS' RESTful ebb.
Client and server, communicating through requests,
Creating seamless experiences, that truly impress.

React's reactivity blends with NestJS' structure,
Front-end and back-end, unified without rupture.
State management and routing, smoothly intertwined,
As the symphony plays, their synergy aligned.

The symphony of React and NestJS, an exquisite display,
Building scalable applications, in an elegant array.
From UI interactions to server-side logic's might,
They harmonize and collaborate, shining so bright.

So let's applaud this symphony, a dynamic composition,
React and NestJS, a match made in coding fruition.
Together they create, pushing boundaries and beyond,
In the ever-evolving world of tech, they respond.
```
