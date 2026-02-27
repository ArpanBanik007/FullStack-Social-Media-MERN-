import React from "react";
import LeftBar from "../home/LeftBar";
import Navbar from "../home/Navbar";
import Button from "../componants/Button";

function ProfileSettting() {
  return (
    <div className="bg-slate-800  flex flex-col ">
      <Navbar />
      <div className="bg-slate-600 w-[60%]  h-90 mt-2.5 ml-36 rounded-xl flex  items-center ">
        <img
          src="https://plus.unsplash.com/premium_photo-1673177667569-e3321a8d8256?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y292ZXIlMjBwaG90b3xlbnwwfHwwfHx8MA%3D%3D"
          alt="center"
          className="w-full h-full object-center"
        />
      </div>
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
      <div className="bg-slate-600 w-[60%]  h-22 mt-2.5 ml-36 rounded-xl pt-1.5 pl-5 mb-2.5">
        <div className="flex flex-row">
          <h2 className="text-2xl mt-2.5 text-gray-200 font-medium">Bio</h2>
          <input
            type="text"
            placeholder="Enter anything"
            className="h-15 w-90 ml-6 mt-1.5 border-2 text-slate-100 border-white rounded-2xl hover:border-gray-400"
          />
        </div>
      </div>
      <div className="bg-slate-600 w-[60%]  h-44 mt-2.5 ml-36 rounded-xl pt-1.5 pl-5 mb-2.5">
        <div className="flex flex-row mb-4">
          <h2 className="text-2xl mt-2.5 text-gray-200 font-medium">Email:</h2>
          <input
            type="text"
            placeholder=" Email"
            className="h-10 w-90 ml-17 mt-1.5 border-2 text-white border-white rounded-md hover:border-gray-400"
          />
        </div>
        <div className="flex flex-row">
          <h2 className="text-2xl mt-2.5 text-gray-200 font-medium">
            FullName:
          </h2>
          <input
            type="text"
            placeholder=" FullName"
            className="h-10 w-90 ml-6 mt-1.5 border-2 text-white border-white rounded-md hover:border-gray-400"
          />
        </div>

        <div
          className="bg-amber-800 h-8 hover:bg-amber-400 w-[15%] 
        flex justify-center items-center rounded-md cursor-pointer mt-3 ml-56"
        >
          <button className="flex justify-center items-center">Submit</button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettting;
