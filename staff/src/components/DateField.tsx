import { TextFieldProps } from "@mui/material/TextField";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { formatISO, parseISO } from "date-fns";
import { useController, useFormContext } from "react-hook-form";

import { combineHelperText } from "src/utils";

interface IProps {
  name: string;
}

const DateField = ({ name, ...props }: IProps & TextFieldProps) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({
    name,
    control,
    rules: { required: props.required },
  });

  let value = null;
  if (field.value instanceof Date) {
    value = field.value;
  } else if (field.value === "" || field.value === null) {
    value = null;
  } else {
    value = parseISO(field.value);
  }

  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      localeText={{
        fieldMonthPlaceholder: (params) =>
          params.contentType === "letter" ? "MM" : params.format,
      }}
    >
      <DatePicker
        format="d MMMM yyyy"
        label={props.label}
        onChange={(newValue) => {
          if (newValue === null || isNaN(newValue as any)) {
            field.onChange("");
          } else {
            field.onChange(formatISO(newValue, { representation: "date" }));
          }
        }}
        disabled={props.disabled}
        slotProps={{
          textField: {
            fullWidth: props.fullWidth,
            error: fieldState.error !== undefined,
            helperText: combineHelperText(props.helperText, fieldState),
            required: props.required,
          },
        }}
        value={value}
      />
    </LocalizationProvider>
  );
};

export default DateField;
