'use client'

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { updateProfile } from "./actions"
import Image from "next/image"

interface ProfileFormProps {
  profile: {
    bio: string | null
    avatarUrl: string | null
    name: string
  }
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    setLoading(true)

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      setAvatarUrl(data.publicUrl)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Error uploading avatar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={updateProfile} className="space-y-6 max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200">
          {avatarUrl ? (
            <Image 
              src={avatarUrl} 
              alt="Avatar" 
              fill 
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Img
            </div>
          )}
        </div>
        <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
          {loading ? 'Uploading...' : 'Change Photo'}
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleUpload} 
            disabled={loading}
          />
        </label>
        <input type="hidden" name="avatarUrl" value={avatarUrl || ''} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input 
          type="text" 
          value={profile.name} 
          disabled 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea 
          id="bio" 
          name="bio" 
          rows={4} 
          defaultValue={profile.bio || ''}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Tell us about your services..."
        />
      </div>

      <button 
        type="submit" 
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Save Profile
      </button>
    </form>
  )
}
