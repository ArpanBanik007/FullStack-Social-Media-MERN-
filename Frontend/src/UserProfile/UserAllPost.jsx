import React from "react";
const dummyPosts = [
  {
    id: 1,
    time: "2h ago",
    text: "আজকে কোডিং মুড অন 🔥",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM-p7NO098zG1st_71BElz3_FOSBRz-3tDZA&s",
  },
  {
    id: 2,
    time: "5h ago",
    text: "Chilling with friends 😎",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM-p7NO098zG1st_71BElz3_FOSBRz-3tDZA&s",
  },
  {
    id: 3,
    time: "1d ago",
    text: "My new painting 🎨",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM-p7NO098zG1st_71BElz3_FOSBRz-3tDZA&s",
  },
  {
    id: 4,
    time: "2d ago",
    text: "Another post ✨",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM-p7NO098zG1st_71BElz3_FOSBRz-3tDZA&s",
  },
  {
    id: 5,
    time: "2d ago",
    text: "Another post ✨",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM-p7NO098zG1st_71BElz3_FOSBRz-3tDZA&s",
  },
  {
    id: 6,
    time: "2d ago",
    text: "Another post ✨",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM-p7NO098zG1st_71BElz3_FOSBRz-3tDZA&s",
  },
];
function UserAllPost() {
  return (
    <div className="p-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {dummyPosts.map((post) => (
          <div
            key={post.id}
            className="bg-slate-900 rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-300"
          >
            <img
              src={post.image}
              alt={post.text}
              className="w-full h-70 object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserAllPost;
