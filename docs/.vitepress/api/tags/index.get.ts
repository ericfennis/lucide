import iconMetaData from '../../data/iconMetaData';
import { defineHandler } from "nitro/h3";

export default defineHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400');
  setResponseHeader(event, 'Access-Control-Allow-Origin', '*');

  return Object.fromEntries(Object.entries(iconMetaData).map(([name, { tags }]) => [name, tags]));
});
