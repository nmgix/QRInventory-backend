import { MigrationInterface, QueryRunner } from "typeorm";
import { User, UserRoles } from "../modules/user/user.entity";
import { Institution } from "../modules/institution/institution.entity";
import ImageFile from "../modules/database/image.entity";
const fs = require("fs");

export class TeacherInit1685638945113 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const institution = await queryRunner.manager.findOne(Institution, {
      where: { id: "4be12118-e771-4000-b448-9fd09791f763" }
    });

    let teacherImage = fs.readFileSync(__dirname + "/../resources/teacher.png");
    let teacherImageFile = queryRunner.manager.create(ImageFile, {
      data: teacherImage as unknown as Buffer,
      filename: "teacher.png"
    });
    await queryRunner.manager.insert(ImageFile, teacherImageFile);
    const teacher = queryRunner.manager.create(User, {
      email: "ziminae@moskbt.ru",
      password: "$argon2id$v=19$m=65536,t=3,p=4$8gQJh2RmJ8g8ZTLu7q1r7Q$zqjoE3iNtYZL77sYAzP0ArkFYQN9gcY14eJXv1QUyNc",
      id: "51376657-9567-42e3-a82c-264cdf200988",
      role: UserRoles.TEACHER,
      avatar: teacherImageFile,
      avatarId: teacherImageFile.id,
      fullName: "Зимин Артем Евгеньевич",
      teacherInstitution: institution
    });
    await queryRunner.manager.insert(User, teacher);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const zimin = await queryRunner.manager.findOne(User, {
      where: { id: "51376657-9567-42e3-a82c-264cdf200988" }
    });
    await queryRunner.manager.remove(zimin);
  }
}
