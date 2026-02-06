/* eslint perfectionist/sort-imports: "off" */

import type { PersistConfig } from "redux-persist";

import { userAPI } from "@/api/user";
import { billingAPI } from "@/api/billing";
import appConfig from "@/config/app-config";
import { feedbackAPI } from "@/api/feedback";
import { ticketsAPI } from "@/api/supportAPI";
import { realtimeAPI } from "@/api/realtime";
import { mfaRecoveryAPI } from "@/api/mfa-recovery";
import { newsletterAPI } from "@/api/newsletterAPI";
import { vmManagementAPI } from "@/api/vmManagement";
import { fileManagerAPI } from "@/api/fileManagerAPI";
import { firstTimeSetupAPI } from "@/api/first-time-setup";
import { smartPCIdleSettingsAPI } from "@/api/smartPC-Idle-settings";
import { legalDocumentsAPI } from "@/api/legalDocumentsAPI";
import { smartPCConfigAPI } from "@/api/pc-config-api";

import storage from "redux-persist/lib/storage";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PURGE,
  PERSIST,
  REGISTER,
  REHYDRATE,
  persistStore,
  persistReducer,
} from "redux-persist";

import dcvReducer from "../slices/dcv/dcv-slice";
import authReducer from "../slices/auth/auth-slice";
import feedbackReducer from "../slices/feedback/feedback-slice";
import startVMReducer from "../slices/dcv/starting-instances-slice";
import smartPcConfigReducer from "../slices/build-pc/smart-pc-config-slice";

const { NODE_ENV } = appConfig;

interface RootStateType {
  auth: ReturnType<typeof authReducer>;
  feedback: ReturnType<typeof feedbackReducer>;
  dcv: ReturnType<typeof dcvReducer>;
  startVM: ReturnType<typeof startVMReducer>;
  smartPcConfig: ReturnType<typeof smartPcConfigReducer>;
  [ticketsAPI.reducerPath]: ReturnType<typeof ticketsAPI.reducer>;
  [fileManagerAPI.reducerPath]: ReturnType<typeof fileManagerAPI.reducer>;
  [vmManagementAPI.reducerPath]: ReturnType<typeof vmManagementAPI.reducer>;
  [newsletterAPI.reducerPath]: ReturnType<typeof newsletterAPI.reducer>;
  [legalDocumentsAPI.reducerPath]: ReturnType<typeof legalDocumentsAPI.reducer>;
  [billingAPI.reducerPath]: ReturnType<typeof billingAPI.reducer>;
  [userAPI.reducerPath]: ReturnType<typeof userAPI.reducer>;
  [feedbackAPI.reducerPath]: ReturnType<typeof feedbackAPI.reducer>;
  [firstTimeSetupAPI.reducerPath]: ReturnType<typeof firstTimeSetupAPI.reducer>;
  [realtimeAPI.reducerPath]: ReturnType<typeof realtimeAPI.reducer>;
  [mfaRecoveryAPI.reducerPath]: ReturnType<typeof mfaRecoveryAPI.reducer>;
  [smartPCIdleSettingsAPI.reducerPath]: ReturnType<typeof smartPCIdleSettingsAPI.reducer>;
  [smartPCConfigAPI.reducerPath]: ReturnType<typeof smartPCConfigAPI.reducer>;
}

const persistConfig: PersistConfig<RootStateType> = {
  key: "root",
  storage,
  whitelist: ["auth", "dcv", "startVM", "smartPcConfig"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  feedback: feedbackReducer,
  dcv: dcvReducer,
  startVM: startVMReducer,
  smartPcConfig: smartPcConfigReducer,
  [fileManagerAPI.reducerPath]: fileManagerAPI.reducer,
  [vmManagementAPI.reducerPath]: vmManagementAPI.reducer,
  [ticketsAPI.reducerPath]: ticketsAPI.reducer,
  [newsletterAPI.reducerPath]: newsletterAPI.reducer,
  [legalDocumentsAPI.reducerPath]: legalDocumentsAPI.reducer,
  [billingAPI.reducerPath]: billingAPI.reducer,
  [userAPI.reducerPath]: userAPI.reducer,
  [feedbackAPI.reducerPath]: feedbackAPI.reducer,
  [firstTimeSetupAPI.reducerPath]: firstTimeSetupAPI.reducer,
  [realtimeAPI.reducerPath]: realtimeAPI.reducer,
  [mfaRecoveryAPI.reducerPath]: mfaRecoveryAPI.reducer,
  [smartPCIdleSettingsAPI.reducerPath]: smartPCIdleSettingsAPI.reducer,
  [smartPCConfigAPI.reducerPath]: smartPCConfigAPI.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      fileManagerAPI.middleware,
      vmManagementAPI.middleware,
      newsletterAPI.middleware,
      legalDocumentsAPI.middleware,
      ticketsAPI.middleware,
      billingAPI.middleware,
      userAPI.middleware,
      feedbackAPI.middleware,
      firstTimeSetupAPI.middleware,
      realtimeAPI.middleware,
      mfaRecoveryAPI.middleware,
      smartPCIdleSettingsAPI.middleware,
      smartPCConfigAPI.middleware
    ),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
