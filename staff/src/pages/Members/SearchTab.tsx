import Typography from "@mui/material/Typography";
import MemberGrid from "src/components/MemberGrid";
import { PaymentStatus } from "src/models";
import { useMembersQuery } from "src/queries/members";

interface IProps {
  search: string | null;
  paymentStatus: PaymentStatus | null;
}

const SearchTab = ({ paymentStatus, search }: IProps) => {
  const { data: members } = useMembersQuery(paymentStatus, search);

  return (
    <>
      <Typography
        variant="body2"
        sx={{
          mb: 2,
          mt: -4,
        }}
      >
        Total count: {members?.length}
      </Typography>
      <MemberGrid members={members ?? []} />
    </>
  );
};

export default SearchTab;
