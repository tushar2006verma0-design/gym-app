'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Dumbbell, 
  LayoutDashboard, 
  Target, 
  Trophy, 
  Apple, 
  MessageSquare, 
  Settings, 
  Plus, 
  Zap, 
  TrendingUp, 
  Activity, 
  Calendar,
  Clock,
  Trash2,
  Save,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Send,
  Bell,
  Check
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });

import { GoogleGenAI } from "@google/genai";
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, onSnapshot, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { WorldChatView } from '@/components/chat/WorldChatView';
import { UsernameSetupView } from '@/components/profile/UsernameSetupView';
import { signInWithGoogle, logOut } from '@/lib/auth';

// --- MOCK DATA & COMPONENTS (Restoring from previous context) ---

const chartData = [
  { day: 'Mon', volume: 0 },
  { day: 'Tue', volume: 0 },
  { day: 'Wed', volume: 0 },
  { day: 'Thu', volume: 0 },
  { day: 'Fri', volume: 0 },
  { day: 'Sat', volume: 0 },
  { day: 'Sun', volume: 0 },
];

const MeshBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 blur-[120px] rounded-full animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full delay-1000 animate-pulse" />
    <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/10 blur-[100px] rounded-full delay-500 animate-pulse" />
  </div>
);

// --- VIEWS ---

const WorkoutsView = () => {
  const [workoutState, setWorkoutState] = useState<{
    todayString: string;
    selectedDate: string;
    sessions: any[];
    weekDates: Date[];
    yyyy: string;
    mm: string;
  }>({
    todayString: '',
    selectedDate: '',
    sessions: [],
    weekDates: [],
    yyyy: '',
    mm: ''
  });

  useEffect(() => {
    const today = new Date();
    const yyyyVal = today.getFullYear();
    const mmVal = String(today.getMonth() + 1).padStart(2, '0');
    const ddVal = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyyVal}-${mmVal}-${ddVal}`;
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const wDates = Array.from({length: 7}).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      d.setHours(0, 0, 0, 0); 
      return d;
    });

    setTimeout(() => {
      setWorkoutState({
        todayString: todayStr,
        selectedDate: todayStr,
        yyyy: String(yyyyVal),
        mm: mmVal,
        weekDates: wDates,
        sessions: []
      });
    }, 0);
  }, []);

  const { todayString, selectedDate, sessions, weekDates, yyyy, mm } = workoutState;

  const setSessions = (newSessions: any[]) => setWorkoutState(prev => ({ ...prev, sessions: newSessions }));
  const setSelectedDate = (newDate: string) => setWorkoutState(prev => ({ ...prev, selectedDate: newDate }));

  const [isAddingSession, setIsAddingSession] = useState(false);
  const [newSessionStartTime, setNewSessionStartTime] = useState('18:00');
  const [newSessionEndTime, setNewSessionEndTime] = useState('19:00');
  const [newExercises, setNewExercises] = useState([{ id: 'init-1', name: '', reps: '', kg: '' }]);
  const [holidays, setHolidays] = useState<string[]>([]);

  const toggleHoliday = (dateStr: string) => {
    if (holidays.includes(dateStr)) {
      setHolidays(holidays.filter(d => d !== dateStr));
    } else {
      setHolidays([...holidays, dateStr]);
    }
  };

  const addExerciseRow = () => {
    setNewExercises([...newExercises, { id: Date.now().toString(), name: '', reps: '', kg: '' }]);
  };

  const updateExercise = (index: number, field: string, value: string) => {
    const updated = [...newExercises];
    (updated[index] as any)[field] = value;
    setNewExercises(updated);
  };

  const removeExercise = (index: number) => {
    const updated = newExercises.filter((_, i) => i !== index);
    setNewExercises(updated);
  };

  const saveSession = () => {
    const validExercises = newExercises.filter(e => e.name.trim() !== '');
    if (validExercises.length === 0) return;
    
    const session = {
      id: Date.now().toString(),
      date: selectedDate,
      time: `${newSessionStartTime} - ${newSessionEndTime}`,
      exercises: validExercises
    };
    
    setSessions([...sessions, session]);
    setIsAddingSession(false);
    setNewExercises([{ id: Date.now().toString(), name: '', reps: '', kg: '' }]);
  };

  const sessionsForDate = sessions.filter(s => s.date === selectedDate).sort((a,b) => a.time.localeCompare(b.time));

  // Mini Calendar generation
  const daysInMonth = 30; // Approx for UI
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
  const prefix = Array.from({length: 2}, (_, i) => i); // Month start offset mock
  
  if (!todayString || weekDates.length === 0) return <div className="p-10 text-center uppercase font-black text-slate-400">Initializing Biometrics...</div>;

  return (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4">
      <div>
        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Workouts</h3>
        <p className="text-slate-400">Your neural outputs and session programming.</p>
      </div>
    </div>

    <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20 p-5 mb-6">
       <div className="flex justify-between items-center mb-4">
         <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Weekly Overview</h4>
         <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative group text-slate-300">
           <Calendar size={16} />
           {/* Small absolute calendar dropdown that shows on hover */}
           <div className="absolute right-0 top-full mt-2 w-64 bg-[#0a0f1d] border border-white/10 rounded-xl p-4 shadow-2xl opacity-0 pointer-events-none group-focus-within:opacity-100 group-focus-within:pointer-events-auto transform translate-y-[-10px] group-focus-within:translate-y-0 transition-all z-50">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 text-left">Select Date</h4>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['M','T','W','T','F','S','S'].map((d,i)=><div key={i} className="text-[10px] text-slate-500 font-bold">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {prefix.map(p => <div key={`p-${p}`} />)}
                {days.map(d => {
                  const dateStr = `${yyyy}-${mm}-${d.toString().padStart(2, '0')}`;
                  const hasSession = sessions.some(s => s.date === dateStr);
                  const isSelected = dateStr === selectedDate;
                  const isHoliday = holidays.includes(dateStr);
                  return (
                    <div 
                      key={d} 
                      onClick={() => setSelectedDate(dateStr)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer relative
                        ${isSelected ? 'bg-emerald-500 text-slate-900' : 
                          isHoliday ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                          hasSession ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 
                          'text-slate-400 hover:bg-white/10'}
                      `}
                    >
                      {d}
                    </div>
                  );
                })}
              </div>
           </div>
         </button>
       </div>
       
       <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, i) => {
             const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i];
             const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
             const isToday = dateStr === todayString;
             const isHoliday = holidays.includes(dateStr);

             return (
               <div key={dayName} className={`relative flex flex-col items-center justify-center p-3 rounded-xl border ${isToday ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : isHoliday ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-black/20 border-white/5 text-slate-400'}`}>
                 <button 
                    onClick={() => toggleHoliday(dateStr)}
                    className={`absolute top-1 right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors ${isHoliday ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] hover:bg-red-500' : 'bg-slate-700 hover:bg-blue-500'}`}
                    title={isHoliday ? "Remove Holiday" : "Mark as Rest/Holiday"}
                  />
                 <span className="text-xs sm:text-sm font-bold block">{dayName}</span>
                 {isToday && <span className="mt-1 text-[8px] sm:text-[10px] uppercase tracking-widest font-black bg-emerald-500 text-slate-900 px-1 sm:px-2 py-0.5 rounded text-center">Today</span>}
                 {isHoliday && !isToday && <span className="mt-1 text-[8px] sm:text-[10px] uppercase tracking-widest font-black bg-blue-500 text-slate-900 px-1 sm:px-2 py-0.5 rounded text-center">Rest</span>}
               </div>
             )
          })}
       </div>
    </div>

    <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h4 className="text-xl font-black uppercase tracking-tighter">
               {holidays.includes(selectedDate) ? "Rest Day" : selectedDate === todayString ? "Today's Sessions" : `Sessions for ${selectedDate}`}
            </h4>
            {!isAddingSession && sessionsForDate.length < 4 && !holidays.includes(selectedDate) && (
              <button onClick={() => setIsAddingSession(true)} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors">
                <Plus size={16}/> LOG NEW
              </button>
            )}
         </div>

         {sessionsForDate.length === 0 && !isAddingSession && (
            <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center opacity-50">
               {holidays.includes(selectedDate) ? (
                 <>
                   <Calendar size={40} className="mb-4 text-blue-500 mx-auto" />
                   <p className="font-bold text-blue-400">Scheduled Rest / Holiday</p>
                   <p className="text-sm">Recovery is where the growth happens.</p>
                 </>
               ) : (
                 <>
                   <Dumbbell size={40} className="mb-4 text-slate-500 mx-auto" />
                   <p className="font-bold">No sessions logged.</p>
                   <p className="text-sm">Time to put in the work.</p>
                 </>
               )}
            </div>
         )}

         {sessionsForDate.map((session) => (
            <div key={session.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
               <div className="bg-black/20 p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                     <Clock size={16} />
                     <span>{session.time}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-black tracking-widest uppercase">
                     {session.exercises.length} Movements
                  </span>
               </div>
               <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[300px]">
                     <thead>
                        <tr className="text-slate-500 uppercase tracking-widest text-[10px] border-b border-white/10">
                           <th className="pb-2 w-1/2 font-black">Movement</th>
                           <th className="pb-2 font-black text-center">Reps</th>
                           <th className="pb-2 font-black text-right">Load (kg)</th>
                        </tr>
                     </thead>
                     <tbody>
                        {session.exercises.map((ex: any) => (
                           <tr key={ex.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                              <td className="py-3 font-bold">{ex.name}</td>
                              <td className="py-3 text-slate-300 text-center">{ex.reps}</td>
                              <td className="py-3 text-right text-emerald-400 font-bold">{ex.kg}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         ))}

         {isAddingSession && (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black/40 border border-emerald-500/50 rounded-2xl p-5 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <div className="flex items-center justify-between mb-6">
                 <h5 className="font-bold uppercase tracking-widest text-sm text-emerald-400 flex items-center gap-2">
                   <Clock size={16}/> Log Session
                 </h5>
                 <button onClick={() => setIsAddingSession(false)} className="text-slate-500 hover:text-white transition-colors">
                   <X size={20} />
                 </button>
              </div>
              
              <div className="mb-6 flex gap-4">
                 <div>
                   <label className="text-[10px] uppercase tracking-widest text-slate-400 font-black block mb-2">Start Time</label>
                   <input 
                     type="time" 
                     value={newSessionStartTime}
                     onChange={(e) => setNewSessionStartTime(e.target.value)}
                     className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 w-full sm:w-auto text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                   />
                 </div>
                 <div>
                   <label className="text-[10px] uppercase tracking-widest text-slate-400 font-black block mb-2">End Time</label>
                   <input 
                     type="time" 
                     value={newSessionEndTime}
                     onChange={(e) => setNewSessionEndTime(e.target.value)}
                     className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 w-full sm:w-auto text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                   />
                 </div>
              </div>

              <div className="space-y-3 mb-6">
                 <div className="flex text-[10px] uppercase font-black tracking-widest text-slate-500 px-2 justify-between">
                   <div className="flex-1">Movement</div>
                   <div className="w-16 sm:w-20 text-center">Reps</div>
                   <div className="w-16 sm:w-24 text-right pr-6 sm:pr-8">Load</div>
                 </div>
                 
                 {newExercises.map((ex, index) => (
                   <div key={ex.id} className="flex items-center gap-2 group">
                      <input 
                        placeholder="Exercise name"
                        value={ex.name}
                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                        className="flex-1 min-w-[80px] bg-white/5 border border-white/10 rounded-lg px-2 sm:px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <input 
                        placeholder="e.g. 10"
                        value={ex.reps}
                        onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                        className="w-16 sm:w-20 bg-white/5 border border-white/10 rounded-lg px-2 sm:px-3 py-2 text-sm text-center focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <input 
                        placeholder="kg"
                        value={ex.kg}
                        onChange={(e) => updateExercise(index, 'kg', e.target.value)}
                        className="w-16 sm:w-24 bg-white/5 border border-white/10 rounded-lg px-2 sm:px-3 py-2 text-sm text-right focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <button 
                        onClick={() => removeExercise(index)}
                        className="w-6 sm:w-8 flex justify-center text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                 ))}
                 
                 <button onClick={addExerciseRow} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1 py-2 transition-colors mt-2">
                   <Plus size={14} /> Add Movement
                 </button>
              </div>

              <button onClick={saveSession} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                 <Save size={18} /> COMPLETE LOG
              </button>
           </motion.div>
         )}
      </div>
    </div>
  );
};

const NutritionView = () => {
  const [meals, setMeals] = useState<{time: string, name: string, cal: number}[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: '', cal: '' });

  const totalCals = meals.reduce((sum, meal) => sum + meal.cal, 0);

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMeal.name && newMeal.cal && !isNaN(Number(newMeal.cal))) {
      setMeals([...meals, { 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
        name: newMeal.name, 
        cal: Number(newMeal.cal) 
      }]);
      setNewMeal({ name: '', cal: '' });
      setShowForm(false);
    }
  };

  return (
  <div className="space-y-6">
    <div className="flex justify-between flex-wrap gap-4 items-end mb-6">
      <div>
        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Fuel Status</h3>
        <p className="text-slate-400">Macronutrient distribution and intake.</p>
      </div>
      <div className="text-right flex items-center gap-4">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Intake</p>
          <p className="text-2xl font-black text-blue-400">{totalCals.toLocaleString()} <span className="text-sm text-slate-500">/ 3,100 kcal</span></p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-500 hover:bg-blue-400 text-slate-900 p-3 rounded-xl transition-colors">
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>
    </div>

    {showForm && (
      <motion.form 
        initial={{ opacity: 0, height: 0 }} 
        animate={{ opacity: 1, height: 'auto' }} 
        className="bg-white/5 border border-blue-500/30 p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-end mb-6"
        onSubmit={handleAddMeal}
      >
        <div className="flex-1 w-full">
          <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1 block">Meal Name</label>
          <input 
            autoFocus
            value={newMeal.name}
            onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
            placeholder="e.g. Avocado Toast"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <div className="w-full sm:w-32">
          <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1 block">Calories</label>
          <input 
            type="number"
            value={newMeal.cal}
            onChange={(e) => setNewMeal({...newMeal, cal: e.target.value})}
            placeholder="kcal"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <button type="submit" className="w-full sm:w-auto bg-blue-500 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-blue-400 transition-colors">
          ADD
        </button>
      </motion.form>
    )}

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: 'Protein', current: 0, target: 200, unit: 'g', color: 'bg-emerald-500' },
        { label: 'Carbs', current: 0, target: 350, unit: 'g', color: 'bg-blue-500' },
        { label: 'Fats', current: 0, target: 80, unit: 'g', color: 'bg-amber-500' },
      ].map((macro, i) => (
        <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold uppercase tracking-widest text-xs">{macro.label}</h4>
            <span className="text-sm font-bold text-slate-300">{macro.current} / {macro.target}{macro.unit}</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${macro.color}`} 
              style={{ width: `${Math.min((macro.current / macro.target) * 100, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>

    <div className="mt-8">
      <h4 className="font-bold uppercase tracking-widest text-sm mb-4">Today&apos;s Meals</h4>
      <div className="space-y-3">
        {meals.map((meal, i) => (
          <div key={i} className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-500 w-12">{meal.time}</span>
              <span className="font-bold">{meal.name}</span>
            </div>
            <span className="text-sm text-blue-400 font-bold">{meal.cal} kcal</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)};

const LeaderboardView = () => (
  <div className="space-y-6">
    <div className="mb-6">
      <h3 className="text-2xl font-black uppercase italic tracking-tighter">Global Ranks</h3>
      <p className="text-slate-400">Compare your neural load with top athletes.</p>
    </div>

    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 bg-black/20 border-b border-white/10 grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
        <div className="col-span-2 text-center">Rank</div>
        <div className="col-span-6">Athlete</div>
        <div className="col-span-4 text-right">Volume Score</div>
      </div>
      
      <div className="divide-y divide-white/5">
        {[
          { rank: 1, name: 'You', score: '0', isMe: true },
        ].map((user, i) => (
          <div key={i} className={`p-4 grid grid-cols-12 gap-4 items-center ${user.isMe ? 'bg-emerald-500/10' : 'hover:bg-white/5'} transition-colors`}>
            <div className="col-span-2 flex justify-center">
              {user.rank <= 3 ? (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                  user.rank === 1 ? 'bg-amber-400 text-amber-900' :
                  user.rank === 2 ? 'bg-slate-300 text-slate-800' :
                  'bg-amber-700 text-amber-100'
                }`}>
                  {user.rank}
                </div>
              ) : (
                <span className="font-bold text-slate-500">{user.rank}</span>
              )}
            </div>
            <div className="col-span-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0)}
              </div>
              <span className={`font-bold ${user.isMe ? 'text-emerald-400' : ''}`}>{user.name}</span>
            </div>
            <div className="col-span-4 text-right font-black tracking-tighter">
              {user.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DashboardView = ({ proStatus }: { proStatus: boolean }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold">Performance Analytics</h3>
            <p className="text-slate-400 text-sm italic">Neural tracking of training volume</p>
          </div>
          <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-500/20">
            STABLE GAINS
          </div>
        </div>
        <div className="h-64 mt-4 w-full min-h-[256px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Bar 
                dataKey="volume" 
                fill="#10b981" 
                radius={[6, 6, 0, 0]} 
                fillOpacity={0.8}
                activeBar={{ fill: '#34d399' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
           <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Next Protocol</h4>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                 <Dumbbell className="text-emerald-500" size={24} />
              </div>
              <div>
                 <p className="font-bold">Heavy Leg Day</p>
                 <p className="text-[10px] text-slate-400">Target Volume: 18,500 kg</p>
              </div>
           </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
           <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3 italic">AI Insight</h4>
           <p className="text-sm text-slate-300 leading-relaxed">
             Based on yesterday&apos;s <span className="text-blue-400 font-bold">RPE 9</span> on squats, I recommend increasing rest intervals by 45s for today&apos;s session.
           </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
       {[
         { icon: Activity, label: 'Workouts', val: '0', color: 'text-emerald-400' },
         { icon: Apple, label: 'Calories', val: '0', color: 'text-blue-400' },
         { icon: Zap, label: 'CNS Status', val: 'Pending', color: 'text-purple-400' },
         { icon: Calendar, label: 'Streak', val: '0 Days', color: 'text-amber-400' }
       ].map((stat, i) => (
         <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{stat.label}</p>
               <p className="text-lg font-bold">{stat.val}</p>
            </div>
            <stat.icon className={stat.color} size={20} />
         </div>
       ))}
    </div>
  </div>
);

const AIAgentView = ({ proStatus, onUpgrade }: { proStatus: boolean, onUpgrade: () => void }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "IronCoach active. Neural paths clear. What's our objective today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error("API Key missing");
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [...messages, { role: 'user', text: userMsg }].map(m => ({ 
            role: m.role === 'assistant' ? 'model' : 'user', 
            parts: [{text: m.text}] 
        })),
        config: {
          systemInstruction: "You are IronCoach AI, an intense, data-driven personal trainer. You speak with fitness terminology, neural networking metaphors, and athletic intensity. Be concise. Analyze fitness logic."
        }
      });
      
      setMessages(prev => [...prev, { role: 'assistant', text: response.text || "" }]);
    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', text: "Neural handshake failed: " + (e.message || "Unable to reach Gemini.") }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!proStatus) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 flex flex-col items-center text-center">
        <Zap className="text-amber-400 mb-6" size={64} />
        <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Neural Engine Restricted</h3>
        <p className="text-slate-400 max-w-md mb-8">
          The AI Coaching module requires high-velocity compute resources only available in the Pro Protocol. Unlock to optimize your neural training load.
        </p>
        <button 
          onClick={onUpgrade}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
        >
          UPGRADE TO PRO Protocol
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col h-[600px]">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-bold text-sm tracking-widest uppercase italic">IRON_COACH_V4.2</span>
         </div>
         <Settings size={16} className="text-slate-500" />
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-500/20 border border-emerald-500/20 text-slate-100' : 'bg-white/5 border border-white/10 text-slate-300'}`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Input query for high-velocity analysis..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
        />
        <button onClick={send} className="bg-emerald-500 p-3 rounded-xl hover:bg-emerald-400 transition-colors">
          <Send size={20} className="text-slate-900" />
        </button>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [proStatus, setProStatus] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [authUser, loadingAuth] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [friendReqs, setFriendReqs] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => setHasMounted(true), 0);
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    let unsubscribe = () => {};
    if (authUser) {
      unsubscribe = onSnapshot(doc(db, 'users', authUser.uid), (docSnap) => {
        if (!isSubscribed) return;
        if (docSnap.exists()) {
           const data = docSnap.data();
           setUserProfile({ id: docSnap.id, ...data });
           if (data.isPremium) setProStatus(true);
        } else {
           setUserProfile(null);
        }
        setLoadingProfile(false);
      });
    } else {
      setTimeout(() => {
        if (!isSubscribed) return;
        setUserProfile(null);
        setLoadingProfile(false);
      }, 0);
    }
    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [authUser]);

  useEffect(() => {
     if (authUser) {
        const q = query(collection(db, 'users', authUser.uid, 'friendRequests'), where('status', '==', 'pending'));
        const unsubscribe = onSnapshot(q, async (snap) => {
           // fetch sender details
           const reqs: any[] = [];
           for (const docSnap of snap.docs) {
              const data = docSnap.data();
              const senderDoc = await getDoc(doc(db, 'users', data.senderId));
              reqs.push({ reqId: docSnap.id, ...data, senderName: senderDoc.data()?.username || 'Unknown' });
           }
           setFriendReqs(reqs);
        });
        return () => unsubscribe();
     }
  }, [authUser]);

  const handleAcceptRequest = async (reqId: string, senderId: string) => {
      // mark request as accepted
      await updateDoc(doc(db, 'users', authUser!.uid, 'friendRequests', reqId), { status: 'accepted' });
      // add to each other's friends list
      const batch = await import('firebase/firestore').then(m => m.writeBatch(db));
      const ts = serverTimestamp();
      batch.set(doc(db, 'users', authUser!.uid, 'friends', senderId), { friendId: senderId, timestamp: ts });
      batch.set(doc(db, 'users', senderId, 'friends', authUser!.uid), { friendId: authUser!.uid, timestamp: ts });
      await batch.commit();
  };

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'workouts', icon: Dumbbell, label: 'Workouts' },
    { id: 'nutrition', icon: Apple, label: 'Nutrition' },
    { id: 'ai', icon: Zap, label: 'AI Coach' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    { id: 'worldchat', icon: MessageSquare, label: 'World Chat' }
  ];

  const handleUpgrade = async () => {
    if (!authUser) {
        alert("Please connect via World Chat tab first.");
        return;
    }
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 10, currency: 'INR' })
      });
      const data = await res.json();
      if (!data.orderId) throw new Error("Failed to create order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_ShQ7ZDWnvFmdMU',
        amount: data.amount,
        currency: data.currency,
        name: "IronTrack AI Pro",
        description: "Neural Engine Full Access",
        order_id: data.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            await updateDoc(doc(db, 'users', authUser.uid), { isPremium: true });
            setProStatus(true);
            alert("Upgrade successful! Pro protocol unlocked.");
          }
        },
        prefill: {
          name: userProfile?.username || "Athlete",
          email: authUser.email || "athlete@irontrack.ai"
        },
        theme: {
          color: "#10b981"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert("Neural handshake failed: " + err.message);
    }
  };

  const renderWorldChatOrGate = () => {
     if (loadingAuth || loadingProfile) return <div className="p-10 text-center uppercase font-black text-slate-400">Loading Neural Link...</div>;
     if (!authUser) {
         return (
             <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-2xl border border-white/10 m-auto max-w-md w-full text-center mt-12">
                <MessageSquare className="w-16 h-16 text-emerald-400 mb-6" />
                <h3 className="text-2xl font-black mb-4 uppercase">World Chat</h3>
                <p className="text-slate-400 mb-6 text-sm">Connect your identity to access the global neural network.</p>
                <button onClick={signInWithGoogle} className="w-full bg-emerald-500 text-slate-900 font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                   Connect via Google
                </button>
             </div>
         );
     }
     if (!userProfile?.username) {
         return <UsernameSetupView user={{ uid: authUser.uid, email: authUser.email }} onComplete={() => {}} />;
     }
     return <WorldChatView userProfile={userProfile} authUser={authUser} onUpgrade={handleUpgrade} />;
  }

  if (!hasMounted) return <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center font-black uppercase italic tracking-tighter text-slate-700">Connecting Neural Links...</div>;

  return (
    <main className="min-h-screen bg-[#0a0f1d] text-slate-100 font-sans relative">
      <MeshBackground />
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white/[0.02] border-r border-white/10 flex-col z-20 backdrop-blur-xl">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <TrendingUp size={24} className="text-slate-900" />
          </div>
          <span className="font-black italic text-xl tracking-tighter">IRON_TRACK</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={20} />
              <span className="font-black text-[10px] uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </nav>

        {!proStatus && (
          <div className="p-4">
            <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl p-5 border border-white/10">
               <div className="flex justify-between items-start mb-2">
                 <p className="text-xs font-bold text-white">PRO_PROTOCOL</p>
                 <p className="text-xs font-black text-emerald-400">₹10</p>
               </div>
               <ul className="text-[10px] text-slate-400 mb-4 leading-relaxed italic space-y-1">
                 <li>✓ Real-time AI biometrics</li>
                 <li>✓ Advanced CNS optimization</li>
                 <li>✓ Share images in World Chat</li>
                 <li>✓ Unlimited daily chat limits</li>
               </ul>
               <button 
                 onClick={handleUpgrade}
                 className="w-full bg-white text-slate-900 font-black py-2 rounded-lg text-xs uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                >
                 UPGRADE
               </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header - Mobile & Desktop */}
        <header className="h-16 lg:h-20 flex items-center justify-between px-6 lg:px-12 bg-[#0a0f1d] shadow-[0_4px_30px_#0a0f1d] z-50 sticky top-0 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-400"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-lg font-black uppercase italic tracking-widest">
               {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {authUser && userProfile?.username && (
              <div className="relative">
                <button 
                   onClick={() => setShowNotifications(!showNotifications)}
                   className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors relative"
                >
                   <Bell size={20} />
                   {friendReqs.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                </button>
                {showNotifications && (
                   <div className="absolute top-full right-0 mt-2 w-72 bg-[#0a0f1d] border border-white/10 rounded-2xl p-4 shadow-2xl z-50">
                     <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Notifications</h4>
                     {friendReqs.length === 0 ? (
                        <p className="text-xs text-slate-500">No new notifications</p>
                     ) : (
                        <div className="space-y-3">
                           {friendReqs.map(req => (
                              <div key={req.reqId} className="flex items-center justify-between text-sm">
                                 <div>
                                   <p className="font-bold">{req.senderName}</p>
                                   <p className="text-[10px] text-slate-400">Friend Request</p>
                                 </div>
                                 <button onClick={() => handleAcceptRequest(req.reqId, req.senderId)} className="bg-emerald-500 p-1.5 rounded text-slate-900 hover:bg-emerald-400">
                                   <Check size={14} />
                                 </button>
                              </div>
                           ))}
                        </div>
                     )}
                   </div>
                )}
              </div>
            )}
            <div className="hidden sm:flex flex-col items-end mr-4">
               <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Current Level</span>
               <span className="text-xs font-bold text-emerald-400">{userProfile?.isPremium ? 'PRO_ATHLETE' : 'ROOKIE_BASE'}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 p-1 relative">
               <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center font-black text-xs overflow-hidden relative">
                 {userProfile?.profilePic ? (
                    <Image 
                      src={userProfile.profilePic} 
                      fill 
                      sizes="40px"
                      className="object-cover" 
                      alt="Profile" 
                      referrerPolicy="no-referrer"
                    />
                 ) : userProfile?.username?.[0]?.toUpperCase() || 'AT'}
               </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <section className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full z-10 pb-32 lg:pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardView proStatus={proStatus} />}
              {activeTab === 'ai' && <AIAgentView proStatus={proStatus} onUpgrade={handleUpgrade} />}
              {activeTab === 'workouts' && <WorkoutsView />}
              {activeTab === 'nutrition' && <NutritionView />}
              {activeTab === 'leaderboard' && <LeaderboardView />}
              {activeTab === 'worldchat' && renderWorldChatOrGate()}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Bottom Nav - Mobile Only */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0f1d]/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-4 h-20 z-30 mb-safe">
           {tabs.map((tab) => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 min-w-[64px] transition-all p-3 rounded-2xl ${
                  activeTab === tab.id ? 'text-emerald-400 bg-emerald-500/5' : 'text-slate-500'
                }`}
             >
                <tab.icon size={20} className={activeTab === tab.id ? 'animate-bounce-short' : ''} />
                <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
             </button>
           ))}
        </nav>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#0a0f1d] border-r border-white/10 z-50 p-6 flex flex-col lg:hidden"
            >
               <div className="flex items-center justify-between mb-10">
                  <span className="font-black italic text-xl tracking-tighter">IRON_TRACK</span>
                  <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
               </div>
               
               <div className="space-y-4 flex-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        activeTab === tab.id 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-white/5 border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <tab.icon size={18} />
                        <span className="font-bold text-xs uppercase tracking-widest">{tab.label}</span>
                      </div>
                      <ChevronRight size={14} className="opacity-40" />
                    </button>
                  ))}
               </div>

               <button 
                onClick={() => { logOut(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 text-slate-500 mt-auto p-4 hover:text-white transition-colors"
               >
                  <LogOut size={18} />
                  <span className="font-bold text-xs uppercase tracking-widest">Sign Out</span>
               </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
