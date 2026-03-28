import React from "react";
import Navbar from "../home/Navbar";

function ProfileSettting() {
  return (
    <div className="bg-gray-950 min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {/* Cover Photo */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden h-44 relative">
          <img
            src="https://plus.unsplash.com/premium_photo-1673177667569-e3321a8d8256?fm=jpg&q=60&w=3000"
            alt="cover"
            className="w-full h-full object-cover"
          />
          <button className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-opacity-80">
            Change Cover
          </button>
        </div>

        {/* Avatar + Name */}
        <div className="bg-gray-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="relative">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCn-TbanZWBS1uNFOOkr8QavCC0A9p-4SaFw&s"
              alt="avatar"
              className="h-16 w-16 rounded-full object-cover border-2 border-blue-500"
            />
            <button className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              +
            </button>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Arpan Banik</h4>
            <p className="text-sm text-gray-400">@arpanbanik007</p>
          </div>
        </div>

        {/* Edit Info Card */}
        <div className="bg-gray-800 rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="text-white font-semibold text-lg">Edit Profile</h2>

          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">Bio</label>
            <input
              type="text"
              placeholder="Write something about you..."
              className="bg-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              className="bg-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              className="bg-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold py-2.5 rounded-xl cursor-pointer">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettting;
