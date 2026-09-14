const ImageKit = require('imagekit');

/**
 * Check if ImageKit configuration environment variables exist
 * @returns {boolean}
 */
const isConfigured = () => {
  return !!(
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
  );
};

/**
 * Get initialized ImageKit client instance
 * @returns {ImageKit|null}
 */
const getImageKit = () => {
  if (!isConfigured()) {
    return null;
  }
  return new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
};

module.exports = {
  isConfigured,
  getImageKit,
};
