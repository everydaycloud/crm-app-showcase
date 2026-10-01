import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import axios from "axios";
import { useContext } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "src/query";
import { ToastContext } from "src/ToastContext";
import Title from "src/components/Title";
import EmailField from "src/components/EmailField";
import LazyPasswordWithStrengthField from "src/components/LazyPasswordWithStrengthField";
import SubmitButton from "src/components/SubmitButton";
import FormLinks from "src/components/FormLinks";
import { useNavigate } from "react-router-dom";

const FormSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type FormType = z.input<typeof FormSchema>;
export type ValidatedType = z.infer<typeof FormSchema>;

const useRegister = () => {
  const { addToast } = useContext(ToastContext);
  const { mutateAsync: register } = useMutation(
    async (data: ValidatedType) => await axios.post("/v1/staff/", data),
  );
  const navigate = useNavigate();

  return async (data: ValidatedType) => {
    try {
      await register(data);
      addToast("Registered", "success");
      navigate("/login/");
    } catch (error: any) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 400 &&
        error.response?.data.code === "WEAK_PASSWORD"
      ) {
        addToast("Weak password", "error");
      } else {
        addToast(`Error:${error}`, "error");
      }
    }
  };
};

const Register = () => {
  const methods = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useRegister();
  return (
    <>
      <Title title="Register" />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Card>
            <CardContent>
              <EmailField fullWidth label="Email" name="email" required />
              <LazyPasswordWithStrengthField
                autoComplete="password"
                fullWidth
                label="Password"
                name="password"
                required
              />
            </CardContent>
            <Divider />
            <CardActions>
              <SubmitButton label="Register" />
              <FormLinks
                links={[
                  { label: "Log in", to: "/login/" },
                  { label: "Reset password", to: "/forgotten-password/" },
                ]}
              />
            </CardActions>
          </Card>
        </form>
      </FormProvider>
    </>
  );
};

export default Register;
