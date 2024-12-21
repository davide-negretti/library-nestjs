import { model, Schema, Types } from 'mongoose';

const authorNameVariantSchema = new Schema({
  display: { type: String, required: true },
  sorting: { type: String, required: true },
  type: { type: String, required: true },
  script: { type: String, default: 'Latn' },
});

export const authorSchema = new Schema({
  nameVariants: [authorNameVariantSchema],
  mainVariantId: { type: Types.ObjectId, required: true },
});

export const authorModel = model('Author', authorSchema);
