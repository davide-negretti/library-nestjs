import { model, Schema } from 'mongoose';

const authorNameVariantSchema = new Schema({
  display: { type: String, required: true },
  sorting: { type: String, required: true },
  type: { type: String, required: true },
  script: { type: String, default: 'Latn' },
});

export const authorSchema = new Schema({
  nameVariants: { type: [authorNameVariantSchema], required: true },
  mainVariantId: { type: Schema.Types.ObjectId, required: true },
  type: {
    type: String,
    enum: ['person', 'corporate', 'collective'],
    required: true,
  },
});

export const authorModel = model('Author', authorSchema);
