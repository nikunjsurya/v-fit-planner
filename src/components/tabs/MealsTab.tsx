import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { proteinSources, carbSources, avoidItems } from '../../data/mealData';

export default function MealsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Food Options</h2>
        <p className="text-slate-400">Vegetarian (no egg) protein and carb sources.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-emerald-400">Protein Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-2 gap-2 text-sm text-slate-300">
              {proteinSources.map(item => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-orange-400">Carb Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-300">
              {carbSources.map(item => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-red-900/30 bg-red-950/10 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-red-400">Reduce / Avoid</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-3">Limit these to improve waist fat loss:</p>
          <div className="flex flex-wrap gap-2 text-sm">
            {avoidItems.map(item => (
              <span key={item} className="bg-red-900/20 text-red-200 px-2.5 py-1 rounded-full border border-red-900/50">
                {item}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
