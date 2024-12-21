import { Document } from 'mongoose';

interface AuthorNameVariant extends Document<string> {
  display: string;
  sorting: string;
  type: string;
}

export interface Author extends Document<string> {
  nameVariants: AuthorNameVariant[];
  mainVariantId: string;
}
