import authReducer from "../slices/auth/auth-slice";
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
import { newsletterAPI } from "@/api/newsletterAPI";
import startVMReducer from "../slices/dcv/starting-instances-slice";
import smartPcConfigReducer from "../slices/build-pc/smart-pc-config-slice";
import { legalDocumentsAPI } from "@/api/legalDocumentsAPI";

interface RootStateType {
  auth: ReturnType<typeof authReducer>;
  dcv: ReturnType<typeof dcvReducer>;
  startVM: ReturnType<typeof startVMReducer>;
  smartPcConfig: ReturnType<typeof smartPcConfigReducer>;
  [fileManagerAPI.reducerPath]: ReturnType<typeof fileManagerAPI.reducer>;
  [vmManagementAPI.reducerPath]: ReturnType<typeof vmManagementAPI.reducer>;
  [newsletterAPI.reducerPath]: ReturnType<typeof newsletterAPI.reducer>;
  [legalDocumentsAPI.reducerPath]: ReturnType<typeof legalDocumentsAPI.reducer>;
}

const persistConfig: PersistConfig<RootStateType> = {
  key: "root",
  storage,
  whitelist: ["auth", "dcv", "startVM", "smartPcConfig"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  dcv: dcvReducer,
  startVM: startVMReducer,
  smartPcConfig: smartPcConfigReducer,
  [fileManagerAPI.reducerPath]: fileManagerAPI.reducer,
  [vmManagementAPI.reducerPath]: vmManagementAPI.reducer,
  [newsletterAPI.reducerPath]: newsletterAPI.reducer,
  [legalDocumentsAPI.reducerPath]: legalDocumentsAPI.reducer,
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
    }).concat(
      fileManagerAPI.middleware,
      vmManagementAPI.middleware,
      newsletterAPI.middleware,
      legalDocumentsAPI.middleware
    ),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
