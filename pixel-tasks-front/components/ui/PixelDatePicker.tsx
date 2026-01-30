import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Calendar, Clock } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, setHours, setMinutes, getDay } from 'date-fns';

interface PixelDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  title?: string; // e.g. "DUE DATE" or "REMINDER"
  includeTime?: boolean;
}

export const PixelDatePicker: React.FC<PixelDatePickerProps> = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  onSelectDate,
  title = "SELECT DATE",
  includeTime = false
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempDate, setTempDate] = useState(selectedDate);
  const [activeTab, setActiveTab] = useState<'DATE' | 'TIME'>('DATE');

  useEffect(() => {
    if (isOpen) {
      setTempDate(selectedDate);
      setCurrentMonth(selectedDate);
      setActiveTab('DATE');
    }
  }, [isOpen, selectedDate]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Calculate empty filler days for grid alignment
  const startDay = getDay(startOfMonth(currentMonth)); // 0 = Sunday
  const emptyDays = Array(startDay).fill(null);

  const handleTimeChange = (type: 'hours' | 'minutes', val: number) => {
    const newDate = new Date(tempDate);
    if (type === 'hours') newDate.setHours(val);
    else newDate.setMinutes(val);
    setTempDate(newDate);
  };

  const handleConfirm = () => {
    onSelectDate(tempDate);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
          {/* Retro Overlay with Dither Pattern */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            style={{
                backgroundImage: 'radial-gradient(#000 15%, transparent 16%), radial-gradient(#000 15%, transparent 16%)',
                backgroundSize: '4px 4px',
                backgroundPosition: '0 0, 2px 2px'
            }}
          />

          {/* Picker Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full md:w-[380px] bg-white border-t-2 md:border-2 border-black p-4 md:rounded-lg shadow-[0_-4px_10px_rgba(0,0,0,0.2)] md:shadow-[8px_8px_0_0_#000]"
          >
             {/* Desktop Close Button (Floating) */}
             <button 
                onClick={onClose}
                className="absolute -top-12 md:top-2 right-4 md:right-2 bg-white md:bg-transparent border-2 border-black md:border-0 p-2 rounded-full md:rounded-none shadow-[2px_2px_0_0_#000] md:shadow-none hover:bg-gray-100 transition-transform active:translate-y-1"
             >
                 <X size={24} />
             </button>

             <h3 className="text-xl font-bold uppercase mb-4 text-center md:text-left">{title}</h3>

             {/* Tabs */}
             <div className="flex border-2 border-black mb-4">
                 <button 
                    onClick={() => setActiveTab('DATE')}
                    className={`flex-1 py-2 text-lg font-bold uppercase flex items-center justify-center gap-2 transition-colors ${activeTab === 'DATE' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                 >
                    <Calendar size={18} /> Date
                 </button>
                 <button 
                    onClick={() => setActiveTab('TIME')}
                    className={`flex-1 py-2 text-lg font-bold uppercase flex items-center justify-center gap-2 transition-colors ${activeTab === 'TIME' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                 >
                    <Clock size={18} /> Time
                 </button>
             </div>

             {activeTab === 'DATE' ? (
                 <>
                    {/* Month Nav */}
                    <div className="flex justify-between items-center mb-4 px-2">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-gray-200 border-2 border-transparent hover:border-black transition-all">
                            <ChevronLeft />
                        </button>
                        <span className="text-2xl font-bold uppercase">{format(currentMonth, 'MMMM yyyy')}</span>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-gray-200 border-2 border-transparent hover:border-black transition-all">
                            <ChevronRight />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="mb-4 select-none">
                        <div className="grid grid-cols-7 gap-1 mb-2 text-gray-500 font-bold text-center">
                            {['S','M','T','W','T','F','S'].map((d, i) => <span key={i}>{d}</span>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
                            {daysInMonth.map((date) => {
                                const isSelected = isSameDay(date, tempDate);
                                const isToday = isSameDay(date, new Date());
                                return (
                                    <div 
                                        key={date.toString()}
                                        onClick={() => setTempDate(prev => {
                                            const newD = new Date(date);
                                            newD.setHours(prev.getHours());
                                            newD.setMinutes(prev.getMinutes());
                                            return newD;
                                        })}
                                        className={`
                                            h-10 flex items-center justify-center cursor-pointer border-2 text-lg
                                            transition-all active:scale-95
                                            ${isSelected 
                                                ? 'bg-black text-white border-black' 
                                                : isToday 
                                                    ? 'border-black bg-white' 
                                                    : 'border-transparent hover:bg-gray-200'
                                            }
                                        `}
                                    >
                                        {format(date, 'd')}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                 </>
             ) : (
                 <div className="h-[312px] flex flex-col items-center justify-center space-y-6">
                     <div className="text-center">
                         <label className="block text-gray-500 font-bold mb-2 uppercase">Time</label>
                         <div className="flex items-center gap-2">
                             <select 
                                value={tempDate.getHours()}
                                onChange={(e) => handleTimeChange('hours', parseInt(e.target.value))}
                                className="text-4xl font-bold bg-gray-100 border-2 border-black p-2 outline-none appearance-none text-center w-24"
                             >
                                 {[...Array(24)].map((_, i) => (
                                     <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                                 ))}
                             </select>
                             <span className="text-4xl font-bold">:</span>
                             <select 
                                value={Math.floor(tempDate.getMinutes() / 5) * 5}
                                onChange={(e) => handleTimeChange('minutes', parseInt(e.target.value))}
                                className="text-4xl font-bold bg-gray-100 border-2 border-black p-2 outline-none appearance-none text-center w-24"
                             >
                                 {[...Array(12)].map((_, i) => (
                                     <option key={i} value={i * 5}>{(i * 5).toString().padStart(2, '0')}</option>
                                 ))}
                             </select>
                         </div>
                     </div>
                     <div className="text-gray-500 text-sm">
                         Selected: {format(tempDate, 'MMM d, h:mm a')}
                     </div>
                 </div>
             )}

             {/* Actions */}
             <div className="flex gap-3 mt-2">
                 <button 
                    onClick={() => {
                        const today = new Date();
                        // Preserve time if in time mode, else reset? Let's just set date part
                        setTempDate(today);
                        setCurrentMonth(today);
                    }}
                    className="flex-1 border-2 border-black py-3 font-bold uppercase hover:bg-gray-100 transition-colors"
                 >
                    Today
                 </button>
                 <button 
                    onClick={handleConfirm}
                    className="flex-[2] bg-secondary border-2 border-black py-3 font-bold uppercase shadow-[2px_2px_0_0_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all hover:bg-green-400"
                 >
                    Confirm
                 </button>
             </div>

             {/* Mobile Safe Area */}
             <div className="h-6 md:hidden"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
