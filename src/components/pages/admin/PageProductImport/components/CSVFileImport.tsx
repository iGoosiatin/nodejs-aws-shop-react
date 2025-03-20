import React from "react";
import axios, { AxiosError } from "axios";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useAlertContext } from "~/components/AlertContext/AlertContext";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const { setAlertMessage } = useAlertContext();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const uploadFile = async () => {
    if (!file) {
      return;
    }
    console.log("uploadFile to", url);

    //Get the presigned URL
    let presignedUrl = "";
    try {
      const token = localStorage.getItem("authorization_token");
      const response = await axios({
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Basic ${token}` } : {}),
        },
        url,
        params: {
          name: encodeURIComponent(file.name),
        },
      });
      presignedUrl = response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const alertMessage = `${error.response?.status}: ${error.response?.data?.message}`;
        setAlertMessage(alertMessage);
      } else {
        setAlertMessage("Unexpected error");
      }
      return;
    }

    if (!presignedUrl) {
      return;
    }

    await fetch(presignedUrl, {
      method: "PUT",
      body: file,
    });

    setFile(null);
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
