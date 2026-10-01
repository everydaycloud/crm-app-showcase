import Autocomplete from "@mui/material/Autocomplete";
import { SxProps } from "@mui/system";
import { useController, useFormContext } from "react-hook-form";

import TextField from "src/components/BaseTextField";
import { combineHelperText } from "src/utils";

export interface IOption {
  label?: string;
  value: string;
}

interface IProps {
  disabled?: boolean;
  freeSolo?: boolean;
  fullWidth?: boolean;
  groupBy?: ((option: IOption) => string) | undefined;
  helperText?: string;
  label: string;
  name: string;
  options: IOption[];
  required?: boolean;
  size?: "small" | "medium" | undefined;
  sx?: SxProps;
}

const AutocompleteField = ({ name, ...props }: IProps) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({
    name,
    control,
    rules: { required: props.required },
  });

  const value = props.freeSolo
    ? field.value
    : (props.options.find((option) => option.value === field.value) ?? null);

  return (
    <Autocomplete
      disabled={props.disabled}
      getOptionLabel={(option: IOption | string) =>
        typeof option === "string" ? option : (option.label ?? option.value)
      }
      groupBy={props.groupBy}
      freeSolo={props.freeSolo}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      onChange={(_, newValue: IOption | string | null) =>
        field.onChange(
          typeof newValue === "string" ? newValue : (newValue?.value ?? ""),
        )
      }
      onInputChange={(_, newValue: string) => {
        if (props.freeSolo) {
          field.onChange(newValue);
        }
      }}
      options={props.options}
      renderInput={(params) => (
        <TextField
          {...params}
          error={fieldState.error !== undefined}
          fullWidth={props.fullWidth}
          helperText={combineHelperText(props.helperText, fieldState)}
          label={`${props.label}`}
          size={props.size}
          sx={props.sx}
          required={props.required}
        />
      )}
      renderOption={(optionProps, option) => {
        const { key, ...rest } = optionProps;
        return (
          <li {...rest} key={key}>
            {option.label ?? option.value}
          </li>
        );
      }}
      value={value}
    />
  );
};

export default AutocompleteField;
