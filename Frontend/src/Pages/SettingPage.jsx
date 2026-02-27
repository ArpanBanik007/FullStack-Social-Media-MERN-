import React from "react";
import Navbar from "../home/Navbar";
import LeftBar from "../home/LeftBar";
import Allsettings from "../settings/Allsettings";

function SettingPage() {
  return (
    <div className="bg-slate-800 min-h-screen flex flex-col">
      <Navbar />
      <LeftBar />
      <Allsettings />
    </div>
  );
}

export default SettingPage;
