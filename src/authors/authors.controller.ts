import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AuthorDocument } from './author.schema';
import { AuthorsService } from './authors.service';

@Controller('authors')
export class AuthorsController {
  constructor(private service: AuthorsService) {}

  @Get()
  findAll(): Promise<AuthorDocument[]> {
    return this.service.findAll();
  }

  @Get('/search')
  search(@Query('q') query: string): Promise<AuthorDocument[]> {
    return this.service.find(query);
  }

  @Get('/:id')
  async findById(@Param('id') id: string): Promise<AuthorDocument> {
    try {
      return await this.service.findById(id);
    } catch {
      throw new NotFoundException(`Author with id ${id} not found`);
    }
  }

  @Post()
  create(@Body() body: AuthorDocument): Promise<AuthorDocument> {
    return this.service.create(body);
  }
}
