import React from "react";
import Navbar from "../home/Navbar";
import VideoPlayer from "../VideoFeed/VideoPlayer";
import LeftBar from "../home/LeftBar";

function Videopage() {
  return (
    <div className=" bg-slate-800 min-h-screen flex flex-col ">
      <Navbar />
      <div className=" hidden sm:flex">
        <LeftBar />
      </div>
      <VideoPlayer />
    </div>
  );
}

export default Videopage;
