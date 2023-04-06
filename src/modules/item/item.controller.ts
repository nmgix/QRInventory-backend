import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ItemSwagger } from './swagger.docs';

@ApiTags(ItemSwagger.tag)
@Controller('item')
export class ItemController {}
