import type { LinkProps } from "@mui/material/Link";

import MUILink from "@mui/material/Link";
import type { Ref } from "react";

import { Link as WLink } from "wouter";

interface IProps extends Omit<LinkProps, "href"> {
  to: `/${string}` | `~/${string}` | (string & {});
  ref?: Ref<HTMLAnchorElement>;
}

const InternalLink = ({ to, children, ref, ...props }: IProps) => {
  return (
    <MUILink component={WLink} to={to} ref={ref} {...props}>
      {children}
    </MUILink>
  );
};

export default InternalLink;
