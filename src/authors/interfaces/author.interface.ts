import { Document, Types } from 'mongoose';

export interface AuthorNameVariant extends Document<string> {
  display: string;
  sorting: string;
  type: string;
}

export interface Author extends Document<string> {
  nameVariants: Types.DocumentArray<AuthorNameVariant>;
  mainVariantId: string;
}
