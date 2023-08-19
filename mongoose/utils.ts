import { Schema } from "mongoose";
import { v4 as uuid } from "uuid";
export const defaultPlugin = function (schema: Schema) {
  schema.add({
    _id: {
      type: String,
      default: uuid,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    deleted: {
      type: Boolean,
      default: false,
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    deletedBy: {
      type: String,
      ref: "User",
      required: false,
    },
    createdBy: {
      type: String,
      ref: "User",
      required: false,
    },
  });
};
