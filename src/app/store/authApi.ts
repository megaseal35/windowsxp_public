import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { LoginRequest, SessionStatus } from "../../../shared/auth";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/auth/", credentials: "include" }),
  tagTypes: ["Auth"],
  endpoints: (build) => ({
    getMe: build.query<SessionStatus, void>({
      query: () => "me",
      providesTags: ["Auth"],
    }),
    login: build.mutation<SessionStatus, LoginRequest>({
      query: (body) => ({ url: "login", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    logout: build.mutation<SessionStatus, void>({
      query: () => ({ url: "logout", method: "POST" }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const { useGetMeQuery, useLoginMutation, useLogoutMutation } = authApi;
