import TextField, { TextFieldProps } from "@mui/material/TextField";

const BaseTextField = (props: TextFieldProps) => {
  const labelLength = typeof props.label === "string" ? props.label.length : 0;

  return (
    <TextField
      {...props}
      InputLabelProps={{
        sx: { textWrap: "pretty" },
        ...props.InputLabelProps,
      }}
      sx={{
        "& .MuiInputBase-root": {
          height: { xs: labelLength > 20 ? 90 : "auto", sm: "auto" },
        },
        ...props.sx,
      }}
    />
  );
};

export type { TextFieldProps } from "@mui/material/TextField";
export default BaseTextField;
