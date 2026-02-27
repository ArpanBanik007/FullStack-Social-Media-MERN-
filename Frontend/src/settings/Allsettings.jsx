import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUnlockAlt } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoNotifications } from "react-icons/io5";
import { ImBlocked } from "react-icons/im";
import { FaComments } from "react-icons/fa";
import { FcLike } from "react-icons/fc";

function Allsettings() {
  const navigate = useNavigate();

  return (
    <div className="w-[50%] ml-[38%] mt-4">
      <div
        className="flex items-center w-full h-16  bg-slate-600 mt-2.5  rounded-xl  cursor-pointer"
        onClick={() => navigate("/settings/security")}
      >
        <div className=" h-full text-3xl text-gray-200 pt-3.5 ml-2.5 ">
          <FaUnlockAlt />
        </div>
        <h3 className="text-2xl text-gray-200 font-semibold pl-15 flex items-center justify-center">
          Password & Security
        </h3>
      </div>
      <div
        className="flex items-center w-full h-16  bg-slate-600 mt-2.5  rounded-xl  cursor-pointer"
        onClick={() => navigate("/settings/profile")}
      >
        <div className=" h-full text-3xl font-bold text-gray-200 pt-3.5 ml-2.5 ">
          <CgProfile />
        </div>
        <h3 className="text-2xl text-gray-200 font-semibold pl-15 flex items-center justify-center">
          Profile Settings
        </h3>
      </div>
      <div className="flex items-center w-full h-16  bg-slate-600 mt-2.5  rounded-xl  cursor-pointer">
        <div className=" h-full text-3xl text-gray-200 pt-3.5 ml-2.5 ">
          <IoNotifications />
        </div>
        <h3 className="text-2xl text-gray-200 font-semibold pl-15 flex items-center justify-center">
          Notifiactions Settings
        </h3>
      </div>
      <div className="flex items-center w-full h-16  bg-slate-600 mt-2.5  rounded-xl  cursor-pointer">
        <div className=" h-full text-3xl text-gray-200 pt-3.5 ml-2.5 ">
          <ImBlocked />
        </div>
        <h3 className="text-2xl text-gray-200 font-semibold pl-15 flex items-center justify-center">
          Blocked
        </h3>
      </div>
      <div className="flex items-center w-full h-16  bg-slate-600 mt-2.5  rounded-xl  cursor-pointer">
        <div className=" h-full text-3xl text-gray-200 pt-3.5 ml-2.5 ">
          <FaComments />
        </div>
        <h3 className="text-2xl text-gray-200 font-semibold pl-15 flex items-center justify-center">
          Comments Counts
        </h3>
      </div>
      <div className="flex items-center w-full h-16  bg-slate-600 mt-2.5  rounded-xl  cursor-pointer">
        <div className=" h-full text-3xl text-gray-200 pt-3.5 ml-2.5 ">
          <FcLike />
        </div>
        <h3 className="text-2xl text-gray-200 font-semibold pl-15 flex items-center justify-center">
          Like Counts
        </h3>
      </div>
    </div>
  );
}

export default Allsettings;
