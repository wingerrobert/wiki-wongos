import { FaTag } from "react-icons/fa6";

export default function CategorySkeleton()
{
  return <a 
            className="p-4 hover:cursor-pointer bg-cyan-100 dark:bg-black text-cyan-800 dark:text-white hover:bg-white hover:dark:bg-cyan-950 transition-colors duration-200 font-bold my-2 rounded-lg border-2 border-cyan-700 dark:border-cyan-900 border-dashed grid select-none grid-cols-8 gap-2 justify-center">
              <FaTag className="inline text-cyan-800 dark:text-cyan-600 col-span-1 self-center" />
              <span className="inline col-span-7"></span>
          </a>
