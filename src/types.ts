export interface ImageEntry {
  width: number | "original";
  url: string;
  localPath: string;
}

export interface Post {
  title: string;
  date: string;
  imageUrl: string;
  images: ImageEntry[];
  caption: string;
  tags: string[];
}
