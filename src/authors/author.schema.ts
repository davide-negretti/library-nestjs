import { model, Schema } from 'mongoose';

export const authorTypes = ['person', 'corporate', 'collective'];
export const authorNameVariantTypes = ['original', 'short', 'pseudonym'];
export const localizationTypes = ['original', 'transliterated', 'translated'];

const authorNameVariantSchema = new Schema({
  display: { type: String, required: true },
  sorting: { type: String, required: true },
  type: {
    type: String,
    enum: authorNameVariantTypes,
    required: true,
  },
  localization: { type: String, enum: localizationTypes, required: true },
  script: { type: String, required: false },
  language: { type: String, required: false },
});

export const authorSchema = new Schema({
  nameVariants: { type: [authorNameVariantSchema], required: true },
  mainVariantId: { type: Schema.Types.ObjectId, required: true },
  type: {
    type: String,
    enum: authorTypes,
    required: true,
  },
});

export const authorModel = model('Author', authorSchema);
