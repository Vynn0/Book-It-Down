import { useState } from 'react'
import { supabase } from '../../utils/supabase'
import { DateTimeUtils } from '../../utils/dateUtils'

export interface RoomImage {
  image_id: number
  room_id: number
  image_url: string
  image_name: string
  is_primary: boolean
  display_order: number
  created_at: string
}

export interface UseRoomImagesReturn {
  images: RoomImage[]
  isLoading: boolean
  error: string | null
  uploadImage: (roomId: number, file: File, isPrimary?: boolean) => Promise<{ success: boolean; message: string; imageId?: number }>
  deleteImage: (imageId: number) => Promise<{ success: boolean; message: string }>
  getRoomImages: (roomId: number) => Promise<{ success: boolean; images?: RoomImage[]; message: string }>
  setPrimaryImage: (imageId: number, roomId: number) => Promise<{ success: boolean; message: string }>
  reorderImages: (roomId: number, imageIds: number[]) => Promise<{ success: boolean; message: string }>
}

export const useRoomImages = (): UseRoomImagesReturn => {
  const [images, setImages] = useState<RoomImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Get all images for a specific room
   */
  const getRoomImages = async (roomId: number): Promise<{ success: boolean; images?: RoomImage[]; message: string }> => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('room_images')
        .select('*')
        .eq('room_id', roomId)
        .order('display_order', { ascending: true })
        .order('image_id', { ascending: true }) // Secondary sort by image_id if display_order is same

      if (fetchError) {
        throw fetchError
      }

      const roomImages = data || []
      setImages(roomImages)

      return {
        success: true,
        images: roomImages,
        message: `Successfully loaded ${roomImages.length} images`
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load room images'
      setError(errorMessage)
      console.error('Error fetching room images:', err)
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Upload image to Supabase storage and create database record
   */
  const uploadImage = async (
    roomId: number, 
    file: File, 
    isPrimary: boolean = false
  ): Promise<{ success: boolean; message: string; imageId?: number }> => {
    try {
      setIsLoading(true)
      setError(null)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `room_${roomId}_${Date.now()}.${fileExt}`
      const filePath = `${roomId}/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('room-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('room-images')
        .getPublicUrl(filePath)

      if (!urlData.publicUrl) {
        throw new Error('Failed to generate public URL')
      }

      // If this is set as primary, remove primary flag from other images
      if (isPrimary) {
        await supabase
          .from('room_images')
          .update({ is_primary: false })
          .eq('room_id', roomId)
      }

      // Get the next display order
      const { data: orderData } = await supabase
        .from('room_images')
        .select('display_order')
        .eq('room_id', roomId)
        .order('display_order', { ascending: false })
        .limit(1)

      const nextOrder = orderData && orderData.length > 0 
        ? (orderData[0].display_order || 0) + 1 
        : 1

      // Create database record
      const { data: dbData, error: dbError } = await supabase
        .from('room_images')
        .insert([{
          room_id: roomId,
          image_url: urlData.publicUrl,
          image_name: fileName,
          is_primary: isPrimary,
          display_order: nextOrder,
          created_at: DateTimeUtils.toUTC(DateTimeUtils.now()).toISOString()
        }])
        .select()
        .single()

      if (dbError) {
        // If database insert fails, clean up uploaded file
        await supabase.storage
          .from('room-images')
          .remove([filePath])
        throw dbError
      }

      // Refresh room images
      await getRoomImages(roomId)

      return {
        success: true,
        message: 'Image uploaded successfully!',
        imageId: dbData.image_id
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload image'
      setError(errorMessage)
      console.error('Error uploading image:', err)
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Delete image from storage and database
   */
  const deleteImage = async (imageId: number): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true)
      setError(null)

      // Get image record to find file path
      const { data: imageData, error: fetchError } = await supabase
        .from('room_images')
        .select('*')
        .eq('image_id', imageId)
        .single()

      if (fetchError || !imageData) {
        throw new Error('Image not found')
      }

      // Extract file path from URL
      const url = new URL(imageData.image_url)
      const pathParts = url.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === 'room-images')
      const filePath = pathParts.slice(bucketIndex + 1).join('/')

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('room-images')
        .remove([filePath])

      if (storageError) {
        console.warn('Failed to delete from storage:', storageError)
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('room_images')
        .delete()
        .eq('image_id', imageId)

      if (dbError) {
        throw dbError
      }

      // If deleted image was primary, make the first remaining image primary
      if (imageData.is_primary) {
        const { data: remainingImages } = await supabase
          .from('room_images')
          .select('image_id')
          .eq('room_id', imageData.room_id)
          .order('display_order', { ascending: true })
          .limit(1)

        if (remainingImages && remainingImages.length > 0) {
          await supabase
            .from('room_images')
            .update({ is_primary: true })
            .eq('image_id', remainingImages[0].image_id)
        }
      }

      // Refresh room images
      await getRoomImages(imageData.room_id)

      return {
        success: true,
        message: 'Image deleted successfully!'
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete image'
      setError(errorMessage)
      console.error('Error deleting image:', err)
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Set an image as primary (thumbnail)
   */
  const setPrimaryImage = async (imageId: number, roomId: number): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true)
      setError(null)

      // Remove primary flag from all images in the room
      await supabase
        .from('room_images')
        .update({ is_primary: false })
        .eq('room_id', roomId)

      // Set the specified image as primary
      const { error: updateError } = await supabase
        .from('room_images')
        .update({ is_primary: true })
        .eq('image_id', imageId)

      if (updateError) {
        throw updateError
      }

      // Refresh room images
      await getRoomImages(roomId)

      return {
        success: true,
        message: 'Primary image updated successfully!'
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update primary image'
      setError(errorMessage)
      console.error('Error setting primary image:', err)
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Reorder images (update display_order)
   */
  const reorderImages = async (roomId: number, imageIds: number[]): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true)
      setError(null)

      // Update display_order for each image
      const updates = imageIds.map((imageId, index) => 
        supabase
          .from('room_images')
          .update({ display_order: index + 1 })
          .eq('image_id', imageId)
          .eq('room_id', roomId)
      )

      const results = await Promise.all(updates)
      const hasError = results.some(result => result.error)

      if (hasError) {
        throw new Error('Failed to update image order')
      }

      // Refresh room images
      await getRoomImages(roomId)

      return {
        success: true,
        message: 'Image order updated successfully!'
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reorder images'
      setError(errorMessage)
      console.error('Error reordering images:', err)
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    images,
    isLoading,
    error,
    uploadImage,
    deleteImage,
    getRoomImages,
    setPrimaryImage,
    reorderImages
  }
}