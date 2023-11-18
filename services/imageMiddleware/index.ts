import multer, { StorageEngine } from "multer";

type DiskType = "local" | "memory";
class FileMiddleware {
  private multer: typeof multer;
  constructor() {
    this.multer = multer;
  }
  configureLocalStorage(fileDestination?: string) {
    return this.multer.diskStorage({
      destination: ({}, {}, cb) => {
        cb(null, fileDestination as string);
      },
      filename: ({}, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix);
      },
    });
  }

  setFileSizeLimit(limit: number = 5) {
    return limit * 1024 * 1024;
  }

  fileFilter() {
    return ({}, file: any, cb: Function) => {
      if (!file.originalname.match(/\.(JPG|jpg|jpeg|png|gif)$/)) {
        return cb(new Error("Only image files are allowed!"), false);
      }
      cb(undefined, true);
    };
  }

  setStorageConfig(diskType: DiskType, destination: string | null) {
    const diskTypeMapper: { [key in DiskType]?: StorageEngine } = {
      ...(destination && { local: this.configureLocalStorage(destination) }),
      memory: multer.memoryStorage(),
    };
    return diskTypeMapper[diskType];
  }

  fileMiddleware(
    diskType: DiskType,
    destination: string | null,
    fileSize?: number,
  ) {
    return this.multer({
      fileFilter: this.fileFilter(),
      storage: this.setStorageConfig(diskType, destination),
      limits: {
        fileSize: this.setFileSizeLimit(fileSize),
      },
    }).single("file");
  }

  getMulterInstance() {
    return this.multer;
  }
}

export const fileMiddleware = new FileMiddleware();
