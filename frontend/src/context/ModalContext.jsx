import { createContext, useContext, useCallback, useState, useMemo } from "react";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const openLoginModal = useCallback(() => {
    setLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setLoginModalOpen(false);
  }, []);

  const openRegisterModal = useCallback(() => {
    setRegisterModalOpen(true);
  }, []);

  const closeRegisterModal = useCallback(() => {
    setRegisterModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      loginModalOpen,
      openLoginModal,
      closeLoginModal,
      registerModalOpen,
      openRegisterModal,
      closeRegisterModal,
    }),
    [
      loginModalOpen,
      openLoginModal,
      closeLoginModal,
      registerModalOpen,
      openRegisterModal,
      closeRegisterModal,
    ]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
}
