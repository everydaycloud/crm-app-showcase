import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useEffect } from "react";
import { useParams } from "react-router";
import { Navigate } from "react-router-dom";

import { ToastContext } from "src/ToastContext";

interface IParams {
  token?: string;
}

const ConfirmEmail = () => {
  const { addToast } = useContext(ToastContext);
  const params = useParams() as IParams;
  const token = params.token ?? "";

  const { mutate } = useMutation({
    mutationFn: async () => await axios.put("/v1/staff/email/", { token }),

    onSuccess: () => {
      addToast("Thanks", "success");
      return <Navigate to="/" />;
    },

    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          if (error.response?.data.code === "TOKEN_INVALID") {
            addToast("Invalid token", "error");
          } else if (error.response?.data.code === "TOKEN_EXPIRED") {
            addToast("Token expired", "error");
          }
        } else {
          addToast("Try again", "error");
        }
      }
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  return <Navigate to="/" />;
};

export default ConfirmEmail;
