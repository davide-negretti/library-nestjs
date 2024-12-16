import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const AUTHOR_SCHEMA_NAME = 'Author';

export type AuthorDocument = HydratedDocument<Author>;

@Schema()
export class AuthorNameVariant {
  @Prop({ required: true })
  display: string;

  @Prop({ required: true })
  sorting: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: Map, of: String })
  details: Map<string, string>;

  @Prop({ required: true })
  script: string;
}

@Schema()
export class Author {
  @Prop(
    raw({
      display: { type: String, required: true },
      sorting: { type: String, required: true },
    }),
  )
  name: string;

  @Prop([AuthorNameVariant])
  nameVariants: [AuthorNameVariant];
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
