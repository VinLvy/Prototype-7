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
        // Extract file path from URL
        // Assumes URL format: .../avatars/filename
        const parts = url.split('/avatars/');
        if (parts.length < 2) return;
        const filePath = parts[1];

        const { error } = await supabase.storage
            .from('avatars')
            .remove([filePath]);

        if (error) {
            console.error('Error deleting old avatar:', error);
        }
    } catch (error) {
        console.error('Error in deleteAvatarFromUrl:', error);
    }
};
