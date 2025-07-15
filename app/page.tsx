import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-5xl uppercase bold font-libertine">Wiki Wongos</h1>
        <Link href="game" className="py-3 px-3 w-full bg-white text-black text-center rounded-4xl">
          <span className="text-xl uppercase bold">Play</span>
        </Link>        
      </main>
    </div>
  );
}
