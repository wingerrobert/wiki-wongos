import { FaTag } from "react-icons/fa6";

export default function CategorySkeleton()
{
  return <a 
            className="p-4 hover:cursor-pointer bg-black text-gray-300 dark:text-white hover:bg-gray-950 transition-colors duration-200 font-bold my-2 rounded-lg border-2 border-gray-900 border-dashed grid select-none grid-cols-8 gap-2 justify-center">
              <FaTag className="inline text-gray-600 col-span-1 self-center" />
              <span className="inline col-span-7" />
          </a>
}
