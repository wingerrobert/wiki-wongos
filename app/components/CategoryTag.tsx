import { FaTag } from "react-icons/fa6";

export default function CategoryTag({ title }: { title: string })
{
  return <a 
            className="p-4 hover:cursor-pointer bg-black text-cyan-300 dark:text-white hover:bg-cyan-950 transition-colors duration-200 font-bold my-2 rounded-lg border-2 border-cyan-900 border-dashed grid select-none grid-cols-8 gap-2 justify-center">
              <FaTag className="inline text-cyan-600 col-span-1 self-center" />
              <span className="inline col-span-7">{ title }</span>
          </a>
}
