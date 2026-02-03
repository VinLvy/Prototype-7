import supabase from './supabase';

export const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Error in uploadAvatar:', error);
        return null;
    }
};


export const deleteAvatarFromUrl = async (url: string) => {
    try {
        const urlObj = new URL(url);
        // Supabase public URL structure: .../storage/v1/object/public/bucketName/filePath
        // We need 'filePath'. 
        // Strategy: match after the bucket name 'avatars'
        const parts = urlObj.pathname.split('/avatars/');

        if (parts.length < 2) {
            console.warn('Could not extract file path from URL:', url);
            return;
        }

        // Parts[1] is the file path. Decode it just in case.
        const filePath = decodeURIComponent(parts[1]);

        console.log('Attempting to delete file from storage:', filePath);

        const { data, error } = await supabase.storage
            .from('avatars')
            .remove([filePath]);

        if (error) {
            console.error('Error deleting old avatar:', error);
        } else {
            console.log('Successfully deleted old avatar:', data);
        }
    } catch (error) {
        console.error('Error in deleteAvatarFromUrl:', error);
    }
};

