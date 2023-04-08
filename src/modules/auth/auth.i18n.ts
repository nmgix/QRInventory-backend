export enum AuthErrors {
  user_not_found = "Пользователь не найден",
  password_mismatch = "Пароли не сходятся",
  access_denied = "Доступ запрещён",

  id_empty = "Айди должен присутствовать",
  id_number = "Айди должен быть числом",
  password_empty = "Пароль должен присутствовать",
  password_string = "Пароль должен быть строкой",

  query_fail = "Введены ошибочные данные",
  bad_request = "Неправильный запрос"
}
