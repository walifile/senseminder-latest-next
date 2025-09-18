import appConfig from "@/config/app-config";

const { CURRENT_ENVIRONMENT } = appConfig;

export const signupFormInitialvalues = {
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+1",
  phoneNumber: "",
  cellphone: "",
  organizationName: "",
  country: "",
  password: "",
  confirmPassword: "",
  authenticator: "",
  otp: "",
  isMFAEnabled: false,
  isPaymentEnabled: false,
  paymentMethod: "",
  cardNumber: "",
  expirationDate: "",
  cvv: "",
  billingAddress: "",
};

export const signinInitialvalues = {
  email: "",
  password: "",
  rememberMe: [],
};

export const isDev = CURRENT_ENVIRONMENT === "develop";
