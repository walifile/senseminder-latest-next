import appConfig from "@/config/app-config";
import { useState, useEffect } from "react";

import { UAParser } from "ua-parser-js";

interface UserLocation {
  ip: string;
  country: string;
  city: string;
  browser: string;
  os: string;
}
const { IPINFO_URL } = appConfig;

const useLocation = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = async () => {
    try {
      const response = await fetch(IPINFO_URL);
      const data = await response.json();
      const { ip, country, city } = data;

      const parser = new UAParser();
      const result = parser.getResult();

      setUserLocation({
        ip,
        country,
        city,
        browser: result.browser.name || "Unknown Browser",
        os: result.os.name || "Unknown OS",
      });
    } catch (err) {
      console.error("Error fetching user location:", err);
      setError("Failed to fetch location");
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return { userLocation, error };
};

export default useLocation;
