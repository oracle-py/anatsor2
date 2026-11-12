// next/image, metadata and plain URLs to /public files do not get basePath
// added automatically, so prefix them with this.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const withBasePath = (path: string) => `${BASE_PATH}${path}`;
