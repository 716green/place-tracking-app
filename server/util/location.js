const axios = require('axios');

const API_KEY =
  'AAPKcf12969575f64de7b5009c06553bd7970WIi7BKakY-D6gPDSTXoRRHWP9rlUkkLfUr4P0SN3K30apOX0awFBPZwYnZF21uC';

const getGeocode = async (address) => {
  const baseUrl =
    'https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer';
  const url = `${baseUrl}/findAddressCandidates?address=${address}&f=json&token=${API_KEY}`;

  await axios.get(url).then(async (response) => {
    const { x, y } = await response.data.candidates[0].location;
    location = {
      lat: 0,
      lng: 0,
    };

    location.lat = y;
    location.lng = x;

    return location;
  });
  console.log({ location });
  return location;
};

module.exports = getGeocode;
