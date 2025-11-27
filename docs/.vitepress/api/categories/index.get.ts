import { defineHandler } from "nitro/h3";
import iconMetaData from '../../data/iconMetaData';

export default defineHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400');
  setResponseHeader(event, 'Access-Control-Allow-Origin', '*');

  return Object.fromEntries(
    Object.entries(iconMetaData).map(([name, { categories }]) => [name, categories]),
  );
});
