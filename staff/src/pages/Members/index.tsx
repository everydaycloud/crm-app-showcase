import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Tab from "@mui/material/Tab";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import TextField from "src/components/TextField";
import SubmitButton from "src/components/SubmitButton";
import { useHash } from "src/utils";
import { PaymentStatus } from "src/models";
import SearchTab from "src/pages/Members/SearchTab";
import AutocompleteField from "src/components/AutocompleteField";
import UnpaidTab from "src/pages/Members/UnpaidTab";
import CardHeader from "@mui/material/CardHeader";
import Link from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuItem from "@mui/material/MenuItem";

type TabState = "search" | "unpaid";

const FormSchema = z.object({
  search: z.string().trim().nullable(),
  paymentStatus: z.nativeEnum(PaymentStatus).nullable(),
});

type FormType = z.input<typeof FormSchema>;
type ValidatedType = z.output<typeof FormSchema>;

const Members = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [tab, setTab] = useHash<TabState>("search");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
    null,
  );
  const [search, setSearch] = useState<string | null>(null);

  const defaultValues = {
    search: "",
    paymentStatus: null,
    status: null,
  };

  const methods = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: defaultValues,
  });

  const onSubmit = (data: ValidatedType) => {
    setSearch(data.search);
    setPaymentStatus(data.paymentStatus);
    methods.reset(data);
  };

  const reset = () => {
    methods.reset(defaultValues);
    setSearch(null);
  };

  return (
    <>
      <Menu anchorEl={anchorEl} onClose={() => setAnchorEl(null)} open={open}>
        <MenuItem>
          <Link href={"/members/add/"} style={{ textDecoration: "none" }}>
            Add Cash Member
          </Link>
        </MenuItem>
      </Menu>
      <TabContext value={tab}>
        <TabList
          onChange={(_, value: string) => setTab(value as TabState)}
          sx={{ marginBottom: 1 }}
        >
          <Tab label="Search" value="search" />
          <Tab label="Unpaid" value="unpaid" />
        </TabList>
        <Card>
          <CardHeader
            title="Members"
            sx={{ pb: 0 }}
            action={
              <Button
                endIcon={<KeyboardArrowDownIcon />}
                onClick={(event) => setAnchorEl(event.currentTarget)}
                variant="contained"
                sx={{ mb: 2 }}
              >
                Actions
              </Button>
            }
          />
          <CardContent>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <TextField
                  fullWidth
                  label="Search by name or last name"
                  name="search"
                  sx={{ mb: 1 }}
                />
                <AutocompleteField
                  sx={{ mb: 1 }}
                  fullWidth
                  label="Payment Status"
                  name="paymentStatus"
                  options={Object.entries(PaymentStatus).map(
                    ([label, value]) => ({
                      label,
                      value,
                    }),
                  )}
                />
                <SubmitButton label="Filter" fullWidth sx={{ mb: 2 }} />
                <Button fullWidth onClick={() => reset()}>
                  Reset
                </Button>
              </form>
            </FormProvider>
          </CardContent>
          <TabPanel value="search">
            <SearchTab paymentStatus={paymentStatus} search={search} />
          </TabPanel>
          <TabPanel value="unpaid">
            <UnpaidTab search={search} />
          </TabPanel>
        </Card>
      </TabContext>
    </>
  );
};

export default Members;
