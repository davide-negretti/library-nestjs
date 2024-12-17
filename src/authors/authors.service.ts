import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RootFilterQuery } from 'mongoose';
import { Author, AUTHOR_SCHEMA_NAME, AuthorDocument } from './author.schema';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(AUTHOR_SCHEMA_NAME) private authorModel: Model<Author>,
  ) {}

  create(author: AuthorDocument): Promise<AuthorDocument> {
    const authorDocument = new this.authorModel(author);
    return authorDocument.save();
  }

  find(
    query: string,
    skip?: number,
    limit?: number,
  ): Promise<AuthorDocument[]> {
    const regExp = new RegExp(`${query}`, 'i');
    const filterQuery: RootFilterQuery<Author> = {
      $or: [
        { 'name.display': regExp },
        {
          nameVariants: {
            $elemMatch: {
              display: regExp,
            },
          },
        },
      ],
    };

    return this.authorModel
      .find(filterQuery)
      .sort('name.sorting')
      .limit(limit)
      .skip(skip);
  }

  findAll(): Promise<AuthorDocument[]> {
    return this.authorModel.find().exec();
  }

  findById(id: string): Promise<AuthorDocument> {
    return this.authorModel.findById(id).exec();
  }
}
