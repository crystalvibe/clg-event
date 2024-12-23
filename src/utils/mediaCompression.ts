import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File): Promise<Blob> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: true
  };
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Error compressing image:', error);
    return file;
  }
}; 