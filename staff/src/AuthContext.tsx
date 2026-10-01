import { createContext, useState } from "react";

interface IAuth {
  authenticated: boolean;
  setAuthenticated: (value: boolean) => void;
}

export const AuthContext = createContext<IAuth>({
  authenticated: false,
  setAuthenticated: () => {},
});

export const AuthContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [authenticated, setAuthenticatedState] = useState<boolean>(() => {
    return localStorage.getItem("authenticated") === "true";
  });

  const setAuthenticated = (value: boolean) => {
    setAuthenticatedState(value);
    localStorage.setItem("authenticated", value.toString());
  };

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
