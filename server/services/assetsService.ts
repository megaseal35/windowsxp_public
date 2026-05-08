import * as AssetStorage from "./assetStorage";
import type { ImageEntry } from "../../shared/posts";

export async function uploadAsset(file: Express.Multer.File): Promise<ImageEntry> {
  return AssetStorage.writeStandaloneAsset(file);
}
