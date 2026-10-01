import { zodResolver } from "@hookform/resolvers/zod";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import SubmitButton from "src/components/SubmitButton";
import FormLinks from "src/components/FormLinks";
import TextField from "src/components/TextField";

const FormSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().nullable(),
});
export type FormType = z.input<typeof FormSchema>;
export type ValidatedType = z.infer<typeof FormSchema>;

interface IProps {
  back: string;
  onSubmit: (data: ValidatedType) => Promise<any>;
  submitLabel: string;
  initialValues: FormType;
}

const MemberForm = ({ back, initialValues, onSubmit, submitLabel }: IProps) => {
  const methods = useForm<FormType, any, ValidatedType>({
    defaultValues: initialValues,
    resolver: zodResolver(FormSchema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography gutterBottom variant="body2">
                This is for adding CASH PAYING members only. Others will be
                added automatically.
              </Typography>
              <Grid size={12} mb={2}>
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  name="firstName"
                />
              </Grid>
              <Grid size={12} mb={2}>
                <TextField
                  fullWidth
                  required
                  label="Last Name"
                  name="lastName"
                />
              </Grid>
              <Grid size={12} mb={2}>
                <TextField fullWidth required label="Email" name="email" />
              </Grid>
              <Grid size={12} mb={2}>
                <TextField fullWidth label="Phone" name="phoneNumber" />
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions>
          <SubmitButton label={submitLabel} />
          <FormLinks
            links={[
              {
                label: "Back",
                to: back,
              },
            ]}
          />
        </CardActions>
      </form>
    </FormProvider>
  );
};
export default MemberForm;
