import { Snackbar } from "@mui/material";
import Alert from "@mui/material/Alert";
import { useAlertContext } from "../AlertContext/AlertContext";

export default function AlertNotification() {
  const { alertMessage, setAlertMessage } = useAlertContext();
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={!!alertMessage}
      autoHideDuration={6000}
      onClose={() => setAlertMessage("")}
      sx={{ width: "80%" }}
    >
      <Alert
        onClose={() => setAlertMessage("")}
        severity="error"
        variant="filled"
        sx={{ width: "100%" }}
      >
        {alertMessage}
      </Alert>
    </Snackbar>
  );
}
