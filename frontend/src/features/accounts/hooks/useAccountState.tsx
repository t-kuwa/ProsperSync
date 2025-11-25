import { useContext } from "react";
import { AccountContext } from "../context/AccountContext";

const useAccountState = () => {
  const context = useContext(AccountContext);

  if (!context) {
    throw new Error("useAccountState must be used within an AccountProvider");
  }

  return context;
};

export default useAccountState;
