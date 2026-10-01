import { format } from "date-fns";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { ControllerFieldState } from "react-hook-form";

export const combineHelperText = (
  helperText: ReactNode | string | undefined,
  fieldState: ControllerFieldState,
): ReactNode => {
  if (fieldState.error !== undefined) {
    return (
      <>
        {fieldState.error.message}. {helperText}
      </>
    );
  } else {
    return helperText;
  }
};

export const formatDateTime = (date: Date | null) => {
  if (date) {
    const formattedDate = format(date, "dd MM yyyy HH:mm");
    return formattedDate;
  } else {
    return "";
  }
};

export const useHash = <S extends string>(
  initialHash: S | undefined,
): [S, Dispatch<SetStateAction<S>>] => {
  // State hook is used primarily to notify when the value changes
  const [hash, setHash] = useState<S>(() => {
    const hash: S = window.location.hash.replace("#", "") as S;
    if (initialHash === undefined) {
      return hash;
    } else {
      return hash || initialHash;
    }
  });

  // Basic callback to copy the url hash into the state
  const hashChangeHandler = useCallback(() => {
    const hash: S = window.location.hash.replace("#", "") as S;
    if (initialHash === undefined) {
      setHash(hash);
    } else {
      setHash(hash || initialHash);
    }
  }, [setHash, initialHash]);

  // When the url hash changes we want to update the state
  useEffect(() => {
    window.addEventListener("hashchange", hashChangeHandler);
    return () => {
      window.removeEventListener("hashchange", hashChangeHandler);
    };
  }, [hashChangeHandler]);

  // If the base URL changes we want to reset the state
  useEffect(() => {
    hashChangeHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hashChangeHandler, window.location.pathname]);

  // Components can manually update the hash the same as useState
  const updateHash = useCallback(
    (newHash: S | ((prevState: S) => S)) => {
      if (typeof newHash === "function") {
        newHash = newHash(hash);
      }
      if (newHash !== hash) {
        window.location.hash = newHash;
      }
    },
    [hash],
  );

  return [hash, updateHash];
};
