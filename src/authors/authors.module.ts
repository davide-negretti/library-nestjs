import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { authorSchema } from './author.schema';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Author', schema: authorSchema }]),
  ],
  controllers: [AuthorsController],
  providers: [AuthorsService],
})
export class AuthorsModule {}
