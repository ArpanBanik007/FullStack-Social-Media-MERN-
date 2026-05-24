import React from "react";
import UpperFeedpage from "../Feed/UpperFeed";
import MainFeed from "../Feed/MainFeed";

function Feedpage() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <UpperFeedpage />
      <MainFeed />
    </div>
  );
}

export default Feedpage;
