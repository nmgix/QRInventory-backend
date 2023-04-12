import { Test, TestingModule } from "@nestjs/testing";
import { QueryFailedError } from "typeorm";
import { TypeOrmTestingModule } from "../../database/database.module";
import { CreateUserDTO, User } from "../user.entity";
import { UserService } from "../user.service";

describe("Сервис учителей / администраторов", () => {
  let service: UserService;

  const teacherMockup: CreateUserDTO = {
    fullName: {
      surname: "Фамилия",
      name: "Имя",
      patronymic: "Отчество"
    },
    email: "test2@mail.com",
    password: "any-password"
  };

  const createTeacher = async (dto: CreateUserDTO) => {
    return service.create(dto);
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingModule()],
      providers: [UserService]
    }).compile();

    service = module.get<UserService>(UserService);
    await service.clearTable();
  });

  afterEach(async () => {
    await service.clearTable();
  });

  it("Получение всех учителей", async () => {
    await createTeacher(teacherMockup);
    await createTeacher(teacherMockup);
    await createTeacher(teacherMockup);

    const teachers = await service.getAllTeachers();
    expect(teachers.length).toBe(3);
  });

  it("Создание учителя", async () => {
    const teacher = await createTeacher(teacherMockup);
    const foundTeacher = await service.get(teacher.email);

    expect(teacher).toStrictEqual(foundTeacher);
  });

  describe("Создание учителя с неправильными данными выдаёт ошибку", () => {
    it("Создание учителя пустым DTO", async () => {
      await expect(createTeacher({} as unknown as CreateUserDTO)).rejects.toThrow(QueryFailedError);
    });
    // этот тест уедет в спеку контроллера, т.к. в сервисе нет фильтров по данным, а постгрес туповат чтобы понимать что-то большее чем нулевой вложенности (fullName - simple-json, для него что угодно будет simple-json, кажется)
    // it("Создание учителя неверными данными DTO", async () => {
    //   const newFullName = new Date();
    //   const newPassword = 0;
    //   await expect(createTeacher({ ...teacherMockup, fullName: newFullName, password: newPassword } as unknown as CreateUserDTO)).rejects.toThrow(QueryFailedError);
    // });
  });
});
