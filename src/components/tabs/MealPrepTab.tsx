import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ChefHat, Info } from 'lucide-react';
import { defaultMealPrepSessions } from '../../data/mealData';

export default function MealPrepTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Meal Prep Plan</h2>
        <p className="text-slate-400">Two cooking sessions per week to cover work shifts.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <img
          src="/images/meal-prep-fuel.svg"
          alt="Meal prep bowls and protein ingredients"
          loading="lazy"
          className="h-36 w-full object-cover sm:h-44"
        />
      </div>

      <div className="space-y-4">
        {defaultMealPrepSessions.map((session) => (
          <Card key={session.id} className="border-emerald-500/20 bg-slate-900 border overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center text-emerald-400">
                <ChefHat className="w-5 h-5 mr-2" />
                {session.dayName}
              </CardTitle>
              <CardDescription>{session.targetDays}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl text-sm space-y-2">
                <p><span className="font-semibold text-slate-200">Meal:</span> {session.defaultMeal}</p>
                <p><span className="font-semibold text-slate-200">Amount:</span> {session.amount}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h3 className="text-xl font-bold text-white mt-8 mb-4">Portion Sizes</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
             <CardTitle className="text-base text-white">My Box (Cutting / Muscle)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Big protein curry portion</li>
              <li>• 1 cup cooked rice</li>
              <li>• Vegetables or side salad</li>
              <li>• Curd or Greek yogurt (kept separate)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
             <CardTitle className="text-base text-white">Brother's Box</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Same curry</li>
              <li>• 1.5 to 2 cups rice</li>
              <li>• Optional frozen paratha</li>
              <li>• Optional banana, milk, PB, or extra yogurt</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mt-6 text-sm text-slate-400 flex items-start">
        <Info className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
        <p>I only cook curries and rice; I do not cook roti. Adjust brother's carbs using rice or frozen parathas.</p>
      </div>
    </div>
  );
}
