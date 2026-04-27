'use client';
import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

export const UsernameSetupView = ({ user, onComplete }: { user: any, onComplete: () => void }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const cleanUsername = username.trim();
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      alert('Username must be between 3 and 20 characters.');
      return;
    }

    setLoading(true);
    try {
      // Check for uniqueness
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', cleanUsername));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        alert('This username is already taken. Please choose another.');
        setLoading(false);
        return;
      }

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username: cleanUsername,
        usernameLowercase: cleanUsername.toLowerCase(),
        chatCharsUsed: 0,
        isPremium: false,
        createdAt: Date.now(),
        workoutsCompleted: 0,
        streak: 0,
        achievements: ['First Login']
      }, { merge: true });
      onComplete();
    } catch (err) {
      console.error(err);
      alert('Failed to set username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-2xl border border-white/10 m-auto max-w-md w-full">
      <h2 className="text-2xl font-black mb-4 uppercase">Set Your Username</h2>
      <input 
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="bg-black/20 border border-white/20 rounded-xl px-4 py-3 w-full text-white font-bold focus:outline-none focus:border-emerald-500 mb-4"
      />
      <button 
        onClick={handleSave} 
        disabled={loading}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? 'SAVING...' : 'CONFIRM IDENTITY'}
      </button>
    </div>
  );
};
