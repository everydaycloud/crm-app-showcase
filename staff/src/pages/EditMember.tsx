import axios from "axios";
import { useContext } from "react";

import type { ValidatedType } from "src/components/MemberForm";
import { useEditMemberMutation, useMemberQuery } from "src/queries/members";
import { ToastContext } from "src/ToastContext";
import MemberForm from "src/components/MemberForm";
import Page from "src/components/Page";
import { useNavigate, useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

interface IParams {
  memberId: string;
}

const EditMember = () => {
  const params = useParams() as unknown as IParams;
  const { addToast } = useContext(ToastContext);
  const { data: member } = useMemberQuery(params.memberId);
  const { mutateAsync: editMember } = useEditMemberMutation(params.memberId);
  const navigate = useNavigate();

  const onSubmit = async (data: ValidatedType) => {
    try {
      await editMember(data);
      addToast("Member Edited", "success");
      navigate(`/members/${params.memberId}/`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        addToast("Member not found", "error");
      }
      addToast("Try again", "error");
    }
  };

  if (member === undefined) {
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={80} />
      </Box>
    );
  }

  return (
    <Page
      title="Edit Member"
      breadcrumbs={[
        { label: "Members", to: "/members/" },
        {
          label: `${member.firstName} ${member.lastName}`,
          to: `/members/${member.id}/`,
        },
      ]}
      disablePadding
    >
      <MemberForm
        initialValues={{
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phoneNumber: member.phoneNumber ?? "",
        }}
        onSubmit={onSubmit}
        back={`/members/${member.id}/`}
        submitLabel="Save Changes"
      />
    </Page>
  );
};

export default EditMember;
