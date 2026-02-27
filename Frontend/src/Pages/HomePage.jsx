import React from "react";
import Navbar from "../home/Navbar";
import LeftBar from "../home/LeftBar";
import Feedpage from "../home/Feedpage";
import RightBar from "../home/RightBar";

function HomePage() {
  return (
    <div className=" bg-slate-800 min-h-screen flex flex-col">
      <Navbar />
      <div className=" hidden md:flex">
        <LeftBar />
      </div>
      <Feedpage />
      <div className=" hidden md:flex">
        <RightBar />
      </div>
    </div>
  );
}

export default HomePage;
