import { toast, ToastOptions } from "react-toastify";

type ToastType = "success" | "error" | "info" | "warning";

const useToast = () => {
  const showToast = (message: string, type: ToastType = "success") => {
    const options: ToastOptions = {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      style: {
        fontSize: "14px",
        fontWeight: 500,
      },
    };

    switch (type) {
      case "success":
        toast.success(message, options);
        break;
      case "error":
        toast.error(message, {
          ...options,
          closeButton: true,
        });
        break;
      case "info":
        toast.info(message, options);
        break;
      case "warning":
        toast.warning(message, options);
        break;
      default:
        toast(message, options);
    }
  };

  const dismissAllToasts = () => {
    toast.dismiss();
  };

  return {
    showToast,
    dismissAllToasts,
  };
};

export default useToast;
