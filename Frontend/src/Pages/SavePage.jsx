import React from "react";
import Navbar from "../home/Navbar";
import LeftBar from "../home/LeftBar";
import AllSaved from "../Profile/AllSaved";

function SavePage() {
  return (
    <div className="bg-slate-800 min-h-screen flex flex-col">
      <Navbar />
      <LeftBar />

      <div className="w-[70%] ml-[28%] border mt-1 rounded-md bg-gray-800">
        <h1 className="text-2xl text-gray-200 font-semibold ml-5 mt-3.5">
          Saved
        </h1>
        <AllSaved />
      </div>
    </div>
  );
}

export default SavePage;
