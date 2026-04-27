import React, { useState, useRef } from 'react';
import { X, Camera, Save, Loader2 } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

export const EditProfileModal = ({ userProfile, onClose }: { userProfile: any, onClose: () => void }) => {
  const [bio, setBio] = useState(userProfile.bio || '');
  const [loading, setLoading] = useState(false);
  const [previewPic, setPreviewPic] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      setFileToUpload(file);
      setPreviewPic(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let newProfilePic = userProfile.profilePic;

      if (fileToUpload) {
        const storageRef = ref(storage, `profiles/${userProfile.id}/${Date.now()}_${fileToUpload.name}`);
        await uploadBytes(storageRef, fileToUpload);
        newProfilePic = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, 'users', userProfile.id), {
        bio: bio,
        profilePic: newProfilePic
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      alert('Failed to update profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0a0f1d] border border-white/10 rounded-3xl p-6 w-full max-w-sm relative shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black uppercase tracking-widest text-white">Edit Profile</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex justify-center mb-6 relative">
          <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-3xl font-black text-white overflow-hidden relative border-2 border-emerald-500/30">
            {(previewPic || userProfile.profilePic) ? (
              <Image 
                src={previewPic || userProfile.profilePic} 
                fill 
                className="object-cover" 
                alt="Profile" 
                referrerPolicy="no-referrer"
              />
            ) : userProfile.username?.[0]?.toUpperCase()}
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              <Camera size={24} className="text-white" />
            </button>
          </div>
          <input 
             type="file" 
             className="hidden" 
             ref={fileInputRef} 
             accept="image/*" 
             onChange={handleFileChange} 
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Username</label>
            <input 
              disabled
              value={userProfile.username}
              title="Username cannot be changed."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
              Bio <span className="font-normal">({bio.length}/150)</span>
            </label>
            <textarea 
              maxLength={150}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Add your neural bio..."
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors resize-none h-24"
            />
          </div>

          <button 
            disabled={loading}
            onClick={handleSave} 
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>
    </div>
  );
};
