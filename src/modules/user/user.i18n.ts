export enum UserErrors {
  email_empty = "Почта не может быть пустой",
  email_not_email = "Предоставленное значение не является почтой",

  surname_empty = "Фамилия не может быть пустой",
  surname_string = "Фамилия должена быть строкой",

  name_empty = "Имя не может быть пустым",
  name_string = "Имя должено быть строкой",

  patronymic_empty = "Отчество не может быть пустым",
  patronymic_string = "Отчество должено быть строкой",

  password_empty = "Пароль должен присутствовать",
  password_string = "Пароль должен быть строкой",
  password_weak = "Пароль слишком слабый",

  fullname_empty = "Отсутствует ФИО",
  role_empty = "Должна быть установлена роль",

  user_not_found = "Пользователь не найден",
  user_deleted = "Пользователь удалён",

  user_data_input_error = "Ошибка ввода пользовательских данных"
}
