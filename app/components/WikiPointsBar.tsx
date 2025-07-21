import WikiPoint from "./WikiPoint";

export default function WikiPointsBar({ points }: { points: number })
{
  return <article className="flex flex-wrap gap-3 mb-5 pointer-events-none select-none">
    <h1 className="my-auto font-libertine bold">WIKIS</h1>
    {
      !!points && points <= 5 && Array.from({ length: points }).map((_, index) => (
        <WikiPoint key={index} />
      ))
    }
    {
      !!points && points > 5 && (
        <div className="flex justify-items-center">
          <WikiPoint />
          <h1 className="text-white inline my-auto ml-2">x{points}</h1>
        </div>      
      )
    }
    {
      !points && <h1 className="font-bold">x 0</h1>
    }
  </article>
}
