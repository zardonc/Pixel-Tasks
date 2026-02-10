import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { PixelCard, PixelButton, PixelModal, PixelInput } from '../components/ui/PixelComponents';
import { PixelDatePicker } from '../components/ui/PixelDatePicker';
import { Task, TaskCategory, TaskPriority } from '../types';
import { Check, Star, Calendar, Trash2, Edit3, Clock, Flag, Briefcase, Heart, Gamepad2, Home, Plus, ChevronDown, ChevronUp, Bell, List, MoreVertical, ArrowDownAZ, AlertCircle, Type, CheckCircle, Settings, MoreHorizontal } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface DashboardProps {
    isEditorOpen: boolean;
    onCloseEditor: () => void;
}

type SortCriteria = 'DATE' | 'DEADLINE' | 'PRIORITY' | 'TITLE';

export const Dashboard: React.FC<DashboardProps> = ({ isEditorOpen, onCloseEditor }) => {
  const { user, tasks, toggleTask, addTask, deleteTask, updateTask, customLists, addList, renameList, deleteList, deleteCompletedTasks, fetchTasks } = useStore();
  
  // Default List Name
  const defaultListName = user ? `${user.name}'s List` : "Hero's List";

  // Filter & List State
  const [filter, setFilter] = useState<string>(defaultListName);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('DATE');
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Card Expansion State
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Task Options Menu State
  const [activeTaskMenu, setActiveTaskMenu] = useState<{ taskId: string, top: number, left: number } | null>(null);
  const [reschedulingTaskId, setReschedulingTaskId] = useState<string | null>(null);

  // List Menu State
  const [activeMenu, setActiveMenu] = useState<{ id: string, top: number, left: number } | null>(null);
  
  // List Creation/Rename State
  const [isListModalOpen, setListModalOpen] = useState(false);
  const [listModalMode, setListModalMode] = useState<'CREATE' | 'RENAME'>('CREATE');
  const [listNameInput, setListNameInput] = useState('');
  const [listToRename, setListToRename] = useState('');

  // Editor State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>(TaskCategory.WORK);
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [newTaskDate, setNewTaskDate] = useState<Date>(new Date());
  
  const [selectedList, setSelectedList] = useState(defaultListName);

  // Confirmation Modal State
  const [confirmation, setConfirmation] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
      confirmLabel?: string;
      variant?: 'danger' | 'primary';
  }>({ 
      isOpen: false, 
      title: '', 
      message: '', 
      onConfirm: () => {},
      variant: 'danger' 
  });

  useEffect(() => {
      if (!isEditorOpen) {
          setSelectedList(defaultListName);
      }
  }, [isEditorOpen, defaultListName]);

  // Fetch Tasks on Mount
  useEffect(() => {
      if (user) {
         fetchTasks();
      }
  }, [user]);
  
  // Date Picker State
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'DUE' | 'REMINDER'>('DUE');
  const [reminderDate, setReminderDate] = useState<Date | null>(null);

  const handleSaveTask = () => {
    if (!newTaskTitle) return;

    const isDaily = selectedList === 'Daily Quests';
    const isDefault = selectedList === defaultListName;
    const listAssignment = (isDaily || isDefault) ? undefined : selectedList;

    addTask({
        id: uuidv4(),
        title: newTaskTitle,
        description: newTaskDesc,
        category: newTaskCategory,
        priority: newTaskPriority,
        xpReward: newTaskPriority === TaskPriority.HIGH ? 500 : newTaskPriority === TaskPriority.MEDIUM ? 250 : 100,
        completed: false,
        dueDate: newTaskDate.toISOString(),
        isDaily: isDaily,
        list: listAssignment
    });
    
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskDate(new Date());
    setReminderDate(null);
    onCloseEditor();
  };

  const openCreateList = () => {
      setListModalMode('CREATE');
      setListNameInput('');
      setListModalOpen(true);
  };

  const openRenameList = (oldName: string) => {
      setListModalMode('RENAME');
      setListToRename(oldName);
      setListNameInput(oldName);
      setListModalOpen(true);
      setActiveMenu(null);
  };

  const handleListModalSave = () => {
      if (!listNameInput.trim()) return;

      if (listModalMode === 'CREATE') {
          addList(listNameInput.trim());
          setFilter(listNameInput.trim());
      } else {
          renameList(listToRename, listNameInput.trim());
          if (filter === listToRename) setFilter(listNameInput.trim());
      }
      setListModalOpen(false);
  };

  const handleDeleteList = (name: string) => {
      setActiveMenu(null);
      setConfirmation({
          isOpen: true,
          title: 'Delete List',
          message: `Are you sure you want to delete "${name}" and all its tasks?`,
          confirmLabel: 'Delete',
          variant: 'danger',
          onConfirm: () => {
              deleteList(name);
              setFilter(defaultListName);
              setConfirmation(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  const handleClearCompleted = (listName: string) => {
      setActiveMenu(null);
      setConfirmation({
          isOpen: true,
          title: 'Clear Completed',
          message: `Clear all completed tasks in "${listName}"?`,
          confirmLabel: 'Clear',
          variant: 'danger',
          onConfirm: () => {
              deleteCompletedTasks(listName);
              setConfirmation(prev => ({ ...prev, isOpen: false }));
          }
      });
  }

  const handleMoveTask = (taskId: string, targetList: string) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      let updates: Partial<Task> = {};
      
      if (targetList === 'Daily Quests') {
          updates = { isDaily: true, list: undefined };
      } else if (targetList === defaultListName) {
          updates = { isDaily: false, list: undefined };
      } else {
          updates = { isDaily: false, list: targetList };
      }
      
      updateTask({ ...task, ...updates });
      setActiveTaskMenu(null);
  };

  const getCategoryIcon = (cat: TaskCategory) => {
      switch(cat) {
          case TaskCategory.WORK: return <Briefcase size={14} />;
          case TaskCategory.HEALTH: return <Heart size={14} />;
          case TaskCategory.FUN: return <Gamepad2 size={14} />;
          case TaskCategory.CHORE: return <Home size={14} />;
      }
  };

  const getCategoryColor = (cat: TaskCategory) => {
      switch(cat) {
          case TaskCategory.WORK: return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
          case TaskCategory.HEALTH: return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
          case TaskCategory.FUN: return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
          case TaskCategory.CHORE: return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
      }
  };

  const formatSmartDate = (dateString: string) => {
      const date = new Date(dateString);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'MMM d');
  };

  // 1. Filter Logic
  let processedTasks = tasks.filter(t => {
      if (filter === defaultListName) return !t.isDaily && !t.list;
      if (filter === 'DAILY') return t.isDaily;
      return t.list === filter;
  });

  // 2. Sort Logic
  processedTasks = processedTasks.sort((a, b) => {
      switch(sortCriteria) {
          case 'TITLE': 
              return a.title.localeCompare(b.title);
          case 'PRIORITY':
              const pMap = { [TaskPriority.HIGH]: 3, [TaskPriority.MEDIUM]: 2, [TaskPriority.LOW]: 1 };
              return pMap[b.priority] - pMap[a.priority];
          case 'DEADLINE': 
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          case 'DATE': 
          default:
              return a.id.localeCompare(b.id);
      }
  });

  const activeTasks = processedTasks.filter(t => !t.completed);
  const completedTasks = processedTasks.filter(t => t.completed);
  const totalDaily = tasks.filter(t => t.isDaily).length;

  const openPicker = (mode: 'DUE' | 'REMINDER') => {
      setPickerMode(mode);
      setDatePickerOpen(true);
  };

  const handleDateSelect = (date: Date) => {
      if (pickerMode === 'DUE') {
          setNewTaskDate(date);
      } else {
          setReminderDate(date);
      }
  };

  const renderTask = (task: Task) => {
      const isExpanded = expandedTaskId === task.id;
      const isMenuOpen = activeTaskMenu?.taskId === task.id;

      return (
        <div 
            key={task.id} 
            className={`relative transition-all duration-200 ${isExpanded ? 'z-20 my-4' : 'z-0'}`}
        >
            <PixelCard 
                onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                className={`
                    flex flex-row gap-3 group transition-all duration-300 cursor-pointer
                    ${task.completed ? 'opacity-75 grayscale-[0.5]' : ''}
                    ${isExpanded 
                        ? 'p-6 scale-[1.02] shadow-pixel-lg border-primary ring-2 ring-primary ring-offset-2 ring-offset-background-light dark:ring-offset-background-dark' 
                        : 'p-3 hover:-translate-y-1 items-center'
                    }
                `}
            >
                {/* Priority Badge (Expanded Only) */}
                {task.priority === TaskPriority.HIGH && !task.completed && isExpanded && (
                    <div className="absolute -top-3 -right-2 bg-accent text-white text-xs font-bold px-2 py-1 border-2 border-black shadow-sm rotate-3 z-10">
                        BOSS!
                    </div>
                )}

                {/* Checkbox Area */}
                <div className={`${isExpanded ? 'pt-1' : ''} shrink-0`}>
                    <div 
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(task.id);
                        }}
                        className={`
                            border-3 border-black dark:border-white cursor-pointer flex items-center justify-center transition-colors
                            ${isExpanded ? 'w-8 h-8' : 'w-6 h-6'}
                            ${task.completed ? 'bg-secondary' : 'bg-white dark:bg-gray-800 hover:bg-gray-100'}
                        `}
                    >
                        {task.completed && <Check strokeWidth={4} className="text-black" size={isExpanded ? 20 : 16} />}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-12">
                    <div className={`flex ${isExpanded ? 'justify-between items-start mb-2' : 'items-center gap-3'}`}>
                        {/* Title & Stars */}
                        <div className="flex items-center gap-2 overflow-hidden min-w-0">
                            <h3 className={`font-bold leading-none truncate ${isExpanded ? 'text-2xl' : 'text-lg'} ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                {task.title}
                            </h3>
                            <div className={`flex gap-0.5 shrink-0 ${isExpanded ? '' : 'scale-75 origin-left'}`}>
                                {[...Array(task.priority === 'High' ? 3 : task.priority === 'Medium' ? 2 : 1)].map((_, i) => (
                                    <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                                ))}
                            </div>
                        </div>

                        {/* Compact Metadata (Right Side) - Visible only when NOT expanded */}
                        {!isExpanded && (
                            <div className="flex items-center gap-3 text-xs font-bold text-gray-500 shrink-0">
                                <div className={`flex items-center gap-1 px-1.5 py-0.5 border border-black/20 rounded ${getCategoryColor(task.category)} bg-opacity-40`}>
                                     {getCategoryIcon(task.category)}
                                     <span className="uppercase hidden sm:inline">{task.category}</span>
                                </div>
                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-black/10">
                                    <Calendar size={12} />
                                    <span>{formatSmartDate(task.dueDate)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Description - Conditional Truncation */}
                    {task.description && (
                        <p className={`
                            text-gray-600 dark:text-gray-300 transition-all
                            ${task.completed ? 'text-gray-400' : ''}
                            ${isExpanded 
                                ? 'text-lg mb-4 whitespace-pre-wrap' 
                                : 'text-sm truncate mb-0 w-[90%]' 
                            }
                        `}>
                            {task.description}
                        </p>
                    )}

                    {/* Full Metadata - Only when Expanded */}
                    {isExpanded && (
                        <div className="flex flex-wrap items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                             <div className={`flex items-center gap-1 px-2 py-0.5 border-2 border-black dark:border-white ${getCategoryColor(task.category)}`}>
                                 {getCategoryIcon(task.category)}
                                 <span className="uppercase">{task.category}</span>
                             </div>
                             
                             <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                 <Calendar size={16} />
                                 <span>{format(new Date(task.dueDate), 'MMM d, h:mm a')}</span>
                             </div>

                             {task.list && (
                                 <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 border-l-2 border-gray-300 pl-2 ml-1">
                                     <List size={16} />
                                     <span className="uppercase">{task.list}</span>
                                 </div>
                             )}

                             <div className="ml-auto flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900 border border-black dark:border-gray-500 px-2 rounded-sm text-yellow-700 dark:text-yellow-400">
                                 <span className="text-xs">⚡</span>
                                 <span>{task.xpReward} XP</span>
                             </div>
                        </div>
                    )}
                </div>
                
                {/* Task Menu Action Button */}
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        const rect = e.currentTarget.getBoundingClientRect();
                        // Adjust to open towards the left to keep on screen
                        setActiveTaskMenu({
                            taskId: task.id,
                            top: rect.bottom + 4,
                            left: rect.right - 220 // Align right side roughly
                        });
                    }}
                    className={`
                        absolute top-2 right-2 p-2 text-gray-400 hover:text-black dark:hover:text-white transition-opacity z-10 opacity-100
                    `}
                >
                    <MoreVertical size={20} />
                </button>
            </PixelCard>
        </div>
      );
  };

  const allTabs = [defaultListName, 'DAILY', ...customLists];
  const isSystemTab = (name: string) => [defaultListName, 'DAILY'].includes(name);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Global Click Outside Handler for Cards & Menus */}
      {(expandedTaskId || activeTaskMenu) && (
          <div 
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => {
                setExpandedTaskId(null);
                setActiveTaskMenu(null);
            }}
          />
      )}

      {/* Header Stats */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
            <div>
                <h2 className="text-3xl font-bold uppercase tracking-wide">
                    {filter === defaultListName ? 'My Quests' : filter === 'DAILY' ? 'Daily Quests' : filter}
                </h2>
                <div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <Clock size={16} /> 
                    <span>Resets in 12h 30m</span>
                </div>
            </div>
            <div className="text-right">
                <p className="text-xl font-bold">{tasks.filter(t => t.completed && t.isDaily).length}/{totalDaily} Completed</p>
            </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 border-2 border-black dark:border-white rounded-none relative overflow-hidden">
             <div 
                className="absolute top-0 left-0 h-full bg-secondary transition-all duration-500"
                style={{ width: `${totalDaily > 0 ? (tasks.filter(t => t.completed && t.isDaily).length / totalDaily) * 100 : 0}%` }}
             >
                <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
             </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center mb-6 border-b-2 border-dashed border-gray-300 dark:border-gray-700 pb-2">
        <div className="flex-1 relative min-w-0">
            <div className="flex overflow-x-auto gap-4 pb-2 pr-8 no-scrollbar items-center">
                {allTabs.map((f) => {
                    const isActive = filter === f;
                    const isMenuOpen = activeMenu?.id === f;
                    
                    return (
                        <div key={f} className="relative group shrink-0">
                            <div
                                onClick={() => setFilter(f)}
                                className={`
                                    flex items-center gap-2 pl-6 pr-2 py-2 text-xl font-bold uppercase border-2 border-black dark:border-white transition-all cursor-pointer select-none
                                    ${isActive 
                                        ? 'bg-primary text-black shadow-pixel' 
                                        : 'bg-white dark:bg-card-dark text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }
                                `}
                            >
                                <span>{f}</span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isMenuOpen) {
                                            setActiveMenu(null);
                                        } else {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setActiveMenu({
                                                id: f,
                                                top: rect.bottom + 8, 
                                                left: rect.left
                                            });
                                        }
                                    }}
                                    className={`
                                        p-1 rounded hover:bg-black/10 dark:hover:bg-white/20 transition-colors
                                        ${isMenuOpen ? 'bg-black/10' : ''}
                                    `}
                                >
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-background-light dark:from-background-dark to-transparent pointer-events-none"></div>
        </div>
        <div className="w-[2px] h-8 bg-gray-300 dark:bg-gray-600 mx-2 md:mx-4 shrink-0"></div>
        <button 
            className="shrink-0 w-11 h-11 bg-white dark:bg-card-dark border-2 border-black dark:border-white shadow-pixel-sm hover:shadow-pixel hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center text-black dark:text-white"
            title="Create New List"
            onClick={openCreateList} 
        >
            <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Task List Section */}
      <div className="space-y-4">
        {/* Active Tasks */}
        <div className="grid grid-cols-1 gap-3">
            {activeTasks.map(renderTask)}
        </div>
        
        {/* Empty Active State */}
        {activeTasks.length === 0 && completedTasks.length === 0 && (
            <div className="text-center py-12 border-4 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <p className="text-2xl text-gray-400 uppercase">No quests found here.</p>
                <p className="text-gray-500 mt-2">Create a new task to fill this list!</p>
            </div>
        )}

        {activeTasks.length === 0 && completedTasks.length > 0 && (
             <div className="text-center py-8">
                 <p className="text-xl text-gray-400 uppercase font-bold">All Active Quests Completed!</p>
             </div>
        )}

        {/* Completed Section Separator & Toggle */}
        {completedTasks.length > 0 && (
            <div className="pt-2">
                <button 
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="w-full flex items-center justify-between text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider py-4 hover:text-black dark:hover:text-white transition-colors group"
                >
                    <span className="flex items-center gap-2">
                        Completed ({completedTasks.length})
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            {showCompleted ? 'COLLAPSE' : 'EXPAND'}
                        </span>
                        {showCompleted ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </button>

                {/* Collapsible Content */}
                {showCompleted && (
                    <div className="grid grid-cols-1 gap-3 animate-in slide-in-from-top-2 duration-300">
                        {completedTasks.map(renderTask)}
                    </div>
                )}
            </div>
        )}
      </div>

      {/* List Options Menu */}
      {activeMenu && (
        <div className="fixed inset-0 z-[100]">
            <div 
                className="absolute inset-0 cursor-default" 
                onClick={() => setActiveMenu(null)}
            />
            <div 
                style={{ top: activeMenu.top, left: activeMenu.left }}
                className="absolute bg-white dark:bg-gray-800 border-4 border-black dark:border-white shadow-[8px_8px_0_0_#000] p-6 w-[360px] max-w-[90vw] animate-in fade-in zoom-in-95 duration-200 origin-top-left"
            >
                <div className="text-center mb-4 border-b-2 border-dashed border-gray-300 dark:border-gray-600 pb-2">
                    <h3 className="text-xl font-bold uppercase">{activeMenu.id} Options</h3>
                </div>
                {/* ... existing list options ... */}
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                         <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                            <ArrowDownAZ size={14} /> Sort By
                         </h4>
                         <div className="space-y-2">
                            {/* Sort Options */}
                            {[
                                { id: 'DATE', label: 'Date', icon: <Calendar size={16}/> },
                                { id: 'DEADLINE', label: 'Deadline', icon: <Clock size={16}/> },
                                { id: 'PRIORITY', label: 'Priority', icon: <AlertCircle size={16}/> },
                                { id: 'TITLE', label: 'Title', icon: <Type size={16}/> },
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => {
                                        setSortCriteria(opt.id as SortCriteria);
                                        setActiveMenu(null);
                                    }}
                                    className={`
                                        w-full text-left px-3 py-2 text-sm font-bold uppercase flex items-center gap-2 border-2 transition-all
                                        ${sortCriteria === opt.id 
                                            ? 'bg-black text-white border-black dark:bg-white dark:text-black' 
                                            : 'border-transparent hover:border-black hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300'
                                        }
                                    `}
                                >
                                    {opt.icon}
                                    {opt.label}
                                </button>
                            ))}
                         </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                            <Settings size={14} /> Actions
                        </h4>
                        <div className="space-y-2">
                            {!isSystemTab(activeMenu.id) && (
                                <>
                                    <button 
                                        onClick={() => openRenameList(activeMenu.id)}
                                        className="w-full text-left px-3 py-2 text-sm font-bold uppercase flex items-center gap-2 border-2 border-transparent hover:border-black hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition-all"
                                    >
                                        <Edit3 size={16} /> Rename
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteList(activeMenu.id)}
                                        className="w-full text-left px-3 py-2 text-sm font-bold uppercase flex items-center gap-2 border-2 border-transparent hover:border-red-500 hover:text-red-500 hover:bg-red-50 text-red-500 transition-all"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </>
                            )}
                            <button 
                                onClick={() => handleClearCompleted(activeMenu.id)}
                                className="w-full text-left px-3 py-2 text-sm font-bold uppercase flex items-center gap-2 border-2 border-transparent hover:border-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 text-yellow-600 dark:text-yellow-400 transition-all"
                            >
                                <CheckCircle size={16} /> Clear Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* New Task Options Menu */}
      {activeTaskMenu && (
        <div 
            className="fixed z-[100] bg-white dark:bg-gray-800 border-2 border-black dark:border-white shadow-[6px_6px_0_0_#000] animate-in fade-in zoom-in-95 duration-150 origin-top-right w-56"
            style={{ top: activeTaskMenu.top, left: activeTaskMenu.left }}
        >
             {/* Section 1: Actions */}
             <div className="p-1.5 space-y-0.5">
                 <button 
                    onClick={() => {
                        setReschedulingTaskId(activeTaskMenu.taskId);
                        setActiveTaskMenu(null);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                 >
                     <Clock size={16} className="text-gray-500" />
                     <span className="text-sm font-bold uppercase">Add Deadline</span>
                 </button>
                 <button 
                    onClick={() => {
                        deleteTask(activeTaskMenu.taskId);
                        setActiveTaskMenu(null);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-red-50 hover:text-red-600 transition-colors text-red-500"
                 >
                     <Trash2 size={16} />
                     <span className="text-sm font-bold uppercase">Delete</span>
                 </button>
             </div>

             {/* Unobvious Separator */}
             <div className="border-t border-gray-100 dark:border-gray-700 mx-2"></div>

             {/* Section 2: Move To List */}
             <div className="p-1.5">
                 <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                     Move To...
                 </div>
                 <div className="max-h-48 overflow-y-auto custom-scrollbar">
                     {[defaultListName, 'Daily Quests', ...customLists].map((listName) => {
                         const currentTask = tasks.find(t => t.id === activeTaskMenu.taskId);
                         let isCurrent = false;
                         
                         if (currentTask) {
                             if (listName === 'Daily Quests') isCurrent = !!currentTask.isDaily;
                             else if (listName === defaultListName) isCurrent = !currentTask.isDaily && !currentTask.list;
                             else isCurrent = currentTask.list === listName;
                         }

                         return (
                             <button
                                key={listName}
                                onClick={() => handleMoveTask(activeTaskMenu.taskId, listName)}
                                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                             >
                                 <span className={`text-sm font-bold uppercase ${isCurrent ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>
                                     {listName === defaultListName ? "My Quests" : listName}
                                 </span>
                                 {isCurrent && <Check size={14} className="text-primary" strokeWidth={3} />}
                             </button>
                         );
                     })}
                 </div>
             </div>
        </div>
      )}

      {/* Create/Rename List Modal */}
      <PixelModal isOpen={isListModalOpen} onClose={() => setListModalOpen(false)} title={listModalMode === 'CREATE' ? "Create New List" : "Rename List"}>
          <div className="space-y-6 pt-2">
              <PixelInput 
                  label="List Name" 
                  placeholder="e.g. Side Quests" 
                  autoFocus 
                  value={listNameInput}
                  onChange={(e) => setListNameInput(e.target.value)}
              />
              
              <div className="flex gap-4 pt-4">
                  <PixelButton variant="outline" className="flex-1" onClick={() => setListModalOpen(false)}>
                      Cancel
                  </PixelButton>
                  <PixelButton className="flex-1" onClick={handleListModalSave}>
                      Save
                  </PixelButton>
              </div>
          </div>
      </PixelModal>

      {/* Task Editor Modal */}
      <PixelModal isOpen={isEditorOpen} onClose={onCloseEditor} title="Edit Quest">
          <div className="space-y-6">
              {/* ... (Keep existing editor content same as before) ... */}
              <div className="space-y-2">
                  <label className="block text-xl font-bold uppercase">Quest Name</label>
                  <div className="relative">
                     <Edit3 className="absolute left-3 top-3 text-gray-400" size={20} />
                     <input 
                        className="w-full bg-gray-50 dark:bg-gray-800 border-3 border-black dark:border-white p-3 pl-10 text-xl outline-none focus:shadow-pixel-sm"
                        placeholder="Defeat the laundry monster"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        autoFocus
                     />
                  </div>
              </div>

              <div className="space-y-2">
                  <label className="block text-xl font-bold uppercase">Details</label>
                  <textarea 
                    rows={2}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-3 border-black dark:border-white p-3 text-xl outline-none focus:shadow-pixel-sm resize-none"
                    placeholder="Gather all scattered socks..."
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                  />
              </div>

              <div className="space-y-2">
                  <label className="block text-xl font-bold uppercase">Add to List</label>
                  <div className="relative">
                      <select 
                        value={selectedList}
                        onChange={(e) => setSelectedList(e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 border-3 border-black dark:border-white p-3 text-xl appearance-none outline-none focus:shadow-pixel-sm"
                      >
                          <option value={defaultListName}>{defaultListName}</option>
                          <option value="Daily Quests">Daily Quests</option>
                          {customLists.map(list => (
                              <option key={list} value={list}>{list}</option>
                          ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-4 pointer-events-none text-gray-500" />
                  </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xl font-bold uppercase">Category</label>
                <div className="grid grid-cols-4 gap-2">
                    {Object.values(TaskCategory).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setNewTaskCategory(cat)}
                            className={`
                                py-3 px-2 border-2 border-black text-center text-sm font-bold uppercase transition-all flex flex-col items-center justify-center gap-1
                                ${newTaskCategory === cat ? 'bg-primary text-black shadow-sm scale-[1.02]' : 'bg-white dark:bg-gray-700 hover:bg-gray-100'}
                            `}
                        >
                            {getCategoryIcon(cat)}
                            {cat}
                        </button>
                    ))}
                </div>
              </div>
                 
              <div className="space-y-2">
                <label className="block text-xl font-bold uppercase">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                    {Object.values(TaskPriority).map(p => (
                            <button
                            key={p}
                            onClick={() => setNewTaskPriority(p)}
                            className={`
                                py-3 border-2 border-black text-center text-sm font-bold uppercase transition-all flex items-center justify-center gap-2
                                ${newTaskPriority === p ? 'bg-pixel-blue text-white shadow-sm' : 'bg-white dark:bg-gray-700 hover:bg-gray-100'}
                            `}
                        >
                            {p === 'High' && <Flag size={14} className="fill-current"/>}
                            {p}
                        </button>
                    ))}
                </div>
              </div>

              <div className="space-y-2">
                   <label className="block text-xl font-bold uppercase">Timing</label>
                   <div className="flex gap-4">
                       <button 
                           onClick={() => openPicker('DUE')}
                           className="flex-1 bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm font-bold uppercase flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                       >
                           <span className="text-gray-500">Due</span>
                           <div className="flex items-center gap-2">
                               <span>{format(newTaskDate, 'MMM d')}</span>
                               <Calendar size={16} />
                           </div>
                       </button>

                       <button 
                           onClick={() => openPicker('REMINDER')}
                           className={`flex-1 bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-2 text-sm font-bold uppercase flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${reminderDate ? 'text-primary' : ''}`}
                       >
                           <span className="text-gray-500">Remind</span>
                           <div className="flex items-center gap-2">
                               <span>{reminderDate ? format(reminderDate, 'h:mm a') : 'None'}</span>
                               <Bell size={16} />
                           </div>
                       </button>
                   </div>
              </div>

              <div className="pt-4 flex gap-4">
                  <PixelButton variant="danger" className="flex-1" onClick={onCloseEditor}>
                      Cancel
                  </PixelButton>
                  <PixelButton className="flex-1" onClick={handleSaveTask}>
                      Save
                  </PixelButton>
              </div>
          </div>
      </PixelModal>

      {/* Confirmation Modal */}
      <PixelModal 
        isOpen={confirmation.isOpen} 
        onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))} 
        title={confirmation.title}
      >
          <div className="space-y-6">
              <p className="text-xl text-gray-700 dark:text-gray-300">
                  {confirmation.message}
              </p>
              <div className="flex gap-4 justify-end">
                  <PixelButton 
                    variant="outline" 
                    onClick={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1"
                  >
                      Cancel
                  </PixelButton>
                  <PixelButton 
                    variant={confirmation.variant || 'danger'} 
                    onClick={confirmation.onConfirm}
                    className="flex-1"
                  >
                      {confirmation.confirmLabel || 'Confirm'}
                  </PixelButton>
              </div>
          </div>
      </PixelModal>


      {/* Reused Date Picker for both New Task & Rescheduling */}
      <PixelDatePicker 
        isOpen={isDatePickerOpen || !!reschedulingTaskId}
        onClose={() => {
            setDatePickerOpen(false);
            setReschedulingTaskId(null);
        }}
        selectedDate={reschedulingTaskId ? new Date() : (pickerMode === 'DUE' ? newTaskDate : (reminderDate || new Date()))}
        onSelectDate={(date) => {
            if (reschedulingTaskId) {
                // Handle Updating Existing Task
                const task = tasks.find(t => t.id === reschedulingTaskId);
                if (task) {
                    updateTask({ ...task, dueDate: date.toISOString() });
                }
                setReschedulingTaskId(null);
            } else {
                // Handle New Task Editor
                handleDateSelect(date);
            }
        }}
        title={reschedulingTaskId ? 'UPDATE DEADLINE' : (pickerMode === 'DUE' ? 'DUE DATE' : 'SET REMINDER')}
        includeTime={pickerMode === 'REMINDER'}
      />
    </div>
  );
};
