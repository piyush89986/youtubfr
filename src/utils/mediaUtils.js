export const getBackendBase = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  }
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'https://youtubeback-osll.onrender.com';
  }
  return 'http://localhost:5000';
};

/**
 * Helper to resolve video URLs (handles Cloudinary, S3, or local Express backend /uploads)
 */
export const getMediaUrl = (url) => {
  if (!url) return '';
  
  if (
    url.startsWith('http://') || 
    url.startsWith('https://') || 
    url.startsWith('blob:') || 
    url.startsWith('data:')
  ) {
    return url;
  }

  // Prepend backend base for relative uploads paths
  const backendBase = getBackendBase();
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendBase}${cleanPath}`;
};

export default getMediaUrl;
