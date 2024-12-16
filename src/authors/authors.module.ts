import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AUTHOR_SCHEMA_NAME, AuthorSchema } from './author.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AUTHOR_SCHEMA_NAME, schema: AuthorSchema },
    ]),
  ],
})
export class AuthorsModule {}
