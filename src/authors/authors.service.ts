import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RootFilterQuery } from 'mongoose';
import { Author } from './interfaces/author.interface';
import { AuthorNameVariantDto } from './dto/authorNameVariant.dto';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel('Author') private readonly authorModel: Model<Author>,
  ) {}

  /**
   * Create a new author and set the name variant as main
   * @param nameVariant the main name variant
   */
  create(nameVariant: AuthorNameVariantDto) {
    const authorDocument = new this.authorModel({
      nameVariants: [nameVariant],
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

  setMainVariant(authorId: string, mainVariantId: string) {
    // TODO: check if mainVariantId is valid
    return this.authorModel.findByIdAndUpdate(
      authorId,
      { mainVariantId },
      { new: true },
    );
  }

  async saveVariant(authorId: string, variant: AuthorNameVariantDto) {
    // TODO: check if variant exists by ID
    return await this.authorModel
      .findOneAndUpdate(
        {
          _id: authorId,
          'nameVariants._id': variant._id,
        },
        {
          $set: {
            'nameVariants.$': variant,
          },
        },
        { new: true },
      )
      .exec();
  }

  async createVariant(authorId: string, variant: AuthorNameVariantDto) {
    // TODO: check if variant exists by values
    const authorDocument = await this.authorModel.findById(authorId).exec();
    authorDocument.nameVariants.push(variant);
    return await authorDocument.save();
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
