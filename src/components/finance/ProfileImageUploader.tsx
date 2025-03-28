
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileImageUploaderProps {
  defaultImage?: string;
  onImageChange: (imageUrl: string | null) => void;
}

const ProfileImageUploader = ({ defaultImage, onImageChange }: ProfileImageUploaderProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(defaultImage || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size exceeds 5MB limit");
      return;
    }

    // File type validation
    if (!file.type.match('image.*')) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageUrl(result);
      onImageChange(result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageUrl(null);
    onImageChange(null);
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="profile-image">Profile Image / Business Logo</Label>
      <div className="flex items-center gap-4">
        <Avatar className="h-24 w-24 border">
          <AvatarImage src={imageUrl || ''} alt="Profile" />
          <AvatarFallback className="bg-monify-purple-100 text-monify-purple-500 text-xl">
            {imageUrl ? '...' : 'UI'}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Button 
            type="button" 
            variant="outline" 
            className="relative overflow-hidden"
          >
            <Upload className="h-4 w-4 mr-2" />
            <span>Upload Image</span>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </Button>
          {imageUrl && (
            <Button type="button" variant="ghost" size="sm" onClick={removeImage} className="text-red-500">
              <X className="h-4 w-4 mr-1" /> 
              Remove Image
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUploader;
