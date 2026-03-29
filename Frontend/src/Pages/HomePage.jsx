import React from "react";
import Navbar from "../home/Navbar";
import LeftBar from "../home/LeftBar";
import Feedpage from "../home/Feedpage";
import RightBar from "../home/RightBar";

function HomePage() {
  return (
    <>
      <style>{`
        .homepage-root {
          min-height: 100vh;
          background: radial-gradient(ellipse at 15% 40%, rgba(6,182,212,0.05) 0%, transparent 55%),
                      radial-gradient(ellipse at 85% 10%, rgba(99,102,241,0.05) 0%, transparent 55%),
                      #0f172a;
        }

        /* Feed center column — sits between the two fixed sidebars */
        .homepage-feed {
          margin-left: 260px;
          margin-right: 250px;
          padding-top: 16px;
          min-height: calc(100vh - 60px);
        }

        @media (max-width: 1024px) {
          .homepage-feed {
            margin-left: 252px;
            margin-right: 0;
          }
        }

        @media (max-width: 768px) {
          .homepage-feed {
            margin-left: 0;
            margin-right: 0;
            padding-top: 12px;
          }
        }
      `}</style>

      <div className="homepage-root">
        <Navbar />

        {/* Left sidebar — hidden on mobile */}
        <div className="hidden md:block">
          <LeftBar />
        </div>

        {/* Main feed */}
        <div className="homepage-feed">
          <Feedpage />
        </div>

        {/* Right sidebar — hidden on smaller screens */}
        <div className="hidden lg:block">
          <RightBar />
        </div>
      </div>
    </>
  );
}

export default HomePage;
