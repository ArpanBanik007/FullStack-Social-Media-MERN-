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
          background-color: var(--bg-deep);
          position: relative;
          overflow: hidden;
        }

        .blob-1 { top: -10%; left: -10%; animation: pulse-glow 8s infinite ease-in-out; }
        .blob-2 { bottom: -10%; right: -10%; animation: pulse-glow 12s infinite ease-in-out; background: radial-gradient(circle, rgba(110, 231, 255, 0.05) 0%, transparent 70%); }
        .blob-3 { top: 40%; right: 20%; animation: pulse-glow 10s infinite ease-in-out; width: 300px; height: 300px; opacity: 0.5; }

        .homepage-feed {
          margin-left: 280px;
          margin-right: 260px;
          padding-top: 24px;
          min-height: calc(100vh - 70px);
          position: relative;
          z-index: 1;
        }

        @media (max-width: 1100px) {
          .homepage-feed {
            margin-left: 260px;
            margin-right: 0;
          }
        }

        @media (max-width: 768px) {
          .homepage-feed {
            margin-left: 0;
            margin-right: 0;
            padding-top: 16px;
            padding-left: 12px;
            padding-right: 12px;
          }
        }
      `}</style>

      <div className="homepage-root">
        {/* Animated Background Blobs */}
        <div className="bg-blob blob-1" />
        <div className="bg-blob blob-2" />
        <div className="bg-blob blob-3" />

        <Navbar />

        <div className="flex justify-center w-full">
          {/* Left sidebar */}
          <div className="hidden md:block">
            <LeftBar />
          </div>

          {/* Main feed */}
          <div className="homepage-feed w-full max-w-[640px]">
            <Feedpage />
          </div>

          {/* Right sidebar */}
          <div className="hidden lg:block">
            <RightBar />
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
