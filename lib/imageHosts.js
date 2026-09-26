/**
 * imageHosts.js
 * Image hosts that next/image is allowed to optimize. Plain JS so that
 * next.config.js can import it as well as the app code.
 *
 * Images from any other https host still display (as a plain <img>),
 * they just skip Next's resizing. Add your S3 bucket / CDN host here,
 * e.g. 'my-bucket.s3.us-east-1.amazonaws.com'.
 */

/** @type {string[]} */
export const OPTIMIZED_IMAGE_HOSTS = [];

/**
 * True when the URL is https and its host is in OPTIMIZED_IMAGE_HOSTS.
 * @param {string} url
 */
export function isOptimizedImageUrl(url) {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' && OPTIMIZED_IMAGE_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

/**
 * True when the URL is a well-formed https URL (any host).
 * @param {string} url
 */
export function isHttpsUrl(url) {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}
