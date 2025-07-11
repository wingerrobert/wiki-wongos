type WongoPointProps =
{
  fontSize?: number,
  coinSize?: number,
  leftValue?: number,
  topValue?: number
}

export default function WongoPoint({ fontSize, coinSize, leftValue, topValue }: WongoPointProps)
{
  return <div className={`p-${coinSize ?? 4} w-3 h-3 rounded-full border-2 outline-2 outline-cyan-900 outline-dashed border-cyan-500 text-cyan-500 flex flex-col justify-items-center justify-center`}>
    <div className="relative font-bold" style={{ left: leftValue ?? -7.5, top: topValue ?? 2, fontSize: fontSize ?? 15 }}>W</div>
  </div>
}
