import React from "react";
import Navbar from "../home/Navbar";
import LeftBar from "../home/LeftBar";
import UserProfilePage from "../UserProfile/UserProfilePage";

function UserProfileTotalPage() {
  return (
    <div className="bg-slate-800 min-h-screen flex flex-col">
      <Navbar />
      <LeftBar />
      <UserProfilePage />
    </div>
  );
}

export default UserProfileTotalPage;
