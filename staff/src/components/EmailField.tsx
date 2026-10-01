import { useController, useFormContext } from "react-hook-form";

import TextField, { TextFieldProps } from "@mui/material/TextField";
import { combineHelperText } from "src/utils";

interface IProps {
  name: string;
}

const EmailField = ({ name, ...props }: IProps & TextFieldProps) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({
    name,
    control,
    rules: { required: props.required },
  });

  return (
    <TextField
      {...props}
      autoComplete="email"
      error={fieldState.error !== undefined}
      helperText={combineHelperText(props.helperText, fieldState)}
      inputRef={field.ref}
      name={field.name}
      onChange={field.onChange}
      onBlur={field.onBlur}
      type="email"
      value={field.value ?? ""}
    />
  );
};

export default EmailField;
