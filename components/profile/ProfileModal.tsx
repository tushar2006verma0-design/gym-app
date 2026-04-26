import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { UserPlus, ShieldAlert, X, Check, Lock } from 'lucide-react';

export const ProfileModal = ({ user, onClose, currentProfile, authUser }: { user: any, onClose: () => void, currentProfile: any, authUser: any }) => {
  const [loading, setLoading] = useState(false);
  const [friendStatus, setFriendStatus] = useState<string | null>(null);
  const [targetProfile, setTargetProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const docSnap = await getDoc(doc(db, 'users', user.id));
      if (docSnap.exists()) {
        setTargetProfile({ id: docSnap.id, ...docSnap.data() });
      } else {
        setTargetProfile(user);
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const checkStatus = async () => {
      const friendDoc = await getDoc(doc(db, 'users', authUser.uid, 'friends', user.id));
      if (friendDoc.exists()) {
        setFriendStatus('friends');
        return;
      }
      const reqQ = query(collection(db, 'users', user.id, 'friendRequests'), where('senderId', '==', authUser.uid), where('status', '==', 'pending'));
      const reqSnap = await getDocs(reqQ);
      if (!reqSnap.empty) {
        setFriendStatus('pending');
      }
    };
    checkStatus();
  }, [user.id, authUser.uid]);

  const handleAddFriend = async () => {
    if (!currentProfile.isPremium && !currentProfile.proStatus) {
      alert("🔒 Upgrade to Premium to Add Friends");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'users', user.id, 'friendRequests'), {
        senderId: authUser.uid,
        receiverId: user.id,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      setFriendStatus('pending');
    } catch (err) {
      console.error(err);
      alert('Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    alert(`Blocked ${targetProfile?.username || user.username}.`);
    onClose();
  };

  if (!targetProfile) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0a0f1d] border border-white/10 rounded-3xl p-6 w-full max-w-sm relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 rounded-full"><X size={16}/></button>
        
        <div className="flex flex-col items-center mt-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 p-1 mb-4">
             <div className="w-full h-full rounded-full bg-[#0a0f1d] flex items-center justify-center text-3xl font-black text-white overflow-hidden relative">
                {targetProfile.profilePic ? (
                  <Image 
                    src={targetProfile.profilePic} 
                    fill 
                    className="object-cover" 
                    alt="Profile" 
                    referrerPolicy="no-referrer"
                  />
                ) : targetProfile.username?.[0]?.toUpperCase()}
             </div>
          </div>
          <h2 className="text-2xl font-black">{targetProfile.username}</h2>
          {(targetProfile.isPremium || targetProfile.proStatus) && <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded mt-1">PRO ATHLETE</span>}
          
          <p className="text-slate-400 text-sm mt-4 text-center px-4">
            {targetProfile.bio || "No neural bio provided."}
          </p>

          <div className="flex gap-2 w-full mt-6">
            <button 
              onClick={handleAddFriend}
              disabled={loading || friendStatus !== null}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors relative
                ${friendStatus === 'friends' ? 'bg-white/10 text-white' : 
                  friendStatus === 'pending' ? 'bg-amber-500/20 text-amber-500' :
                  'bg-emerald-500 hover:bg-emerald-400 text-slate-900'}`}
            >
              {friendStatus === 'friends' ? <><Check size={16}/> Friends</> : 
               friendStatus === 'pending' ? 'Request Sent' : 
               <><UserPlus size={16}/> Add Friend</>}
               
              {!currentProfile.isPremium && !currentProfile.proStatus && friendStatus === null && <Lock size={12} className="absolute right-3 top-3 text-emerald-800" />}
            </button>
            <button onClick={handleBlock} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors">
              <ShieldAlert size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
