import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PaginatedResponse } from '../models/paginated-response.interface';
import { AuthorsService } from './authors.service';
import { Author } from './interfaces/author.interface';
import { AuthorNameVariantDto } from './dto/authorNameVariant.dto';

@Controller('authors')
export class AuthorsController {
  constructor(private service: AuthorsService) {}

  @Get()
  findAll(): Promise<Author[]> {
    return this.service.findAll();
  }

  @Get('/search')
  async search(
    @Query('q') query: string,
    @Query('from') startFrom = '0',
    @Query('size') pageSize = '20',
  ): Promise<PaginatedResponse<Author>> {
    if (isNaN(+startFrom) || +startFrom < 0) {
      throw new BadRequestException(
        `Invalid parameter: startFrom=${startFrom}`,
      );
    }
    if (isNaN(+pageSize) || +pageSize < 1) {
      throw new BadRequestException(`Invalid parameter: pageSize=${pageSize}`);
    }
    const responseData: Author[] = await this.service.find(
      query,
      +startFrom,
      +pageSize,
    );
    return {
      data: responseData,
      startFrom: +startFrom,
      pageSize: +pageSize,
    } as PaginatedResponse<Author>;
  }

  @Put('/:id/main-variant')
  async setMainVariant(
    @Param('id') id: string,
    @Body() body: { mainVariantId: string } | Author,
  ): Promise<Author> {
    return this.service.setMainVariant(id, body.mainVariantId);
  }

  @Delete('/:id/variants/:variantId')
  async deleteVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
  ) {
    return this.service.deleteVariantById(id, variantId);
  }

  @Put('/:id/variants')
  async saveVariant(
    @Param('id') authorId: string,
    @Body() body: AuthorNameVariantDto,
  ) {
    return this.service.saveVariant(authorId, body);
  }

  @Post('/:id/variants')
  createVariant(
    @Param('id') authorId: string,
    @Body() body: AuthorNameVariantDto,
  ): Promise<Author> {
    return this.service.createVariant(authorId, body);
  }

  @Get('/:id')
  async findById(@Param('id') id: string): Promise<Author> {
    try {
      return await this.service.findById(id);
    } catch {
      throw new NotFoundException(`Author with id ${id} not found`);
    }
  }

  @Post()
  create(@Body() nameVariant: AuthorNameVariantDto): Promise<Author> {
    return this.service.create(nameVariant);
  }
}
