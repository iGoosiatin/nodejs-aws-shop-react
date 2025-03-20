import { createContext, ReactNode, useContext, useState } from "react";
type AlertContextType = {
  alertMessage: string;
  setAlertMessage: (value: string) => void;
};

// Create the context
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Create a provider component
export function AlertContextProvider({ children }: { children: ReactNode }) {
  const [alertMessage, setAlertMessage] = useState("");

  return (
    <AlertContext.Provider
      value={{
        alertMessage,
        setAlertMessage,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error(
      "useAlertContext must be used within a AlertContextProvider"
    );
  }
  return context;
}
