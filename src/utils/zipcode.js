import axios from "axios";

const API_KEY = import.meta.env.ZIP_BASE_KEY;
const BASE_URL = "https://app.zipcodebase.com/api/v1";

export async function validateZipCode(zipCode, city) {
  console.log(`Validating zip code: ${zipCode} for city: ${city}`);
  try {
    const response = await axios.get(`${BASE_URL}/code/city`, {
      params: {
        apikey: "be265b90-420a-11ef-8e79-69f8251bacaf",
        city: city,
        country: "EC",
      },
    });

    console.log("API Response:", response.data);

    if (response.data && response.data.results) {
      const validZipCodes = response.data.results;
      console.log("Valid zip codes for the city:", validZipCodes);

      const isValid = validZipCodes.includes(zipCode);

      console.log("Is zip code valid?", isValid);
      return isValid;
    }

    console.log("No results found for the city");
    return false;
  } catch (error) {
    console.error("Error validating zip code:", error);
    return false;
  }
}
