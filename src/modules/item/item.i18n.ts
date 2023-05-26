export enum ItemErrors {
  item_query_fail = "Ошибка запроса",
  item_exists = "Предмет существует",
  item_not_found = "Предмет не найден",
  item_deleted = "Предмет удалён",
  item_not_updated = "Предмет не обновлён",

  article_empty = "Не указан артикул предмета",
  article_string = "Артикул должен быть строкой",

  name_empty = "Не указано название предмета",
  name_string = "Название предмета должно быть строкой",

  image_string = "Ссылка на изображения предмета должна быть строкой",

  institution_string = "ID института должен быть строкой",
  insitution_exists = "Должен быть указан институт",

  cant_pass_imageId = "Нельзя изменить imageId данным методом",
  cant_pass_image = "Нельзя изменить изображение данным методом",

  no_id_no_institution = "Не указан id, в таком случае необходим id учреждения",

  item_institution_empty = "Отсутствует id учереждения",
  item_institution_string = "Id учереждения должен быть строчкой",
  item_institution_regexp = "UUID учреждения неверен",

  item_article_regexp = "Допустимый формат артикула предмета - [номер(|&)текст][дефис]...",
  item_id_string = "UUID кабинета должен быть строчкой",
  item_id_regexp = "UUID кабинета неверен",

  item_name_regexp = "Допустимый формат названия предмета - [номер(|&)текст][пробел]...",

  item_article_length = "Длина артикула предмета должна быть в рамках 7=> && <=40",
  item_name_length = "Длина названия предмета должна быть в рамках 5=> && <=40"
}

export enum ItemMessages {
  item_updated = "Предмет обновлён"
}
