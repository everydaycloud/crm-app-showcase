import axios from "axios";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "src/ToastContext";
import { useMutation } from "src/query";
import LazyPasswordWithStrengthField from "src/components/LazyPasswordWithStrengthField";
import PasswordField from "src/components/PasswordField";
import Title from "src/components/Title";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import CardActions from "@mui/material/CardActions";
import SubmitButton from "src/components/SubmitButton";
import FormLinks from "src/components/FormLinks";

const FormSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
});

type FormType = z.input<typeof FormSchema>;
export type ValidatedType = z.infer<typeof FormSchema>;

const useChangePassword = () => {
  const { addToast } = useContext(ToastContext);
  const { mutateAsync: changePassword } = useMutation(
    async (data: ValidatedType) => await axios.put("/v1/staff/password/", data),
  );
  const navigate = useNavigate();

  return async (data: ValidatedType) => {
    try {
      await changePassword(data);
      addToast("Changed", "success");
      navigate("/");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          addToast("Password is too weak", "error");
        } else if (error.response?.status === 401) {
          addToast("Incorrect password", "error");
        }
      } else {
        addToast("Try again", "error");
      }
    }
  };
};

const ChangePassword = () => {
  const onSubmit = useChangePassword();
  const methods = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });
  return (
    <>
      <Title title="Change Password" />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Card>
            <CardContent>
              <PasswordField
                autoComplete="current-password"
                fullWidth
                label="Current password"
                name="currentPassword"
                required
              />
              <LazyPasswordWithStrengthField
                autoComplete="new-password"
                fullWidth
                label="New password"
                name="newPassword"
                required
              />
            </CardContent>
            <Divider />
            <CardActions>
              <SubmitButton label="Save" />
              <FormLinks links={[{ label: "Back", to: "/" }]} />
            </CardActions>
          </Card>
        </form>
      </FormProvider>
    </>
  );
};
export default ChangePassword;
