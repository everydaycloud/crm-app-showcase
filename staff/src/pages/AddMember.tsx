import axios from "axios";
import { useContext } from "react";

import type { ValidatedType } from "src/components/MemberForm";
import { useCreateMemberMutation } from "src/queries/members";
import { ToastContext } from "src/ToastContext";
import MemberForm from "src/components/MemberForm";
import Page from "src/components/Page";
import { useNavigate } from "react-router-dom";

const AddMember = () => {
  const navigate = useNavigate();
  const { addToast } = useContext(ToastContext);
  const { mutateAsync: createMember } = useCreateMemberMutation();

  const onSubmit = async (data: ValidatedType) => {
    try {
      const response = await createMember(data);
      const memberId = response.data["id"];

      addToast("Member Added", "success");
      navigate(`/members/${memberId}/`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        addToast("Member already exists", "error");
      }
      addToast("Try again", "error");
    }
  };
  return (
    <Page
      title="Add New Member"
      breadcrumbs={[{ label: "Members", to: "/members/" }]}
      disablePadding
    >
      <MemberForm
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
        }}
        onSubmit={onSubmit}
        back="/members/"
        submitLabel="Add Member"
      />
    </Page>
  );
};

export default AddMember;
