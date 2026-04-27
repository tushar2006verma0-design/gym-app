import React, { useState } from 'react';
import Image from 'next/image';
import { Calendar, Dumbbell, Flame, Trophy, Edit2, Hexagon } from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';

export const ProfilePage = ({ userProfile }: { userProfile: any }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const stats = [
    { label: 'Workouts', val: userProfile?.workoutsCompleted || 0, icon: Dumbbell, color: 'text-emerald-400' },
    { label: 'Streak', val: `${userProfile?.streak || 0} Days`, icon: Flame, color: 'text-amber-400' },
  ];

  const achievements = userProfile?.achievements || ['First Login', 'Neural Sync Complete'];

  const joinDate = userProfile?.createdAt 
    ? new Date(userProfile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : 'Recently Joined';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Profile Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-emerald-500/20 to-blue-500/20" />
        
        <div className="relative pt-16 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
          <div className="w-32 h-32 bg-[#0a0f1d] border-4 border-[#0a0f1d] rounded-full flex items-center justify-center font-black text-4xl text-white shadow-2xl relative overflow-hidden shrink-0">
            {userProfile?.profilePic ? (
              <Image 
                src={userProfile.profilePic} 
                fill 
                className="object-cover" 
                alt="Profile" 
                referrerPolicy="no-referrer"
              />
            ) : userProfile?.username?.[0]?.toUpperCase()}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
              <h2 className="text-3xl font-black">{userProfile?.username || 'Unknown Athlete'}</h2>
              {(userProfile?.isPremium || userProfile?.proStatus) && (
                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">
                  <Hexagon size={12} className="fill-amber-500/20" /> PRO_ATHLETE
                </span>
              )}
            </div>
            
            <p className="text-slate-400 text-sm max-w-lg mb-4">
              {userProfile?.bio || "No neural bio provided. Establish intent and record your baseline."}
            </p>
            
            <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar size={14} /> Joined {joinDate}
              </div>
            </div>
          </div>
          
          <div className="shrink-0 mt-4 md:mt-0 w-full md:w-auto">
            <button 
              onClick={() => setIsEditOpen(true)}
              className="w-full md:w-auto justify-center bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold px-6 py-3 md:py-2.5 rounded-xl flex items-center gap-2 transition-colors text-sm uppercase tracking-widest"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Section */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <h3 className="font-bold uppercase tracking-widest text-xs mb-6 text-slate-400">Neural Stats</h3>
            <div className="space-y-4">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                  <div className={`p-3 rounded-lg bg-white/5 ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white">{stat.val}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <h3 className="font-bold uppercase tracking-widest text-xs mb-6 text-slate-400">Honors & Achievements</h3>
            {achievements.length === 0 ? (
              <div className="text-center p-8 bg-black/20 rounded-xl border border-white/5 border-dashed">
                <Trophy size={32} className="mx-auto text-slate-600 mb-3" />
                <p className="text-slate-500 font-bold text-sm">No achievements unlocked yet.</p>
                <p className="text-xs text-slate-600 mt-1">Keep training to earn badges.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((ach: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-gradient-to-r from-amber-500/10 to-transparent p-4 rounded-xl border border-amber-500/20 hover:from-amber-500/20 transition-colors">
                    <Trophy size={20} className="text-amber-500 shrink-0" />
                    <span className="font-bold text-sm text-slate-200">{ach}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditOpen && <EditProfileModal userProfile={userProfile} onClose={() => setIsEditOpen(false)} />}
    </div>
  );
};
