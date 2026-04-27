import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { UserPlus, ShieldAlert, X, Check, Lock, Dumbbell, Flame, Flag, Edit2 } from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';

export const ProfileModal = ({ user, onClose, currentProfile, authUser }: { user: any, onClose: () => void, currentProfile: any, authUser: any }) => {
  const [loading, setLoading] = useState(false);
  const [friendStatus, setFriendStatus] = useState<string | null>(null);
  const [targetProfile, setTargetProfile] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'users', user.id), (docSnap) => {
      if (docSnap.exists()) {
        setTargetProfile({ id: docSnap.id, ...docSnap.data() });
      } else {
        setTargetProfile(user);
      }
    });
    return () => unsub();
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

  const handleReport = async () => {
    alert(`Reported ${targetProfile?.username || user.username}. Neural authorities have been notified.`);
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
          <h2 className="text-2xl font-black">{targetProfile.username || 'Unknown Athlete'}</h2>
          {(targetProfile.isPremium || targetProfile.proStatus) && <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded mt-1">PRO ATHLETE</span>}
          
          <p className="text-slate-400 text-sm mt-4 text-center px-4 mb-6">
            {targetProfile.bio || "No neural bio provided."}
          </p>

          <div className="flex w-full justify-around bg-black/20 p-3 rounded-xl border border-white/5 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                <Dumbbell size={16} />
              </div>
              <p className="text-sm font-black">{targetProfile.workoutsCompleted || 0}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Workouts</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                <Flame size={16} />
              </div>
              <p className="text-sm font-black">{targetProfile.streak || 0}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Days</p>
            </div>
          </div>

          <div className="flex gap-2 w-full">
            {targetProfile.id === authUser.uid ? (
              <button 
                onClick={() => setIsEditOpen(true)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors bg-white/10 hover:bg-white/20 text-white"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            ) : (
              <>
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
                <div className="flex gap-2">
                  <button onClick={handleBlock} title="Block" className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors">
                    <ShieldAlert size={20} />
                  </button>
                  <button onClick={handleReport} title="Report" className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors">
                    <Flag size={20} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {isEditOpen && <EditProfileModal userProfile={targetProfile} onClose={() => setIsEditOpen(false)} />}
    </div>
  );
}
