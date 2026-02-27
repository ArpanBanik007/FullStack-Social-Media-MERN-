import React from "react";
import Navbar from "../home/Navbar";
import MyProfile from "../Profile/MyProfile";
import LeftBar from "../home/LeftBar";

function OwnProfilepage() {
  return (
    <div className="bg-slate-800 min-h-screen flex flex-col">
      <Navbar />
      <div className=" hidden md:flex">
        <LeftBar />
      </div>
      <MyProfile />
    </div>
  );
}

export default OwnProfilepage;
