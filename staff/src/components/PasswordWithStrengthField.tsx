import LinearProgress from "@mui/material/LinearProgress";
import { TextFieldProps } from "@mui/material/TextField";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";
import { useController, useFormContext } from "react-hook-form";

import PasswordField from "src/components/PasswordField";

interface IProps {
  name: string;
}

const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
};

zxcvbnOptions.setOptions(options);

type colourString = "error" | "warning" | "success";

const scoreToDisplay = (score: number) => {
  let progressColor = "error";
  let helperText = "Weak";

  switch (score) {
    case 25:
      progressColor = "error";
      break;
    case 50:
      progressColor = "warning";
      helperText = "Fair";
      break;
    case 75:
      progressColor = "success";
      helperText = "Good";
      break;
    case 100:
      progressColor = "success";
      helperText = "Strong";
      break;
    default:
      progressColor = "error";
  }
  return [progressColor, helperText];
};

const PasswordWithStrengthField = ({
  name,
  ...props
}: IProps & TextFieldProps) => {
  const { control } = useFormContext();
  const { field } = useController({
    name,
    control,
    rules: { required: props.required },
  });
  const result = zxcvbn(field.value ?? "");
  const score = (result.score * 100) / 4;

  const [progressColor, helperText] = scoreToDisplay(score);

  return (
    <>
      <PasswordField name={name} helperText={helperText} {...props} />
      <LinearProgress
        color={progressColor as colourString}
        sx={{
          margin: "0 4px 24px 4px",
        }}
        value={score}
        variant="determinate"
      />
    </>
  );
};

export default PasswordWithStrengthField;
