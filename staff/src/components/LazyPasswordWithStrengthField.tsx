import { TextFieldProps } from "@mui/material/TextField";
import { lazy, Suspense } from "react";

import PasswordField from "src/components/PasswordField";

const PasswordWithStrengthField = lazy(
  () => import("./PasswordWithStrengthField"),
);

interface IProps {
  name: string;
}

const LazyPasswordWithStrengthField = ({
  name,
  ...props
}: IProps & TextFieldProps) => {
  return (
    <Suspense fallback={<PasswordField name={name} {...props} />}>
      <PasswordWithStrengthField name={name} {...props} />
    </Suspense>
  );
};

export default LazyPasswordWithStrengthField;
