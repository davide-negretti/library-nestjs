import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PaginatedResponse } from '../models/paginated-response.interface';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/createAuthor.dto';
import { Author } from './interfaces/author.interface';

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

  @Get('/:id')
  async findById(@Param('id') id: string): Promise<Author> {
    try {
      return await this.service.findById(id);
    } catch {
      throw new NotFoundException(`Author with id ${id} not found`);
    }
  }

  @Post()
  create(@Body() body: CreateAuthorDto): Promise<Author> {
    console.log('BODY', body);
    return this.service.create(body);
  }
}
