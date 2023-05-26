export enum InstitutionErrors {
  name_empty = "Название заведения не может быть пустым",
  name_string = "Название заведения должно быть строчкой",

  institution_input_error = "Произошла ошибка при вводе данных учереждения",
  institution_not_found = "Учереждение не найдено",
  institution_not_stated = "Учреждение не указано",

  cant_pass_admin = "Нельзя изменить админа данным методом",
  cant_pass_cabinets = "Нельзя изменить кабинеты данным методом",

  institution_id_regexp = "UUID учреждения неверен",
  institution_name_regexp = "Допустимый формат названия учреждения - [номер(|&)текст][пробел]...",

  institution_name_length = "Длина названия учреждения должна быть в рамках 2=> && <=50"
}

export enum InstitutionMessages {
  institution_deleted = "Учереждение удалено"
}
