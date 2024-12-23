import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { FileIcon, XIcon } from "lucide-react";

interface MediaUploadProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function MediaUpload({ formData, setFormData }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const mediaFiles = Array.from(files);
    
    try {
      const mediaItems = mediaFiles.map(file => ({
        name: file.name,
        type: file.type || 'application/octet-stream', // Default type for unknown files
        size: file.size,
        file: file,
        url: URL.createObjectURL(file)
      }));

      setFormData({
        ...formData,
        media: [...(formData.media || []), ...mediaItems]
      });

      toast({
        title: "Success",
        description: `${files.length} file(s) added successfully`
      });
    } catch (error) {
      console.error("Error processing files:", error);
      toast({
        title: "Error",
        description: "Failed to process files",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    const updatedMedia = formData.media.filter((_: any, i: number) => i !== index);
    // Clean up the URL to prevent memory leaks
    if (formData.media[index]?.url) {
      URL.revokeObjectURL(formData.media[index].url);
    }
    setFormData({
      ...formData,
      media: updatedMedia
    });
  };

  const getFilePreview = (item: any) => {
    if (item.type.startsWith('image/')) {
      return (
        <img
          src={item.url}
          alt={item.name}
          className="w-full h-24 object-cover rounded"
        />
      );
    } else if (item.type === 'application/pdf') {
      return (
        <div className="flex items-center justify-center h-24 bg-gray-100 rounded">
          <FileIcon className="w-8 h-8 text-red-500" />
          <span className="ml-2 text-sm">{item.name}</span>
        </div>
      );
    } else if (item.type.startsWith('video/')) {
      return (
        <video
          src={item.url}
          className="w-full h-24 object-cover rounded"
          controls
        />
      );
    } else if (item.type.startsWith('audio/')) {
      return (
        <audio
          src={item.url}
          className="w-full h-12"
          controls
        />
      );
    } else {
      return (
        <div className="flex items-center justify-center h-24 bg-gray-100 rounded">
          <FileIcon className="w-8 h-8 text-gray-500" />
          <span className="ml-2 text-sm">{item.name}</span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="w-full">
        <label className="text-sm font-medium block mb-1.5">Upload Media Files</label>
        <Input
          type="file"
          multiple
          accept="*/*" // Accept all file types
          onChange={handleFileChange}
          disabled={uploading}
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-1">
          Upload any type of files. Multiple files allowed.
        </p>
      </div>

      {formData.media && formData.media.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {formData.media.map((item: any, index: number) => (
            <div key={index} className="relative group">
              {getFilePreview(item)}
              <button
                onClick={() => removeMedia(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 
                         opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove file"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}