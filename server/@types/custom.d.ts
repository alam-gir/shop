import { Cart, Order, Review, User, UserProfile } from "@prisma/client";
import { Request } from "express";
import { Express } from "express";
import {upload} from "./../src/middlewares/multer.middleware"

type Profile = {
  profile: UserProfile;
};

export interface RequestWithUser<ResBody = any, ReqBody = any, ReqQuery = any>
  extends Request<{}, ResBody, ReqBody, ReqQuery> {
  user?: User | (User & Profile) | null;
}


// export interface IFile extends File {
//     fieldname: string;
//     originalname: string;
//     encoding: string;
//     mimetype: string;
//     destination: string;
//     filename: string;
//     path: string;
//     size: number;
//   }

// export interface ICloudinaryFile {
//     asset_id: string,
//     public_id: string,
//     version: number,
//     version_id: string,
//     signature: string,
//     resource_type: string,
//     created_at: date,
//     tags: string[],
//     bytes: number,
//     type: string,
//     etag: string,
//     placeholder: boolean,
//     url: string,
//     secure_url: string,
//     folder: string,
//     access_mode: string,
//     original_filename: string,
//     api_key: string
// }
