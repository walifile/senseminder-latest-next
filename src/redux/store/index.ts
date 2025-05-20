import authReducer from "../slices/auth-slice";
import dcvReducer from "../slices/dcv/dcv-slice";
import { fileManagerAPI } from "@/api/fileManagerAPI";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { vmManagementAPI } from "@/api/vmManagement";

interface RootStateType {
  auth: ReturnType<typeof authReducer>;
  dcv: ReturnType<typeof dcvReducer>;
  [fileManagerAPI.reducerPath]: ReturnType<typeof fileManagerAPI.reducer>;
  [vmManagementAPI.reducerPath]: ReturnType<typeof vmManagementAPI.reducer>;
}

const persistConfig: PersistConfig<RootStateType> = {
  key: "root",
  storage,
  whitelist: ["auth", "dcv"], // Only those reducers which needs to be persist like auth info of user
};

const rootReducer = combineReducers({
  auth: authReducer,
  dcv: dcvReducer,
  [fileManagerAPI.reducerPath]: fileManagerAPI.reducer,
  [vmManagementAPI.reducerPath]: vmManagementAPI.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(fileManagerAPI.middleware, vmManagementAPI.middleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
