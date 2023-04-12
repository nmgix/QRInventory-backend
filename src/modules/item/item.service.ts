import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateItemDTO, EditItemDTO, Item } from "./item.entity";
import { ItemErrors } from "./item.i18n";

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>
  ) {}

  async getAll() {
    return this.itemRepository.find();
  }

  async getBy(searchString: string) {
    return this.itemRepository.findOne({ where: [{ id: searchString }, { article: searchString }] });
  }

  async create(item: CreateItemDTO) {
    const createdItem = await this.itemRepository.create({ ...item });
    return this.itemRepository.save(createdItem);
  }

  async update(item: EditItemDTO) {
    return this.itemRepository.update({ id: item.id }, item);
  }

  async deleteBy(searchString: string) {
    // сырая реализация, мне лень писать queryRunner (это может сэкономить ресурсы железа)
    // пример запроса `DELETE FROM subscription WHERE follower_id = 'xxxx' OR following_id = 'xxxx';`

    const item = await this.itemRepository.findOne({ where: [{ id: searchString }, { article: searchString }] });
    if (!item) throw new BadRequestException(ItemErrors.item_not_found);
    return this.itemRepository.delete({ id: item.id });
  }

  async clearTable() {
    return this.itemRepository.delete({});
  }
}
