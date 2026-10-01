import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { useState } from "react";
import { useController, useFormContext } from "react-hook-form";

import TextField, { TextFieldProps } from "@mui/material/TextField";
import { combineHelperText } from "src/utils";

interface IProps {
  name: string;
}

const PasswordField = ({ name, ...props }: IProps & TextFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { control } = useFormContext();
  const { field, fieldState } = useController({
    name,
    control,
    rules: { required: props.required },
  });
  const { ref, ...fieldProps } = field;

  return (
    <TextField
      {...props}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShowPassword((value) => !value)}
              tabIndex={-1}
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      error={fieldState.error !== undefined}
      helperText={combineHelperText(props.helperText, fieldState)}
      inputRef={ref}
      margin="normal"
      type={showPassword ? "text" : "password"}
      {...fieldProps}
    />
  );
};

export default PasswordField;
