import axios from "axios";
import { useContext } from "react";
import { useLocation, useNavigate } from "react-router";
import { AuthContext } from "src/AuthContext";
import { ToastContext } from "src/ToastContext";
import { useMutation } from "src/query";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import EmailField from "src/components/EmailField";
import PasswordField from "src/components/PasswordField";
import Title from "src/components/Title";
import { FormProvider, useForm } from "react-hook-form";
import CardActions from "@mui/material/CardActions";
import SubmitButton from "src/components/SubmitButton";
import FormLinks from "src/components/FormLinks";

const FormSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type FormType = z.input<typeof FormSchema>;
export type ValidatedType = z.infer<typeof FormSchema>;

const useLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useContext(ToastContext);
  const { setAuthenticated } = useContext(AuthContext);
  const { mutateAsync: login } = useMutation(
    async (data: ValidatedType) => await axios.post("/v1/sessions/", data),
  );
  return async (data: ValidatedType) => {
    try {
      await login(data);
      setAuthenticated(true);
      navigate((location.state as any)?.from ?? "/");
    } catch (error: any) {
      if (error.response?.status === 401) {
        addToast("Invalid credentials", "error");
      } else {
        addToast(`Try again: ${error.response.status}`, "error");
      }
    }
  };
};

const Login = () => {
  const onSubmit = useLogin();
  const location = useLocation();

  const methods = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: (location.state as any)?.email ?? "",
      password: "",
    },
  });

  return (
    <>
      <Title title="Login" />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <EmailField fullWidth label="Email" name="email" required />
          <PasswordField
            autoComplete="password"
            fullWidth
            label="Password"
            name="password"
            required
          />
          <CardActions>
            <SubmitButton label="Login" />
            <FormLinks
              links={[
                { label: "Register", to: "/register/" },
                { label: "Reset password", to: "/forgotten-password/" },
              ]}
            />
          </CardActions>
        </form>
      </FormProvider>
    </>
  );
};
export default Login;
