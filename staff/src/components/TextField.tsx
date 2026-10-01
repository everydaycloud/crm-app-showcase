import { useController, useFormContext } from "react-hook-form";

import BaseTextField, { TextFieldProps } from "@mui/material/TextField";
import { combineHelperText } from "src/utils";

interface IProps {
  limit?: number;
  name: string;
}

const TextField = ({ limit, name, ...props }: IProps & TextFieldProps) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({
    name,
    control,
    rules: { required: props.required },
  });
  const { ref, ...fieldProps } = field;

  let helperText = props.helperText ?? "";
  if (limit !== undefined) {
    helperText += ` ${field.value.length}/${limit}`;
  }

  return (
    <BaseTextField
      {...props}
      error={fieldState.error !== undefined}
      inputProps={{
        maxLength: limit,
        ...props.inputProps,
      }}
      inputRef={ref}
      helperText={combineHelperText(helperText, fieldState)}
      type="text"
      {...fieldProps}
    />
  );
};

export default TextField;
