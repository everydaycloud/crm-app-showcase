import { useContext } from "react";
import type { ValidatedType } from "src/components/NoteForm";
import { useMemberNoteMutation, useMemberQuery } from "src/queries/members";
import { ToastContext } from "src/ToastContext";
import Page from "src/components/Page";
import { useNavigate, useParams } from "react-router-dom";
import NoteForm from "src/components/NoteForm";

interface IParams {
  memberId: string;
}

const AddMemberNote = () => {
  const params = useParams() as unknown as IParams;
  const navigate = useNavigate();
  const { addToast } = useContext(ToastContext);
  const { data: member } = useMemberQuery(params.memberId);
  const { mutateAsync: addNote } = useMemberNoteMutation(params.memberId);

  const onSubmit = async (data: ValidatedType) => {
    try {
      await addNote(data);

      addToast("Note Added", "success");
      navigate(`/members/${params.memberId}/`);
    } catch (error) {
      addToast(`Try again: ${error}`, "error");
    }
  };
  return (
    <Page
      title="Add New Note"
      breadcrumbs={[
        { label: "Members", to: "/members/" },
        {
          label: `${member?.firstName} ${member?.lastName}`,
          to: `/members/${member?.id}/`,
        },
      ]}
      disablePadding
    >
      <NoteForm
        initialValues={{
          note: member?.note ?? "",
        }}
        onSubmit={onSubmit}
        back="/members/"
        label="Save"
        disabled={member === undefined}
      />
    </Page>
  );
};

export default AddMemberNote;
