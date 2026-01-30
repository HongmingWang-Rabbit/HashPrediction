import { toast, Id, TypeOptions } from "react-toastify";

export const txToast = {
  pending(msg: string): Id {
    return toast.loading(msg);
  },

  success(id: Id, msg: string) {
    toast.update(id, {
      render: msg,
      type: "success" as TypeOptions,
      isLoading: false,
      autoClose: 5000,
    });
  },

  error(id: Id, msg: string) {
    toast.update(id, {
      render: msg,
      type: "error" as TypeOptions,
      isLoading: false,
      autoClose: 7000,
    });
  },
};
