import appConfig from "@/config/app-config";
import { useState, useEffect } from "react";

interface UserLocation {
  ip: string;
  country: string;
  city: string;
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
      setUserLocation({ ip, country, city });
    } catch (error) {
      console.error("Error fetching user location:", error);
      setError("Failed to fetch location");
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return { userLocation, error };
};

export default useLocation;
