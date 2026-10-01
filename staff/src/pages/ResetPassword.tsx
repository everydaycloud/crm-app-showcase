import axios from "axios";
import { useContext } from "react";
import { useNavigate, useParams } from "react-router";
import LazyPasswordWithStrengthField from "src/components/LazyPasswordWithStrengthField";
import Title from "src/components/Title";
import { useMutation } from "src/query";
import { ToastContext } from "src/ToastContext";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import CardActions from "@mui/material/CardActions";
import SubmitButton from "src/components/SubmitButton";
import FormLinks from "src/components/FormLinks";

interface IParams {
  token?: string;
}

const FormSchema = z.object({
  password: z.string(),
});

type FormType = z.input<typeof FormSchema>;
export type ValidatedType = z.infer<typeof FormSchema>;

const useResetPassword = () => {
  const navigate = useNavigate();
  const params = useParams() as IParams;
  const token = params.token ?? "";
  const { addToast } = useContext(ToastContext);

  const { mutateAsync: reset } = useMutation(
    async (password: string) =>
      await axios.put("/v1/staff/reset-password/", { password, token }),
  );
  return async (data: ValidatedType) => {
    try {
      await reset(data.password);
      addToast("Success", "success");
      navigate("/login/");
    } catch (error: any) {
      if (error.response?.status === 400) {
        if (error.response?.data.code === "WEAK_PASSWORD") {
          addToast("Password is too weak", "error");
        } else if (error.response?.data.code === "TOKEN_INVALID") {
          addToast("Invalid token", "error");
        } else if (error.response?.data.code === "TOKEN_EXPIRED") {
          addToast("Token expired", "error");
        }
      } else {
        addToast("Try again", "error");
      }
    }
  };
};

const ResetPassword = () => {
  const onSubmit = useResetPassword();
  const methods = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: { password: "" },
  });
  return (
    <>
      <Title title="Reset password" />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Card>
            <CardContent>
              <LazyPasswordWithStrengthField
                autoComplete="new-password"
                fullWidth
                label="Password"
                name="password"
                required
              />
            </CardContent>
            <Divider />
            <CardActions>
              <SubmitButton label="Save" />
              <FormLinks links={[{ label: "Log in", to: "/login/" }]} />
            </CardActions>
          </Card>
        </form>
      </FormProvider>
    </>
  );
};

export default ResetPassword;
