import { cn } from '../../lib/utils';

const PAGE_VISUALS = {
  today: {
    src: '/images/night-shift-training.svg',
    alt: 'Night training gym scene',
  },
  workouts: {
    src: '/images/workout-rotation.svg',
    alt: 'Workout rotation with strength training equipment',
  },
  meals: {
    src: '/images/meal-prep-fuel.svg',
    alt: 'Meal prep bowls and protein ingredients',
  },
  grocery: {
    src: '/images/grocery-prep-list.svg',
    alt: 'Grocery checklist with meal-prep staples',
  },
  progress: {
    src: '/images/progress-metrics.svg',
    alt: 'Fitness progress chart',
  },
  settings: {
    src: '/images/planner-settings.svg',
    alt: 'Planner settings and backup controls',
  },
} as const;

export type PageVisualName = keyof typeof PAGE_VISUALS;

type PageVisualProps = {
  name: PageVisualName;
  className?: string;
};

export default function PageVisual({ name, className }: PageVisualProps) {
  const visual = PAGE_VISUALS[name];

  return (
    <figure
      className={cn(
        'relative aspect-[16/7] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm',
        'before:absolute before:inset-0 before:pointer-events-none before:bg-[radial-gradient(circle_at_20%_15%,rgba(52,211,153,0.12),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0),rgba(2,6,23,0.18))]',
        className,
      )}
    >
      <img
        src={visual.src}
        alt={visual.alt}
        loading="lazy"
        draggable={false}
        className="h-full w-full object-cover"
      />
    </figure>
  );
}
