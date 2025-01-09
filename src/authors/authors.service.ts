import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage } from 'mongoose';
import { AuthorNameVariantDto } from './dto/author-name-variant.dto';
import { NewAuthorDto } from './dto/new-author.dto';
import { Author } from './interfaces/author.interface';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel('Author') private readonly authorModel: Model<Author>,
  ) {}

  paginatedFindAuthors(
    query: string | undefined = undefined,
    skip = 0,
    limit = 20,
  ) {
    const queryStages: PipelineStage[] = [];
    const words = query?.split(' ');
    if (words.length) {
      queryStages.push(this.authorMatchStage(words));
    }
    return this.authorModel
      .aggregate([
        ...queryStages,
        this.addMainNameVariantStage(words),
        {
          $project: {
            _id: 1,
            mainNameVariant: 1,
            matchingNameVariants: words.length ? 1 : 0,
          },
        },
        {
          $sort: {
            'mainNameVariant.sorting': 1,
          },
        },
        this.collectDataStage(skip, limit),
        this.addPaginationDataStage(skip, limit),
      ])
      .exec();
  }

  paginatedFindAuthorNameVariants(
    query: string | undefined = undefined,
    skip = 0,
    limit = 20,
  ) {
    const queryStages: PipelineStage[] = [];
    const words = query?.split(' ');
    if (words.length) {
      queryStages.push(this.authorMatchStage(words));
      queryStages.push(this.authorNameVariantFilterStage(words));
    }
    return this.authorModel
      .aggregate([
        ...queryStages,
        { $unwind: '$nameVariants' },
        {
          $project: {
            mergedFields: {
              $mergeObjects: [{ authorId: '$_id' }, '$nameVariants'],
            },
          },
        },
        {
          $replaceRoot: { newRoot: '$mergedFields' },
        },
        {
          $sort: {
            sorting: 1,
          },
        },
        this.collectDataStage(skip, limit),
        this.addPaginationDataStage(skip, limit),
      ])
      .exec();
  }

  create(author: NewAuthorDto) {
    const authorDocument = new this.authorModel({
      nameVariants: [
        {
          display: author.display,
          sorting: author.sorting,
          type: author.mainNameVariantType,
        },
      ],
      type: author.authorType,
    });

    authorDocument.mainVariantId = authorDocument.nameVariants[0]._id;
    return authorDocument.save();
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

  private addMainNameVariantStage(matches: string[]): PipelineStage.AddFields {
    const fields = {
      mainNameVariant: {
        $arrayElemAt: [
          {
            $filter: {
              input: '$nameVariants',
              as: 'variant',
              cond: { $eq: ['$$variant._id', '$mainVariantId'] },
            },
          },
          0,
        ],
      },
    };

    // If a search has been performed, add all matching variants (except for the main one)
    if (matches.length) {
      fields['matchingNameVariants'] = {
        $filter: {
          input: '$nameVariants',
          as: 'variant',
          cond: {
            $and: [
              { $ne: ['$$variant._id', '$mainVariantId'] },
              ...matches.map((match) => ({
                $regexMatch: {
                  input: '$$variant.display',
                  regex: match,
                  options: 'i',
                },
              })),
            ],
          },
        },
      };
    }
    return {
      $addFields: fields,
    };
  }

  private authorMatchStage(matches: string[]): PipelineStage.Match {
    const fq: FilterQuery<Author> = {
      nameVariants: {
        $elemMatch: {
          $and: matches.map((match) => ({
            display: { $regex: match, $options: 'i' },
          })),
        },
      },
    };
    return {
      $match: fq,
    };
  }

  private authorNameVariantFilterStage(
    matches: string[],
  ): PipelineStage.Project {
    const fq: FilterQuery<Author> = {
      nameVariants: {
        $filter: {
          input: '$nameVariants',
          as: 'variant',
          cond: {
            $and: matches.map((match) => ({
              $regexMatch: {
                input: '$$variant.display',
                regex: match,
                options: 'i',
              },
            })),
          },
        },
      },
    };
    return {
      $project: fq,
    };
  }

  private collectDataStage(skip: number, limit: number): PipelineStage.Facet {
    return {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        pagination: [{ $count: 'totalCount' }],
      },
    };
  }

  private addPaginationDataStage(
    skip: number,
    limit: number,
  ): PipelineStage.AddFields {
    return {
      $addFields: {
        pagination: {
          $mergeObjects: [
            { skip, limit },
            { totalCount: { $arrayElemAt: ['$pagination.totalCount', 0] } },
            {
              isLastPage: {
                $lte: [
                  { $arrayElemAt: ['$pagination.totalCount', 0] },
                  skip + limit,
                ],
              },
            },
            {
              currentPage: {
                $add: [
                  {
                    $ceil: {
                      $divide: [skip, limit],
                    },
                  },
                  1,
                ],
              },
            },
            {
              totalPages: {
                $ceil: {
                  $divide: [
                    { $arrayElemAt: ['$pagination.totalCount', 0] },
                    limit,
                  ],
                },
              },
            },
          ],
        },
      },
    };
  }
}
