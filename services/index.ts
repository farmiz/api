import {
  Model,
  FilterQuery,
  PopulateOptions,
  startSession,
  UpdateWriteOpResult,
} from "mongoose";
import { formatModelPopulate, formatModelProjection } from "../helpers";
import { AuthRequest } from "../middleware";

export interface IOptions {
  limit?: number;
  sort?: string;
  skip?: number;
}
interface PopulateOpt {
  [key: string]: string[];
}
export interface IService<T> {
  findOne(
    filter: FilterQuery<T>,
    projection?: {
      includes?: (keyof T)[];
      excludes?: (keyof T)[];
    },
    populate?: any,
    options?: IOptions,
  ): Promise<T | null>;
  findMany(filter?: any): Promise<T[]>;
  updateOne(filter: FilterQuery<T>, update: any): Promise<any | null>;
  updateMany(filter: FilterQuery<T>, update: any): Promise<UpdateWriteOpResult>;
}

type FilterOpts = "$inc" | "$in" | "$dec" | "$push" | "$pull";
export abstract class BaseService<T> implements IService<T> {
  protected readonly model: Model<T>;
  readonly session;
  constructor(model: Model<T>) {
    this.model = model;
    this.session = startSession();
  }
  async _exists(filter: FilterQuery<T>) {
    return !!(await this.findOne({ ...filter, deleted: false }));
  }
  async canViewDocument(req: AuthRequest, documentId: string) {
    let filter: Record<string, any> = { _id: documentId };
    if (req.user?.role && req.user.role === "customer") {
      filter = { ...filter, userId: req.user.id };
    }
    return !!(await this.findOne(filter));
  }
  async findOne(
    filter: FilterQuery<T>,
    projection?: {
      includes?: (keyof T)[];
      excludes?: (keyof T)[];
    } | null,
    populate?: PopulateOpt,
  ): Promise<T | null> {
    let objectToProject = {};

    if (projection) {
      objectToProject = formatModelProjection<T>(
        projection.includes,
        projection.excludes,
      );
    }
    let query = this.model.findOne(filter, objectToProject);
    if (populate) {
      const populatedFields: PopulateOptions[] = formatModelPopulate(populate);
      query.populate(populatedFields);
    }
    const result = await query.exec();
    return result ? result.toObject() : result;
  }

  async findMany(
    filter?: FilterQuery<T>,
    projection?: {
      includes?: (keyof T)[];
      excludes?: (keyof T)[];
    } | null,
    populate?: PopulateOpt | string[] | null,
    options?: IOptions,
  ): Promise<T[]> {
    let objectToProject = {};

    if (projection) {
      objectToProject = formatModelProjection<T>(
        projection.includes,
        projection.excludes,
      );
    }
    let query = this.model.find(filter as FilterQuery<T>, objectToProject);
    if (populate) {
      const populatedFields: PopulateOptions[] = formatModelPopulate(populate);
      query.populate(populatedFields);
    }

    if (options && options.skip) {
      query.skip(options.skip);
    }
    if (options && options.limit) {
      query.limit(options.limit);
    }
    if (options && options.sort) {
      query.sort(options.sort);
    }
    const result = await query.exec();
    return result;
  }

  async updateOne(
    filter: FilterQuery<T>,
    update: Partial<Record<keyof T | FilterOpts, any>>,
    populate?: PopulateOpt | string[] | null,
  ): Promise<T | null> {
    const result = await this.model
      .findOneAndUpdate(filter, update, {
        new: true,
      })
      .populate(populate ? formatModelPopulate(populate) : []);
      if(result && result.toObject()){
        return result.toObject()
      }
    return null;
  }

  async updateMany(
    filter: FilterQuery<T>,
    update: Partial<Record<keyof T | FilterOpts, any>>,
  ) {
    return await this.model.updateMany(filter, update).exec();
  }
  async countDocument(filter: FilterQuery<T>): Promise<number> {
    return await this.model.countDocuments(filter);
  }
  async create(data: T): Promise<T> {
    const result = await this.model.create(data);
    return result ? result.toObject() : result;
  }
  async countDocuments(filter: FilterQuery<T>): Promise<number> {
    return await this.model.countDocuments(filter);
  }
}
