import React from "react";
import { useNavigate } from "react-router-dom";

function RightBar() {
  const navigate = useNavigate();

  const users = [
    {
      id: 1,
      name: "Arpan Banik",
      username: "arpan007",
      avatar:
        "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
    },
    {
      id: 2,
      name: "Soma Banik",
      username: "soma007",
      avatar:
        "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
    },
    {
      id: 3,
      name: "Abhinaba Banik",
      username: "abhinaba007",
      avatar:
        "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
    },
    {
      id: 4,
      name: "Ajit Banik",
      username: "ajit007",
      avatar:
        "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
    },
    {
      id: 5,
      name: "Ankit Mondal",
      username: "ankit007",
      avatar:
        "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
    },
    {
      id: 6,
      name: "Sangita Mondal",
      username: "sangita007",
      avatar:
        "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
    },
    {
      id: 7,
      name: "Aditya Shee",
      username: "adi007",
      avatar:
        "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
    },
    {
      id: 8,
      name: "Ankit Mondal",
      username: "arpan007",
      avatar:
        "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
    },
    {
      id: 9,
      name: "Ankit Mondal",
      username: "arpan007",
      avatar:
        "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
    },
  ];

  return (
    <div
      className="fixed top-15 right-2 w-[26%] h-screen 
        bg-cyan-300 rounded-xl shadow-lg 
        overflow-y-auto scrollbar-thin 
        scrollbar-thumb-gray-300 scrollbar-track-gray-300 p-4"
    >
      <h2 className="text-xl flex justify-center font-semibold mb-2">
        Your Followers
      </h2>
      <div onClick={() => navigate("/profile/user")} className=" pb-15">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-slate-300 flex items-center gap-3 p-3
           rounded-xl shadow-md w-full mt-1.5 cursor-pointer hover:bg-slate-200 transition"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <p className="font-bold text-gray-900">{user.username}</p>
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RightBar;
