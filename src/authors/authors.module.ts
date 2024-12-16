import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AUTHOR_SCHEMA_NAME, AuthorSchema } from './author.schema';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AUTHOR_SCHEMA_NAME, schema: AuthorSchema },
    ]),
  ],
  controllers: [AuthorsController],
  providers: [AuthorsService],
})
export class AuthorsModule {}
