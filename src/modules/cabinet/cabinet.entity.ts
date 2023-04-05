import { IsNotEmpty, IsNumber } from 'class-validator';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Item } from '../item/item.entity';
import { User } from '../user/user.entity';
import { CabinetErrors } from './cabinet.i18n';

@Entity()
export class Cabinet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsNotEmpty({ message: CabinetErrors.cabinet_number_empty })
  @IsNumber({ allowInfinity: false, maxDecimalPlaces: 3000, allowNaN: false })
  @Column({ unique: true })
  cabinetNumber: number;

  @ManyToMany(() => User, (user) => user.id, { cascade: true, eager: true })
  @JoinTable()
  teachers: User[];

  @ManyToMany(() => Item, (item) => item.id, { cascade: true, eager: true })
  @JoinTable()
  items: Item[];
}

// export class EditCabinetDTO {

// }

export class AddTeachersDTO {
  cabinetId: string;
  teachersId: string[];
}

export class EditCabinetDTO {
  id: string;

  @IsNumber({ allowInfinity: false, maxDecimalPlaces: 3000, allowNaN: false })
  cabinetNumber?: number;

  teachers?: string[];

  items?: string[];
}
