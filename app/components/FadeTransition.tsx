import globalDefaults from "../global";

export default function FadeTransition({isTransitioning}: {isTransitioning: boolean})
{
  return (
    <div className={`select-none pointer-events-none fixed inset-0 bg-white dark:bg-black z-50 transition-opacity duration-${globalDefaults.transitionDuration} ${isTransitioning ? 'opacity-0' : 'opacity-100'}`} />
  )
}
