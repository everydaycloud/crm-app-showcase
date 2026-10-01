import MemberGrid from "src/components/MemberGrid";
import { PaymentStatus } from "src/models";
import { useMembersQuery } from "src/queries/members";

interface IProps {
  search: string | null;
}

const SearchTab = ({ search }: IProps) => {
  const { data: members } = useMembersQuery(PaymentStatus.UNPAID, search);

  return <MemberGrid members={members ?? []} />;
};

export default SearchTab;
