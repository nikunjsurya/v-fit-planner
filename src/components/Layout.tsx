import { Settings, Calendar, Dumbbell, Utensils, ChefHat, ShoppingCart, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import DashboardTab from './tabs/DashboardTab';
import WorkoutsTab from './tabs/WorkoutsTab';
import MealsTab from './tabs/MealsTab';
import MealPrepTab from './tabs/MealPrepTab';
import GroceryTab from './tabs/GroceryTab';
import ProgressTab from './tabs/ProgressTab';
import SettingsTab from './tabs/SettingsTab';
import { useAppContext } from '../context/AppContext';

const tabs = [
  { id: 'today', label: 'Today', icon: Calendar, component: DashboardTab },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell, component: WorkoutsTab },
  { id: 'meals', label: 'Meals', icon: Utensils, component: MealsTab },
  { id: 'prep', label: 'Meal Prep', icon: ChefHat, component: MealPrepTab },
  { id: 'grocery', label: 'Grocery', icon: ShoppingCart, component: GroceryTab },
  { id: 'progress', label: 'Progress', icon: TrendingUp, component: ProgressTab },
  { id: 'settings', label: 'Settings', icon: Settings, component: SettingsTab },
];

const DEFAULT_TAB_ID = 'today';

export default function Layout() {
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB_ID);
  const { profile, progress } = useAppContext();

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || DashboardTab;
  const latestWeight = progress[0]?.weight;
  const heightFt = profile.heightCm > 0 ? `${Math.floor(profile.heightCm / 30.48)}'${Math.round((profile.heightCm / 2.54) % 12)}"` : null;

  return (
    <div className="flex h-screen w-full flex-col bg-[#09090b] text-slate-100 md:flex-row overflow-hidden font-sans md:p-6 md:gap-4">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border border-slate-800 bg-slate-900/40 rounded-2xl z-10">
        <div className="flex h-16 items-center px-6 border-b border-slate-800/50">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] mr-3">
            <span className="text-slate-900 font-bold text-lg leading-none">V</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none tracking-tight text-white mb-0.5">V-Fit Planner</h1>
            <p className="text-[10px] text-slate-500">Night Shift Mode</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto p-4">
          <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Profile</p>
            <p className="text-xs font-medium text-slate-300">{profile.name || 'Add your name'}</p>
            <p className="text-xs font-medium text-slate-300">
              {profile.age ? `${profile.age} yrs` : 'Age?'}
              {heightFt ? ` • ${heightFt}` : ''}
            </p>
            <p className="text-xs font-medium text-slate-400 mt-1">
              {latestWeight ? `${latestWeight} kg` : 'Log your weight'}
              {profile.goalWeightKg ? ` → goal ${profile.goalWeightKg} kg` : ''}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 relative md:bg-slate-900 md:border md:border-slate-800 md:rounded-3xl">
        <header className="md:hidden flex h-[calc(3.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] items-center justify-between px-4 border-b border-slate-800 bg-[#09090b]/80 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <span className="text-slate-900 font-bold text-lg leading-none">V</span>
            </div>
            <div>
              <h1 className="text-base font-semibold leading-none tracking-tight text-white mb-0.5">V-Fit Planner</h1>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
          <ActiveComponent />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] items-center justify-around border-t border-slate-800 bg-[#09090b]/95 backdrop-blur-md md:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
