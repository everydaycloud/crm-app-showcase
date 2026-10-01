import DeleteIcon from "@mui/icons-material/Delete";
import LoadingButton from "@mui/lab/LoadingButton";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { useContext, useState } from "react";

import Dropzone from "src/components/Dropzone";
import FormLinks from "src/components/FormLinks";
import { ToastContext } from "src/ToastContext";
import Title from "src/components/Title";
import { useUploadPhotoMutation } from "src/queries/members";
import { useNavigate, useParams } from "react-router-dom";

interface IParams {
  memberId: string;
}

const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/tiff",
  "image/tif",
  "image/bmp",
  "image/svg+xml",
  // "image/heic", // for iPhone
  // "image/heif", // for iPhone
];

const UploadPicture = () => {
  const params = useParams() as unknown as IParams;
  const { addToast } = useContext(ToastContext);
  const [files, setFiles] = useState<File[]>([]);
  const { mutateAsync: upload, isPending } = useUploadPhotoMutation(
    params.memberId,
  );
  const navigate = useNavigate();

  const onClick = async () => {
    try {
      await upload(files);
      addToast("Photo uploaded", "success");
      navigate(`/members/${params.memberId}/`);
    } catch {
      addToast("Try again", "error");
    }
  };

  const onDrop = async (newFiles: FileList) => {
    setFiles(
      [...files, ...newFiles].filter((file) =>
        ALLOWED_FILE_TYPES.includes(file.type),
      ),
    );
  };

  return (
    <>
      <Title title="Upload Member Picture" />
      <Card>
        <CardContent>
          <Dropzone label="Upload Photo" multiple={false} onDrop={onDrop} />
          <List>
            {files.map((file) => (
              <ListItem
                key={file.name}
                secondaryAction={
                  <IconButton
                    aria-label="delete"
                    edge="end"
                    onClick={() =>
                      setFiles(files.filter((checkFile) => checkFile !== file))
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={file.name} />
              </ListItem>
            ))}
          </List>
        </CardContent>
        <Divider />
        <CardActions>
          <LoadingButton
            color="primary"
            disabled={files.length === 0}
            loading={isPending}
            onClick={onClick}
            variant="contained"
          >
            Upload
          </LoadingButton>
          <FormLinks
            links={[{ label: "Back", to: `/members/${params.memberId}/` }]}
          />
        </CardActions>
      </Card>
    </>
  );
};

export default UploadPicture;
