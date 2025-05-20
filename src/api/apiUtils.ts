import {
  fetchBaseQuery,
  FetchArgs,
  FetchBaseQueryError,
  BaseQueryFn,
} from "@reduxjs/toolkit/query/react";

import { BASE_URL } from "./apiConfig";
import { RootState } from "@/redux/store";

// Function to create a base query with optional authentication (default: true)
const createBaseQuery = (useAuth: boolean = true) =>
  fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "same-origin",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;

      // If authentication is disabled, return headers without modifying
      if (!useAuth) {
        return headers;
      }

      // Attach token if available
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  });

// Main query function with re-authentication support
export const baseQueryWithReauth =
  (
    useAuth: boolean = true
  ): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =>
  async (args, api, extraOptions) => {
    const baseQuery = createBaseQuery(useAuth);
    let result = await baseQuery(args, api, extraOptions);

    const customError = result.error as FetchBaseQueryError & {
      originalStatus?: number;
    };

    if (result?.error?.status === 403) {
      const refreshResult = await baseQuery("/refresh", api, extraOptions);
      if (refreshResult?.data) {
        const user = (api.getState() as RootState).auth.user;
        if (user) {
          // api.dispatch(setCredentials({ ...refreshResult.data, user }));
          result = await baseQuery(args, api, extraOptions);
        } else {
          // api.dispatch(logOut());
          window.location.href = "/";
        }
      } else {
        // api.dispatch(logOut());
      }
    } else if (
      result?.error?.status === 401 ||
      result?.meta?.response?.status === 401 ||
      customError?.originalStatus === 401
    ) {
      // api.dispatch(logOut());
      window.location.href = "/";
    }

    return result;
  };
