import Button, { ButtonProps } from "@mui/material/Button";
import { useFormContext } from "react-hook-form";

interface IProps {
  disableClean?: boolean;
  label: string;
}

const SubmitButton = ({ label, ...props }: IProps & ButtonProps) => {
  const {
    formState: { disabled: formDisabled, isDirty, isSubmitting },
  } = useFormContext();

  return (
    <Button
      {...props}
      color="primary"
      disabled={
        props.disabled || (props.disableClean && !isDirty) || formDisabled
      }
      loading={isSubmitting}
      type="submit"
      variant="contained"
    >
      {label}
    </Button>
  );
};

export default SubmitButton;
