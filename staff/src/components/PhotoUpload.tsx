interface IProps {
  file: File | null;
  setFile: (file: File) => void;
}

const MemberPhotoUpload = ({ file, setFile }: IProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button type="submit" disabled={!file}>
        'Upload Photo'
      </button>
    </>
  );
};

export default MemberPhotoUpload;
