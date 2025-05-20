import {
  fetchBaseQuery,
  FetchArgs,
  FetchBaseQueryError,
  BaseQueryFn,
} from "@reduxjs/toolkit/query/react";

import { BASE_URL } from "./apiConfig";
import { RootState } from "@/redux/store";

// setCredentials, logOut
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "same-origin",
  // prepareHeaders: (headers, { getState }) => {
  //   // const token = (getState() as RootState).auth.token;
  //   // if (token) {
  //   //   headers.set("authorization", `Bearer ${token}`);
  //   // }
  //   // return headers;
  // },
});

export const baseauthfunc: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
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
      //   api.dispatch(logOut());
    }
  } else if (result?.error?.status === 401) {
    // api.dispatch(logOut());
    window.location.href = "/";
  } else if (result?.meta?.response?.status === 401) {
    // api.dispatch(logOut());
    window.location.href = "/";
  } else if (customError?.originalStatus === 401) {
    // api.dispatch(logOut());
    window.location.href = "/";
  }
  return result;
};
