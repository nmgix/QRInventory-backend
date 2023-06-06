import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ImageErrors } from "modules/database/image.i18n";
import { Institution } from "modules/institution/institution.entity";
import { InstitutionErrors } from "modules/institution/institution.i18n";
import { Repository } from "typeorm";
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

  async getAll(userId: string, institution: string, take: number = 10, skip: number = 0) {
    if (!institution) throw new BadRequestException(InstitutionErrors.institution_not_stated);
    let foundInstitution = await this.institutionRepository.findOne({
      where: [
        { admin: { id: userId }, id: institution },
        { teachers: { id: userId }, id: institution }
      ]
    });
    if (!foundInstitution) throw new BadRequestException(InstitutionErrors.institution_not_found);

    return this.itemRepository
      .createQueryBuilder("item")
      .leftJoinAndSelect("item.institution", "institution")
      .where("item.institution.id = :institution", { institution })
      .orderBy("item.article", "ASC")
      .offset(skip)
      .limit(take)
      .getManyAndCount();
  }

  async findMatching(institutionId?: string, take?: number, skip?: number, id?: string, article?: string) {
    if (!id && !institutionId) throw new BadRequestException(ItemErrors.no_id_no_institution);
    if (id) {
      const item = await this.itemRepository.findOne({ where: { id }, relations: ["institution"] });
      return [[item], 1];
    } else {
      return this.itemRepository
        .createQueryBuilder("item")
        .leftJoinAndSelect("item.institution", "institution")
        .where("(item.article LIKE :article) AND institution.id = :institutionId", { article: `%${article}%`, institutionId })
        .offset(skip ? skip : 0)
        .limit(take ? take : 10)
        .orderBy("item.article", "ASC")
        .getManyAndCount();
    }
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
      where: [
        { admin: { id: userId }, items: { id: item.id } },
        { teachers: { id: userId }, items: { id: item.id } }
      ]
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
    const item = await this.itemRepository.findOne({
      where: [
        { id: searchString, institution: { id: foundInstitution.id } },
        { article: searchString, institution: { id: foundInstitution.id } }
      ]
    });
    if (!item) throw new BadRequestException(ItemErrors.item_not_found);
    return this.itemRepository.delete({ id: item.id });
  }

  async addImage(userId: string, itemId: string, imageBuffer: Buffer, filename: string) {
    let foundInstitution = await this.institutionRepository.findOneOrFail({
      where: [
        { admin: { id: userId }, items: { id: itemId } },
        { teachers: { id: userId }, items: { id: itemId } }
      ]
    });
    if (!foundInstitution) throw new BadRequestException(InstitutionErrors.institution_not_found);
    let item = (await this.findMatching(foundInstitution.id, 1, 0, itemId))[0][0] as Item;
    if (!item) throw new Error(ItemErrors.item_not_found);

    if (!imageBuffer) {
      try {
        await this.itemRepository.update(itemId, { imageId: null });
        await this.imageService.deteleImageById(item.imageId);
      } catch (error) {}

      return;
    }

    try {
      const itemImage = await this.imageService.uploadImage(imageBuffer, filename);
      await this.itemRepository.update(itemId, { imageId: itemImage.id });
      if (item.imageId) {
        await this.imageService.deteleImageById(item.imageId);
      }
      return itemImage;
    } catch (error) {
      await this.itemRepository.update(itemId, { imageId: null });
      throw new Error(ImageErrors.image_upload_error);
    }
  }
}
