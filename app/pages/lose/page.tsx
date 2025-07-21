import Link from "next/link";

export default function Lose() {
  return (
    <>
      <section className="fixed top-0 left-0 w-screen h-full -z-10 pb-5 pointer-events-none transition-colors duration-300 bg-red-500">
      </section>
      <section className="w-screen h-screen">
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
            <h1 className="text-2xl uppercase bold text-white select-none">You Lose</h1>
            <Link href="game" className="py-3 px-3 w-full bg-white text-black text-center rounded-4xl select-none">
              <span className="text-xl uppercase bold select-none">Try Again</span>
            </Link>
          </main>
        </div>
      </section>
    </>
  );
}
