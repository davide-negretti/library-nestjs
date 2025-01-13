import { Document, Types } from 'mongoose';

export type authorType = 'person' | 'corporate' | 'collective';
export type authorNameVariantType = 'original' | 'short' | 'pseudonym';
export type authorNameVariantLocalization =
  | 'original'
  | 'transliterated'
  | 'translated';

export interface AuthorNameVariant extends Document<string> {
  display: string;
  sorting: string;
  type: authorNameVariantType;
  localization: authorNameVariantLocalization;
  script?: string;
  language?: string;
}

export interface Author extends Document<string> {
  nameVariants: Types.DocumentArray<AuthorNameVariant>;
  mainVariantId: string;
  type: authorType;
}
