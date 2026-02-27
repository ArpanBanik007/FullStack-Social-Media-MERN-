import React from "react";
import Navbar from "../home/Navbar";

function SecuritySetting() {
  return (
    <div className="bg-slate-800 min-h-screen  flex flex-col ">
      <Navbar />
      <div className="bg-slate-600 w-[60%]  h-40 mt-2.5 ml-36 rounded-xl flex  items-center pl-5">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCn-TbanZWBS1uNFOOkr8QavCC0A9p-4SaFw&s"
          alt=""
          className="h-32 w-32 rounded-full object-center border-4 border-white"
        />
        <div className=" flex flex-col">
          <h4 className="text-3xl font-semibold text-gray-300 pl-10 ">
            Arpan Banik
          </h4>
          <p className="text-base font-bold text-gray-200 pl-12 pt-2.5">
            arpanbanik007
          </p>
        </div>
      </div>

      <div className="bg-slate-600 w-[60%]  h-44 mt-2.5 ml-36 rounded-xl pt-1.5 pl-5 mb-2.5">
        <div className="flex flex-row  items-center mb-4">
          <div>
            <h2 className="text-2xl ml-3 mt-2.5 text-gray-200 font-medium">
              Old Password:
            </h2>
            <input
              type="text"
              placeholder=" Enter old password"
              className="h-10 w-90  ml-2.5 mt-1.5 border-2 text-white border-white rounded-md hover:border-gray-400"
            />
          </div>
          <div>
            <h2 className="text-2xl ml-2.5 mt-2.5 text-gray-200 font-medium">
              New Password:
            </h2>
            <input
              type="text"
              placeholder=" Enter new password"
              className="h-10 w-90  ml-2.5 mt-1.5 border-2 text-white border-white rounded-md hover:border-gray-400"
            />
          </div>
        </div>
        <button className="bg-amber-600 hover:bg-amber-400 w-30 h-12 rounded-md cursor-pointer ml-[41%]">
          Submit
        </button>
      </div>

      <div className="bg-slate-600 w-[60%]  h-15 mt-2.5 ml-36 rounded-xl flex justify-center  items-center ">
        <button className="bg-pink-800 hover:bg-pink-400 w-30 h-12 rounded-md cursor-pointer">
          Logout
        </button>
      </div>
    </div>
  );
}

export default SecuritySetting;
