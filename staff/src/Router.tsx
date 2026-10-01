import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "src/components/ScrollToTop";
import TopBar from "src/components/TopBar";
import Register from "src/pages/Register";
import ConfirmEmail from "src/pages/ConfirmEmail";
import Login from "src/pages/Login";
import RequireAuth from "src/components/RequireAuth";
import ChangePassword from "src/pages/ChangePassword";
import ForgottenPassword from "src/pages/ForgottenPassword";
import ResetPassword from "src/pages/ResetPassword";
import AllStaff from "src/pages/AllStaff";
import Members from "src/pages/Members";
import Member from "src/pages/Member";
import UploadPicture from "src/pages/UploadPicture";
import EditMember from "src/pages/EditMember";
import AddMember from "src/pages/AddMember";
import AddMemberNote from "src/pages/AddMemberNote";

const Router = () => (
  <BrowserRouter>
    <ScrollToTop />
    <TopBar />
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth>
            <Members />
          </RequireAuth>
        }
      />
      <Route
        path="/change-password/"
        element={
          <RequireAuth>
            <ChangePassword />
          </RequireAuth>
        }
      />
      <Route
        path="/members/"
        element={
          <RequireAuth>
            <Members />
          </RequireAuth>
        }
      />
      <Route
        path="/members/add/"
        element={
          <RequireAuth>
            <AddMember />
          </RequireAuth>
        }
      />
      <Route
        path="/members/:memberId/"
        element={
          <RequireAuth>
            <Member />
          </RequireAuth>
        }
      />
      <Route
        path="/members/:memberId/edit/"
        element={
          <RequireAuth>
            <EditMember />
          </RequireAuth>
        }
      />
      <Route
        path="/members/:memberId/note/"
        element={
          <RequireAuth>
            <AddMemberNote />
          </RequireAuth>
        }
      />
      <Route
        path="/members/:memberId/photo-upload/"
        element={
          <RequireAuth>
            <UploadPicture />
          </RequireAuth>
        }
      />
      <Route
        path="/staff/"
        element={
          <RequireAuth>
            <AllStaff />
          </RequireAuth>
        }
      />
      <Route path="/confirm-email/:token/" element={<ConfirmEmail />} />
      <Route path="/forgotten-password/" element={<ForgottenPassword />} />
      <Route path="/login/" element={<Login />} />
      <Route path="/register/" element={<Register />} />
      <Route path="/reset-password/:token/" element={<ResetPassword />} />
    </Routes>
  </BrowserRouter>
);
export default Router;
