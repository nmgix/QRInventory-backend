export enum PasswordRequestMessages {
  ticket_created = "Запрос создан",
  ticket_deleted = "Запрос удалён",

  password_updated = "Пароль обновлён"
}

export enum PasswordRequestErrors {
  ticket_not_created = "Запрос не создан",
  ticket_not_found = "Запрос не найден",
  ticket_exists = "Запрос существует",

  password_not_updated = "Пароль не обновлён"
}
