import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import { ChangeEvent, DragEvent, useRef, useState } from "react";

interface IProps {
  label: string;
  multiple?: boolean;
  onDrop: (files: FileList) => Promise<void>;
}

const Dropzone = ({ label, onDrop, multiple = true }: IProps) => {
  const [loading, setLoading] = useState(false);
  const [over, setOver] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);

  const doDrop = async (files: FileList) => {
    setLoading(true);
    try {
      onDrop(files);
    } finally {
      setLoading(false);
    }
  };

  const onLocalDrop = async (event: DragEvent<HTMLInputElement>) => {
    event.preventDefault();
    setOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      await doDrop(event.dataTransfer.files);
    }
  };

  const onDrag = (value: boolean) => (event: DragEvent<HTMLInputElement>) => {
    event.preventDefault();
    setOver(value);
  };

  const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    if (event.target.files && event.target.files.length > 0) {
      await doDrop(event.target.files);
    }
  };

  return (
    <Box
      onDragLeave={onDrag(false)}
      onDragOver={onDrag(true)}
      onDrop={onLocalDrop}
      sx={{ marginBottom: 2 }}
    >
      <Box
        ref={ref}
        component="input"
        multiple={multiple}
        onChange={onChange}
        sx={{ display: "none" }}
        type="file"
      />
      <Box
        component="label"
        sx={{
          backgroundColor: "other.lightGrey",
          border: "2px dashed",
          borderColor: over ? "info.main" : "text.secondary",
          color: "text.main",
          display: "block",
          padding: 2,
          textAlign: "center",
          width: "100%",
        }}
      >
        <LoadingButton
          aria-haspopup="true"
          color="secondary"
          loading={loading}
          onClick={() => {
            if (ref.current) (ref.current as HTMLInputElement).click();
          }}
          size="small"
          startIcon={<CloudUploadIcon />}
          variant="contained"
        >
          {label}
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default Dropzone;
