import { zodResolver } from "@hookform/resolvers/zod";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import TextField from "src/components/TextField";
import SubmitButton from "src/components/SubmitButton";
import FormLinks from "src/components/FormLinks";
import { useEffect } from "react";

interface IProps {
  back: string;
  disabled: boolean;
  initialValues: ValidatedType;
  label: string;
  onSubmit: (data: ValidatedType) => Promise<any>;
}

const FormSchema = z.object({
  note: z.string().nullable(),
});
type FormType = z.input<typeof FormSchema>;
export type ValidatedType = z.output<typeof FormSchema>;

const NoteForm = ({
  back,
  disabled,
  initialValues,
  label,
  onSubmit,
}: IProps) => {
  const methods = useForm<FormType, any, ValidatedType>({
    defaultValues: initialValues,
    resolver: zodResolver(FormSchema),
    disabled,
  });

  useEffect(() => {
    methods.reset(initialValues);
  }, [initialValues]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <CardContent>
          <TextField
            fullWidth
            label="Note content"
            name="note"
            multiline
            rows={4}
          />
        </CardContent>
        <Divider />
        <CardActions>
          <SubmitButton label={label} />
          <FormLinks links={[{ label: "Back", to: back }]} />
        </CardActions>
      </form>
    </FormProvider>
  );
};

export default NoteForm;
