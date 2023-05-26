export enum CabinetErrors {
  cabinet_not_found = "Кабинет не найден",
  cabinet_exists = "Кабинет существует",

  cabinet_input_data_error = "Ошибка ввода данных кабинета",

  cabinet_teachers = "Id учителей должны быть представлены массивом строчек id",
  cabinet_items = "Id предметов должны быть представлены массивом строчек id",
  cabinet_field_array = "Поле должно быть представлено массивом",
  no_id_no_institution = "Не указан id, в таком случае необходим id учреждения",

  cabinet_number_regexp = "Допустимый формат номера кабинета - [номер(|&)текст][дефис]...",
  cabinet_number_empty = "Отсутствует номер кабинета",
  cabinet_number_string = "Номер кабинета должен быь строкой",

  cabinet_uuid_string = "UUID кабинета должен быть строкой",
  cabinet_uuid_regexp = "UUID кабинета неверен",

  cabinet_institution_empty = "Отсутствует id учереждения",
  cabinet_institution_string = "Id учереждения должен быть строчкой",
  cabinet_institution_regexp = "UUID учреждения неверен",

  cabinet_id_string = "UUID кабинета должен быть строчкой",
  cabinet_id_regexp = "UUID кабинета неверен",

  cabinet_number_length = "Длина номера кабинета должна быть в рамках 1=> && <=10"
}

export enum CabinetMessages {
  cabinet_deleted = "Кабинет удален"
}
