// useLocationSearch.ts
import { useState } from "react";

export const useLocationSearch = () => {
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [searchResult, setSearchResult] = useState<any | null>();

  const handleSearch = async () => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${searchLocation}&format=json`
    );
    const result = await response.json();
    if (result.length > 0) {
      setSearchResult(result[0]);
    }
  };

  return {
    searchLocation,
    setSearchLocation,
    searchResult,
    handleSearch,
  };
};
