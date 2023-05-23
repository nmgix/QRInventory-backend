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

  no_id_no_institution = "Не указан id, в таком случае необходим id учреждения"
}

export enum ItemMessages {
  item_updated = "Предмет обновлён"
}
