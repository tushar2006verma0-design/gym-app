'use client';
import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, serverTimestamp, writeBatch, doc, setDoc } from 'firebase/firestore';
import { Send, Image as ImageIcon, Search, ShieldAlert, Lock, Clock } from 'lucide-react';
import { ProfileModal } from '@/components/profile/ProfileModal';

export const WorldChatView = ({ userProfile, authUser, onUpgrade }: { userProfile: any, authUser: any, onUpgrade: () => void }) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [countdown, setCountdown] = useState<string>('');
  const [viewingProfile, setViewingProfile] = useState<any>(null); // Add profile modal state
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setHasMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const qDesc = query(collection(db, 'messages'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(qDesc, (snapshot) => {
      const msgs: any[] = [];
      snapshot.forEach(doc => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs.reverse());
      setLoadingMessages(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, []);

  // Timer logic
  useEffect(() => {
    if (!userProfile || !hasMounted) return;
    
    const interval = setInterval(() => {
      if (userProfile.chatResetTime) {
        const resetTimeMs = userProfile.chatResetTime?.toMillis ? userProfile.chatResetTime.toMillis() : userProfile.chatResetTime;
        const now = Date.now();
        const diff = resetTimeMs + (24 * 60 * 60 * 1000) - now;
        
        if (diff <= 0) {
          setCountdown('Reset available!');
        } else {
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(`${h}h ${m}m ${s}s`);
        }
      } else {
        setCountdown('');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [userProfile, hasMounted]);

  const isPremium = userProfile?.isPremium || userProfile?.proStatus;
  
  const getDailyStatus = () => {
    if (!userProfile || !hasMounted) return { currentUsed: 0, isResetting: false };
    
    let used = userProfile.chatCharsUsed || 0;
    let resetting = false;
    
    if (userProfile.chatResetTime) {
      const resetTimeMs = userProfile.chatResetTime?.toMillis ? userProfile.chatResetTime.toMillis() : userProfile.chatResetTime;
      const now = new Date().getTime();
      if (now - resetTimeMs >= 24 * 60 * 60 * 1000) {
        resetting = true;
        used = 0;
      }
    } else {
      resetting = true;
      used = 0;
    }
    return { currentUsed: used, isResetting: resetting };
  };

  const { currentUsed, isResetting } = getDailyStatus();

  if (!hasMounted) return <div className="h-full flex items-center justify-center font-black uppercase text-slate-700 tracking-tighter">Syncing Neural Chat Stream...</div>;

  const remainingChars = isPremium ? Infinity : Math.max(0, 250 - currentUsed);
  const limitReached = !isPremium && remainingChars <= 0;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const msgText = text.trim();
    if (!msgText) return;

    if (!isPremium && msgText.length > remainingChars) {
       alert("Daily limit exceeded. Upgrade to Premium to chat longer.");
       return;
    }
    
    setText('');
    
    try {
      const batch = writeBatch(db);
      const newMsgRef = doc(collection(db, 'messages'));
      
      batch.set(newMsgRef, {
        senderId: authUser.uid,
        senderUsername: userProfile.username,
        senderPic: userProfile.profilePic || '',
        text: msgText,
        timestamp: serverTimestamp(),
        type: 'text'
      });

      if (!isPremium) {
         batch.update(doc(db, 'users', authUser.uid), {
            chatCharsUsed: currentUsed + msgText.length,
            chatResetTime: isResetting ? serverTimestamp() : userProfile.chatResetTime
         });
      }

      await batch.commit();
    } catch (err) {
      console.error(err);
      alert('Failed to send message: ' + (err as Error).message);
    }
  };

  const handleImageClick = () => {
    if (!isPremium) {
       alert("Upgrade to Pro to share image.");
       onUpgrade();
       return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert('Image must be less than 2MB. Please choose a smaller image.');
          return;
        }
        const reader = new FileReader();
        reader.onload = async (re) => {
          const imgData = re.target?.result as string;
          try {
            const newMsgRef = doc(collection(db, 'messages'));
            await setDoc(newMsgRef, {
              senderId: authUser.uid,
              senderUsername: userProfile.username,
              senderPic: userProfile.profilePic || '',
              text: '',
              img: imgData,
              timestamp: serverTimestamp(),
              type: 'image'
            });
          } catch(err) {
             console.error(err);
             alert('Failed to send image: ' + (err as Error).message);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-[#0a0f1d] sm:bg-white/5 sm:rounded-2xl border-white/10 overflow-hidden relative sm:border">
      <div className="p-3 sm:p-4 border-b border-white/10 bg-black/40 sm:bg-black/20 flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-between z-10 relative">
        <h3 className="font-black italic uppercase tracking-tighter text-lg sm:text-xl text-emerald-400 sm:text-white">World Chat</h3>
        {!isPremium && (
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
               <span className={remainingChars < 50 ? 'text-amber-500' : 'text-emerald-400'}>
                 Remaining today: {remainingChars} / 250
               </span>
               <a href="#upgrade" className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md ml-2 hover:bg-emerald-500/40 transition-colors uppercase tracking-widest text-[9px]">Upgrade</a>
             </div>
             {userProfile?.chatResetTime && countdown && !isResetting && remainingChars < 250 && (
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 uppercase tracking-widest">
                  <Clock size={10} /> <span>Resets in: {countdown}</span>
                </div>
             )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages ? (
           <div className="text-center text-slate-500 py-10 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Messages...</div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === authUser.uid;
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} group`}>
                <div 
                  className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 flex items-center justify-center font-black shrink-0 cursor-pointer overflow-hidden"                
                  onClick={() => setViewingProfile({ id: msg.senderId })}
                >
                   {msg.senderPic ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img src={msg.senderPic} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     msg.senderUsername?.[0]?.toUpperCase() || '?'
                   )}
                </div>
                <div className={`max-w-[85%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className="flex items-baseline gap-2 mb-1 px-1">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-300">{msg.senderUsername}</span>
                    <span className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-widest">{msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}</span>
                  </div>
                  <div className={`p-3 rounded-2xl ${isMe ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white/10 text-slate-200 rounded-tl-sm'}`}>
                    {msg.type === 'image' && msg.img && (
                      <React.Fragment>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={msg.img} alt="Chat image" className="max-w-[200px] sm:max-w-[250px] rounded-lg mb-1" />
                      </React.Fragment>
                    )}
                    {msg.text && <p className="text-[13px] sm:text-sm shrink break-words whitespace-pre-wrap">{msg.text}</p>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {limitReached ? (
        <div className="p-3 sm:p-4 bg-red-500/10 border-t border-red-500/30 text-center">
            <p className="font-bold text-red-500 text-sm mb-1">Daily limits reached.</p>
            <p className="text-xs text-red-400">Resets in {countdown || "24 hours"} or buy Premium.</p>
        </div>
      ) : (
        <div className="p-2 sm:p-4 bg-[#0a0f1d] sm:bg-black/20 border-t border-white/10 z-20 pb-safe pb-4 sm:pb-4">
          <form onSubmit={handleSend} className="flex gap-2 relative items-center">
            <button type="button" onClick={handleImageClick} className="p-3 bg-white/5 hover:bg-white/10 rounded-full sm:rounded-xl transition-colors text-slate-400 group relative">
              <ImageIcon size={22} />
              {!isPremium && <Lock size={10} className="absolute top-2 right-2 text-amber-500" />}
            </button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Message..." 
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={!isPremium ? remainingChars : undefined}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-full sm:rounded-xl pl-4 pr-12 text-sm focus:outline-none focus:border-emerald-500 text-white"
              />
              {!isPremium && <div className={`absolute right-4 top-4 text-[10px] font-bold ${text.length > remainingChars * 0.8 ? 'text-amber-500' : 'text-slate-500'}`}>{text.length}/{remainingChars}</div>}
            </div>
            <button type="submit" disabled={!text.trim() || limitReached} className="w-12 h-12 flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-full sm:rounded-xl disabled:opacity-50 transition-colors shrink-0">
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
      {viewingProfile && <ProfileModal user={viewingProfile} currentProfile={userProfile} authUser={authUser} onClose={() => setViewingProfile(null)} />}
    </div>
  );
};

