import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  CreatePostV2Input,
  ImageEntry,
  PostV2DTO,
  UpdatePostV2Input,
} from "../../../shared/posts";

export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v2", credentials: "include" }),
  tagTypes: ["Post"],
  endpoints: (build) => ({
    getPosts: build.query<PostV2DTO[], { limit?: number; offset?: number } | void>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args?.limit !== undefined) params.set("limit", String(args.limit));
        if (args?.offset !== undefined) params.set("offset", String(args.offset));
        const qs = params.toString();
        return `posts${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: "Post" as const, id: p.id })),
              { type: "Post" as const, id: "LIST" },
            ]
          : [{ type: "Post" as const, id: "LIST" }],
    }),

    getPost: build.query<PostV2DTO, number>({
      query: (id) => `posts/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Post", id }],
    }),

    createPost: build.mutation<PostV2DTO, CreatePostV2Input>({
      query: (input) => ({
        url: "posts",
        method: "POST",
        body: input,
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),

    updatePost: build.mutation<PostV2DTO, { id: number; patch: UpdatePostV2Input }>({
      query: ({ id, patch }) => ({
        url: `posts/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Post", id },
        { type: "Post", id: "LIST" },
      ],
    }),

    deletePost: build.mutation<{ ok: true }, number>({
      query: (id) => ({ url: `posts/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _err, id) => [
        { type: "Post", id },
        { type: "Post", id: "LIST" },
      ],
    }),

    uploadAsset: build.mutation<ImageEntry, File>({
      query: (file) => {
        const fd = new FormData();
        fd.append("file", file);
        return { url: "assets", method: "POST", body: fd };
      },
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useUploadAssetMutation,
} = postsApi;
