import React, { useState, useEffect } from "react";
import axios from "axios";
import UpperFeedpage from "../Feed/UpperFeed";
import MainFeed from "../Feed/MainFeed";

function Feedpage() {
  return (
    <div className="flex flex-col">
      <UpperFeedpage />
      <MainFeed />
    </div>
  );
}

export default Feedpage;
