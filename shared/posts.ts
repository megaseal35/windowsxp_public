export interface ImageEntry {
  path: string;
  mime: string;
  width?: number | "original";
  url?: string;
  localPath?: string;
}

export interface PostDTO {
  id: number;
  title: string;
  createdAt: number;
  updatedAt: number;
  imageUrl: string;
  images: ImageEntry[];
  caption: string;
  tags: string[];
}

export interface TipTapDoc {
  type: "doc";
  content?: any[];
}

export interface PostV2DTO {
  id: number;
  legacyPostId: number | null;
  title: string;
  content: TipTapDoc;
  assets: ImageEntry[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CreatePostV2Input {
  title: string;
  content?: TipTapDoc;
  tags: string[];
  date?: string;
}

export interface UpdatePostV2Input {
  title?: string;
  content?: TipTapDoc;
  tags?: string[];
}

export interface CreatePostInput {
  title: string;
  caption: string;
  tags: string[];
  date?: string
}

export interface UpdatePostInput {
  title?: string;
  caption?: string;
  tags?: string[];
}
