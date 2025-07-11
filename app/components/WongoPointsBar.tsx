import WongoPoint from "./WongoPoint";

export default function WongoPointsBar({ points }: { points: number })
{
  return <article className="flex flex-wrap gap-3 mb-10">
    {
      !!points && points <= 5 && Array.from({ length: points }).map((_, index) => (
        <WongoPoint key={index} />
      ))
    }
    {
      !!points && points > 5 && (
        <div className="flex justify-items-center">
          <WongoPoint />
          <h1 className="inline my-auto ml-2">x{points}</h1>
        </div>      
      )
    }
  </article>
}
