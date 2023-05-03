import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ImageService } from "../database/image.service";
import { CreateItemDTO, EditItemDTO, Item } from "./item.entity";
import { ItemErrors } from "./item.i18n";

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    private imageService: ImageService
  ) {}

  async getAll() {
    return this.itemRepository.find();
  }

  async getBy(id?: string, article?: string) {
    const values = [
      { name: "id", value: id, alias: id },
      { name: "article", value: article, alias: article }
    ].filter(item => item.value !== undefined);

    return this.itemRepository.findOneOrFail({
      where: [...values.map(v => ({ [v.name]: v.alias }))]
    });
  }

  async create(item: CreateItemDTO) {
    const createdItem = await this.itemRepository.save(item);
    return this.itemRepository.save(createdItem);
  }

  async update(item: EditItemDTO) {
    return this.itemRepository.update({ id: item.id }, item as unknown as Partial<Item>);
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

  async addImage(itemId: string, imageBuffer: Buffer, filename: string) {
    const item = await this.getBy(itemId);
    const itemImage = await this.imageService.uploadImage(imageBuffer, filename);
    await this.itemRepository.update(itemId, { imageId: itemImage.id });

    try {
      if (item.imageId) {
        await this.imageService.deteleImageById(item.imageId);
      }
    } catch (error) {
      await this.itemRepository.update(itemId, { imageId: null });
    }

    return itemImage;
  }
}
