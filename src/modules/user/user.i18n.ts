export enum UserErrors {
  email_empty = "Почта не может быть пустой",
  email_not_email = "Предоставленное значение не является почтой",

  insitution_string = "Должен быть указан id учреждения",

  id_empty = "Не указан id",

  surname_empty = "Фамилия не может быть пустой",
  surname_string = "Фамилия должена быть строкой",

  name_empty = "Имя не может быть пустым",
  name_string = "Имя должено быть строкой",

  patronymic_empty = "Отчество не может быть пустым",
  patronymic_string = "Отчество должено быть строкой",

  password_empty = "Пароль должен присутствовать",
  password_string = "Пароль должен быть строкой",
  password_weak = "Пароль слишком слабый",
  password_invalid_format = "Недопустимый формат пароля",

  fullname_empty = "Отсутствует ФИО",
  fullname_string = "ФИО должно быть строчкой",
  role_empty = "Должна быть установлена роль",

  user_not_found = "Пользователь не найден",
  user_not_updated = "Пользователь не обновлён",

  user_data_input_error = "Ошибка ввода пользовательских данных",

  cant_pass_avatarId = "Нельзя изменить avatarId данным методом",
  cant_pass_avatar = "Нельзя изменить аватар данным методом",
  cant_pass_institutions = "Нельзя изменить учреждения данным методом",
  cant_pass_refreshToken = "Нельзя изменить refresh-токен данным методом",

  image_upload_error = "Произошла ошибка при загрузке фотографии",

  no_id_no_institution = "Не указан id, в таком случае необходим id учреждения",
  user_teacher_institution_id_regexp = "UUID учреждения учителя неверен",
  user_fullname_regexp = "Допустимый формат ФИО - [Текст(2+, с заглавной буквы)][пробел][Текст(2+, с заглавной буквы)][пробел][Текст(1+, с заглавной буквы)]",

  user_fullname_length = "Длина ФИО должна быть в рамках 5=> && <=40",
  user_password_length = "Длина пароля должна быть в рамках 8=> && <=30"
}

export enum UserMessages {
  user_deleted = "Пользователь удалён",
  user_updated = "Пользователь обновлён"
}
