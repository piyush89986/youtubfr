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

  // Prepend backend port 5000 for relative uploads paths
  const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendBase}${cleanPath}`;
};

export default getMediaUrl;
