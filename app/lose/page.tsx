import Link from "next/link";

export default function Lose() {
  return (
    <section className="w-screen h-screen bg-red-900">
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <h1 className="text-2xl uppercase bold text-white">You Lose</h1>
          <Link href="game" className="py-3 px-3 w-full bg-white text-black text-center rounded-4xl">
            <span className="text-xl uppercase bold">Try Again</span>
          </Link>
        </main>
      </div>
    </section>
  );
}
