import Checkbox, { CheckboxProps } from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { TypographyProps } from "@mui/material/Typography";
import { useController, useFormContext } from "react-hook-form";

import { combineHelperText } from "src/utils";

interface IProps {
  fullWidth?: boolean;
  helperText?: string;
  label: string;
  name: string;
  required?: boolean;
  labelProps?: TypographyProps;
  checkboxProps?: CheckboxProps;
  disabled?: boolean;
}

const CheckboxField = ({ name, ...props }: IProps) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({
    name,
    control,
    rules: { required: props.required },
  });

  return (
    <FormControl
      component="fieldset"
      error={fieldState.error !== undefined}
      fullWidth={props.fullWidth}
      required={props.required}
      disabled={props.disabled}
    >
      <FormControlLabel
        control={
          <Checkbox {...field} checked={field.value} {...props.checkboxProps} />
        }
        label={props.label}
        componentsProps={{ typography: props.labelProps }}
      />
      <FormHelperText>
        {combineHelperText(props.helperText, fieldState)}
      </FormHelperText>
    </FormControl>
  );
};

export default CheckboxField;
