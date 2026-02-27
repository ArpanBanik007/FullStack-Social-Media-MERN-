
import axios from "axios";



const getLocationFromIP = async (ip) => {
  try {
    const { data } = await axios.get(`https://ipapi.co/${ip}/json/`);
    return {
      ip,
      city: data.city || "Unknown",
      region: data.region || "Unknown",
      country: data.country_name || "Unknown",
    };
  } catch (error) {
    console.error("Error fetching location:", error.message);
    return {
      ip,
      city: "Unknown",
      region: "Unknown",
      country: "Unknown",
    };
  }
};

export default getLocationFromIP;
