import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface MediaUploadProps {
  onMediaChange: (files: File[]) => void;
}

export function MediaUpload({ onMediaChange }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      
      // Validate files
      const validFiles = files.filter(file => {
        // Only validate file type
        const validTypes = ['image/', 'video/', 'audio/', 'application/pdf'];
        const isValidType = validTypes.some(type => file.type.startsWith(type));
        
        if (!isValidType) {
          toast({
            title: "Error",
            description: `${file.name} has an invalid file type`,
            variant: "destructive"
          });
        }
        
        return isValidType;
      });

      // Pass valid files directly to parent
      onMediaChange(validFiles);
      
      if (validFiles.length > 0) {
        toast({
          title: "Success",
          description: `${validFiles.length} file(s) added successfully`,
        });
      }
    } catch (error) {
      console.error('File processing failed:', error);
      toast({
        title: "Error",
        description: "Failed to process files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset input value to allow selecting the same file again
      const input = document.getElementById('media-upload') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        accept="image/*,video/*,audio/*,.pdf"
        className="hidden"
        id="media-upload"
      />
      <Button
        type="button"
        disabled={uploading}
        onClick={() => document.getElementById('media-upload')?.click()}
        className="w-full"
      >
        {uploading ? 'Processing Files...' : 'Add Media Files'}
      </Button>
    </div>
  );
} 