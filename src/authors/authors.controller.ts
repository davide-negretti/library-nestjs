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
import { AuthorsService } from './authors.service';
import { AuthorNameVariantDto } from './dto/author-name-variant.dto';
import { NewAuthorDto } from './dto/new-author.dto';
import { Author } from './interfaces/author.interface';

interface PaginationParameters {
  skip: number;
  limit: number;
}

@Controller('authors')
export class AuthorsController {
  constructor(private service: AuthorsService) {}

  @Get()
  async findAuthors(
    @Query('q') query: string,
    @Query('from') from: string,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ) {
    const { skip, limit } = this.paginationParameters(from, page, pageSize);
    const res = await this.service.paginatedFindAuthors(query, +skip, +limit);
    return res[0];
  }

  @Get('/variants')
  async findNameVariants(
    @Query('q') query: string,
    @Query('from') from: string,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ) {
    const { skip, limit } = this.paginationParameters(from, page, pageSize);
    const res = await this.service.paginatedFindAuthorNameVariants(
      query,
      +skip,
      +limit,
    );
    return res[0];
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
  create(@Body() author: NewAuthorDto): Promise<Author> {
    return this.service.create(author);
  }

  private paginationParameters(
    from: string,
    page: string,
    pageSize: string,
  ): PaginationParameters {
    if (!!from && !!page) {
      throw new BadRequestException(
        `Invalid parameters: specify either 'from' or 'page'`,
      );
    }
    if (from && (isNaN(+from) || +from < 0 || +from % +pageSize > 0)) {
      throw new BadRequestException(
        `Invalid parameter: from=${from} should be a number >= 0 and multiple of ${pageSize}`,
      );
    }
    if (page && (isNaN(+page) || +page < 1)) {
      throw new BadRequestException(
        `Invalid parameter: page=${page} should be a number >= 1`,
      );
    }
    if (pageSize && (isNaN(+pageSize) || +pageSize < 1)) {
      throw new BadRequestException(
        `Invalid parameter: pageSize=${pageSize} should be a number >= 1`,
      );
    }

    if (!from && !page) {
      from = '0';
    }
    if (!pageSize) {
      pageSize = '10';
    }
    return { skip: from ? +from : +pageSize * (+page - 1), limit: +pageSize };
  }
}
