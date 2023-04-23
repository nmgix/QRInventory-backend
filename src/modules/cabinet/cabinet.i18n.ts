export enum CabinetErrors {
  cabinet_not_found = "Кабинет не найден",
  cabinet_exists = "Кабинет существует",

  cabinet_number_empty = "Отсутствует номер кабинета",
  cabinet_number_string = "Номер кабинета должен быь строкой",
  cabinet_institution_empty = "Отсутствует id учереждения",
  cabinet_institution_string = "Id учереждения должен быть строчкой",

  cabinet_input_data_error = "Ошибка ввода данных кабинета",

  cabinet_teachers = "Id учителей должны быть представлены массивом строчек id",
  cabinet_items = "Id предметов должны быть представлены массивом строчек id",
  cabinet_field_array = "Поле должно быть представлено массивом"
}

export enum CabinetMessages {
  cabinet_deleted = "Кабинет удален"
}
