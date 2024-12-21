import { Injectable } from '@nestjs/common';
import { Model, RootFilterQuery } from 'mongoose';
import { CreateAuthorDto } from './dto/createAuthor.dto';
import { Author } from './interfaces/author.interface';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel('Author') private readonly authorModel: Model<Author>,
  ) {}

  create(author: CreateAuthorDto) {
    // TODO: handle variants
    const authorDocument = new this.authorModel({
      nameVariants: [
        {
          display: author.name.display,
          sorting: author.name.sorting,
          details: undefined,
          script: 'Latn',
          type: 'main',
        },
      ],
    });

    authorDocument.mainVariantId = authorDocument.nameVariants[0]._id;
    return authorDocument.save();
  }

  find(query: string, skip?: number, limit?: number) {
    const regExp = new RegExp(`${query}`, 'i');
    const filterQuery: RootFilterQuery<Author> = {
      nameVariants: {
        $elemMatch: {
          display: regExp,
        },
      },
    };
    return this.authorModel.find(filterQuery).limit(limit).skip(skip).exec();
  }

  findAll() {
    return this.authorModel.find().exec();
  }

  findById(id: string) {
    return this.authorModel.findById(id).exec();
  }
}
