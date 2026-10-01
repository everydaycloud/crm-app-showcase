import axios from "axios";
import { useContext } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "src/query";
import { ToastContext } from "src/ToastContext";
import { useLocation } from "react-router";
import EmailField from "src/components/EmailField";
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
  email: z.string().email(),
});

type FormType = z.input<typeof FormSchema>;
export type ValidatedType = z.infer<typeof FormSchema>;

const useForgottenPassword = () => {
  const navigate = useNavigate();
  const { addToast } = useContext(ToastContext);

  const { mutateAsync: forgottenPassword } = useMutation(
    async (data: ValidatedType) =>
      await axios.post("/v1/staff/forgotten-password/", data),
  );
  return async (data: ValidatedType) => {
    try {
      await forgottenPassword(data);
      addToast("Reset link sent to your email", "success");
      navigate("/login/");
    } catch {
      addToast("Try again", "error");
    }
  };
};

const ForgottenPassword = () => {
  const onSubmit = useForgottenPassword();
  const location = useLocation();

  const methods = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: (location.state as any)?.email ?? "",
    },
  });

  return (
    <>
      <Title title="Forgotten password" />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Card>
            <CardContent>
              <EmailField fullWidth label="Email" name="email" required />
            </CardContent>
            <Divider />
            <CardActions>
              <SubmitButton label="Send Link" />
              <FormLinks
                links={[
                  { label: "Log in", to: "/login/" },
                  { label: "Register", to: "/register/" },
                ]}
              />
            </CardActions>
          </Card>
        </form>
      </FormProvider>
    </>
  );
};

export default ForgottenPassword;
