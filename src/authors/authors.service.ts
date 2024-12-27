import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RootFilterQuery } from 'mongoose';
import { CreateAuthorDto } from './dto/createAuthor.dto';
import { Author } from './interfaces/author.interface';

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

  async setMainVariant(authorId: string, mainVariantId: string) {
    // TODO: check if mainVariantId is valid
    const author = await this.authorModel.findById(authorId);
    author.mainVariantId = mainVariantId;
    return author.save();
  }

  async deleteVariantById(id: string, variantId: string) {
    return this.authorModel.findByIdAndUpdate(
      id,
      {
        $pull: {
          nameVariants: {
            _id: variantId,
          },
        },
      },
      { new: true },
    );
  }
}
