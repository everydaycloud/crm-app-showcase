import Button from "@mui/material/Button";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ILink {
  endIcon?: ReactNode;
  label: string;
  startIcon?: ReactNode;
  to: string;
}

interface IProps {
  links: ILink[];
}

const FormLinks = ({ links }: IProps) => {
  return (
    <>
      {(links ?? []).map(({ endIcon, label, to, startIcon }) => (
        <Button
          color="inherit"
          component={Link}
          endIcon={endIcon}
          key={to}
          startIcon={startIcon}
          to={to}
        >
          {label}
        </Button>
      ))}
    </>
  );
};
export default FormLinks;
