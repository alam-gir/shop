import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from "cloudinary";
import { Readable } from "stream";
import { io } from "./../index";
import { ApiError } from "./api-response-custom";

export const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

cloudinary.config(cloudinaryConfig);

export const uploadPromises = ({
  files,
  folder,
  progressEventName,
}: {
  files: Express.Multer.File[];
  folder: string;
  progressEventName: string;
}) => {
  return files.map((file, index) => {
    return new Promise<UploadApiResponse | UploadApiErrorResponse>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as UploadApiResponse);
          }
        );

        let writeBytes = 0;
        let chunkSize = 100;
        const totalBytes = file.size;

        const readStream = new Readable();
        for (let i = 0; i < file.buffer.length; i = i + chunkSize) {
          readStream.push(file.buffer.subarray(i, i + chunkSize));
        }

        readStream.push(null);

        readStream.on("data", (chunk) => {
          writeBytes += chunk.length;
          const progress = Math.floor((writeBytes / totalBytes) * 100);
          io.emit(progressEventName, { [index]: progress });
        });

        readStream.pipe(stream);
      }
    );
  });
};

export const uploadPromise = ({
  file,
  folder,
  progressEventName,
}: {
  file: Express.Multer.File;
  folder: string;
  progressEventName: string;
}) => {
    return new Promise<UploadApiResponse | UploadApiErrorResponse>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as UploadApiResponse);
          }
        );

        let writeBytes = 0;
        let chunkSize = 100;
        const totalBytes = file.size;

        const readStream = new Readable();
        for (let i = 0; i < file.buffer.length; i = i + chunkSize) {
          readStream.push(file.buffer.subarray(i, i + chunkSize));
        }

        readStream.push(null);

        readStream.on("data", (chunk) => {
          writeBytes += chunk.length;
          const progress = Math.floor((writeBytes / totalBytes) * 100);
          io.emit(progressEventName, { progress });
        });

        readStream.pipe(stream);
      }
    );
};

export const removeFromCloudinary = async (public_id: string) => {
  try {
    await cloudinary.uploader.destroy(public_id, (error, result) => {
      if (error)
        throw new ApiError(400, "failed to delete File from cloudinary!~");
      return result;
    });
  } catch (error) {
    throw error;
  }
};

export default cloudinary;
