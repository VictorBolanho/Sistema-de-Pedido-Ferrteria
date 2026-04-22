import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import LoginModal from "./LoginModal";
import RegisterRequestModal from "./RegisterRequestModal";
import { useModal } from "../context/ModalContext";

export default function PublicLayout() {
  const {
    loginModalOpen,
    openLoginModal,
    closeLoginModal,
    registerModalOpen,
    openRegisterModal,
    closeRegisterModal,
  } = useModal();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PublicNavbar onOpenLogin={openLoginModal} onOpenRegister={openRegisterModal} />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <LoginModal isOpen={loginModalOpen} onClose={closeLoginModal} />
      <RegisterRequestModal isOpen={registerModalOpen} onClose={closeRegisterModal} />
    </div>
  );
}
