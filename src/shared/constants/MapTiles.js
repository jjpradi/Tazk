const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

export const MAPTILER_TILE_URL = `https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;

export const MAPTILER_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const osmMapTiler = {
  mapTiler: {
    url: MAPTILER_TILE_URL,
    attribution: MAPTILER_ATTRIBUTION,
  },
};
