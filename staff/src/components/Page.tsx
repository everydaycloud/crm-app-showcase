import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import type { CardProps } from "@mui/material/Card";
import Card from "@mui/material/Card";
import type { CardContentProps } from "@mui/material/CardContent";
import CardContent from "@mui/material/CardContent";
import type { CardHeaderProps } from "@mui/material/CardHeader";
import CardHeader from "@mui/material/CardHeader";
import { Link } from "react-router-dom";

interface IBreadcrumb {
  label: string;
  to: string;
}

interface ISlotProps {
  card?: CardProps;
  cardContent?: CardContentProps;
  cardHeader?: CardHeaderProps;
}

interface IProps {
  actions?: React.ReactNode;
  breadcrumbs?: IBreadcrumb[];
  children: React.ReactNode;
  disablePadding?: boolean;
  slotProps?: ISlotProps;
  tabs?: React.ReactNode;
  title: string;
}

const Page = ({
  actions,
  breadcrumbs,
  children,
  disablePadding,
  slotProps,
  tabs,
  title,
}: IProps) => (
  <>
    <title>{title}</title>
    <Card {...(slotProps?.card ?? {})}>
      <CardHeader
        action={actions}
        subheader={
          breadcrumbs !== undefined ? (
            <Breadcrumbs aria-label="breadcrumb">
              {breadcrumbs.map((crumb) => {
                return (
                  <Link key={crumb.label} color="inherit" to={crumb.to}>
                    <u>{crumb.label}</u>
                  </Link>
                );
              })}
            </Breadcrumbs>
          ) : null
        }
        title={title}
        {...(slotProps?.cardHeader ?? {})}
      />
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>{tabs}</Box>
      {disablePadding ? (
        children
      ) : (
        <CardContent {...(slotProps?.cardContent ?? {})}>
          {children}
        </CardContent>
      )}
    </Card>
  </>
);

export default Page;
