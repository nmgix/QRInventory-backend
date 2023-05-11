import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Institution } from "modules/institution/institution.entity";
import { InstitutionErrors } from "modules/institution/institution.i18n";
import { In, Repository } from "typeorm";
import { ImageService } from "../database/image.service";
import { CreateItemDTO, EditItemDTO, Item } from "./item.entity";
import { ItemErrors, ItemMessages } from "./item.i18n";

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    private imageService: ImageService,
    @InjectRepository(Institution)
    private institutionRepository: Repository<Institution>
  ) {}

  async getAll(userId: string) {
    let foundInstitution = await this.institutionRepository.findOne({
      where: [{ admin: { id: userId } }, { teachers: { id: userId } }]
    });
    if (!foundInstitution) throw new BadRequestException(InstitutionErrors.institution_not_found);

    return this.itemRepository.find({ where: { institution: { id: foundInstitution.id } } });
  }

  async getBy(institutionId: string, id?: string, article?: string) {
    const values = [
      { name: "id", value: id, alias: id },
      { name: "article", value: article, alias: article },
      { name: "institution", value: institutionId, alias: institutionId }
    ].filter(item => item.value !== undefined);

    return this.itemRepository.findOneOrFail({
      where: [...values.map(v => ({ [v.name]: v.alias }))]
    });
  }

  async create(userId: string, item: CreateItemDTO) {
    let foundInstitution = await this.institutionRepository.findOne({
      where: [
        { id: item.institution, admin: { id: userId } },
        { id: item.institution, teachers: { id: userId } }
      ]
    });
    if (!foundInstitution) throw new BadRequestException(InstitutionErrors.institution_not_found);
    const createdItem = await this.itemRepository.create({ article: item.article, name: item.name, institution: foundInstitution });
    return this.itemRepository.save(createdItem);
  }

  async update(userId: string, item: EditItemDTO) {
    let foundInstitution = await this.institutionRepository.findOne({
      where: [{ admin: { id: userId } }, { teachers: { id: userId } }]
    });
    if (!foundInstitution) throw new BadRequestException(InstitutionErrors.institution_not_found);

    if (item.institution) {
      let itemNewInstitution = await this.institutionRepository.findOne({ where: { id: item.institution } });

      const result = await this.itemRepository.update({ id: item.id }, { ...(item as unknown as Partial<Item>), institution: itemNewInstitution });
      return {
        message: result.affected > 0 ? ItemMessages.item_updated : ItemErrors.item_not_updated
      };
    } else {
      const result = await this.itemRepository.update({ id: item.id }, item as unknown as Partial<Item>);
      return {
        message: result.affected > 0 ? ItemMessages.item_updated : ItemErrors.item_not_updated
      };
    }
  }

  async deleteBy(userId: string, searchString: string) {
    let foundInstitution = await this.institutionRepository.findOneOrFail({
      where: [{ admin: { id: userId } }, { teachers: { id: userId } }]
    });
    if (!foundInstitution) throw new BadRequestException(InstitutionErrors.institution_not_found);
    const item = await this.itemRepository.findOne({ where: [{ id: searchString }, { article: searchString }] });
    if (!item) throw new BadRequestException(ItemErrors.item_not_found);
    return this.itemRepository.delete({ id: item.id });
  }

  async clearTable() {
    return this.itemRepository.delete({});
  }

  async addImage(userId: string, itemId: string, imageBuffer: Buffer, filename: string) {
    let foundInstitution = await this.institutionRepository.findOneOrFail({
      where: [{ admin: { id: userId } }, { teachers: { id: userId } }]
    });
    if (!foundInstitution) throw new BadRequestException(InstitutionErrors.institution_not_found);

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
