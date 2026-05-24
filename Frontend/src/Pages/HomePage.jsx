import React from "react";
import Navbar from "../home/Navbar";
import LeftBar from "../home/LeftBar";
import Feedpage from "../home/Feedpage";
import RightBar from "../home/RightBar";

function HomePage() {
  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          background-color: #0a0e1a;
        }

        .homepage-root {
          min-height: 100vh;
          background-color: #0a0e1a;
          display: flex;
          flex-direction: column;
        }

        .homepage-body {
          display: flex;
          flex-direction: row;
          width: 100%;
          flex: 1;
          position: relative;
        }

        /* LEFT SIDEBAR */
        .homepage-left {
          width: 220px;
          min-width: 220px;
          position: sticky;
          top: 64px;
          height: calc(100vh - 64px);
          overflow-y: auto;
          background-color: #0d1117;
          border-right: 1px solid #1e2738;
          flex-shrink: 0;
        }

        /* CENTER FEED */
        .homepage-feed {
          flex: 1;
          min-width: 0;
          padding: 20px 24px;
          overflow-y: auto;
          height: calc(100vh - 64px);
          position: sticky;
          top: 64px;
        }

        .homepage-feed-inner {
          max-width: 640px;
          margin: 0 auto;
        }

        /* RIGHT SIDEBAR */
        .homepage-right {
          width: 260px;
          min-width: 260px;
          position: sticky;
          top: 64px;
          height: calc(100vh - 64px);
          overflow-y: auto;
          background-color: #0d1117;
          border-left: 1px solid #1e2738;
          flex-shrink: 0;
        }

        /* SCROLLBAR HIDE */
        .homepage-left::-webkit-scrollbar,
        .homepage-feed::-webkit-scrollbar,
        .homepage-right::-webkit-scrollbar {
          width: 0px;
        }

        /* RESPONSIVE */
        @media (max-width: 1100px) {
          .homepage-right {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .homepage-left {
            display: none;
          }
          .homepage-feed {
            padding: 16px 12px;
          }
        }
      `}</style>

      <div className="homepage-root">
        <Navbar />

        <div className="homepage-body">
          {/* Left Sidebar */}
          <div className="homepage-left">
            <LeftBar />
          </div>

          {/* Center Feed */}
          <div className="homepage-feed">
            <div className="homepage-feed-inner">
              <Feedpage />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="homepage-right">
            <RightBar />
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
