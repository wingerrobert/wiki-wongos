import { WikiArticle } from '../services/wikiservice';
import AnswerBox from './AnswerBox';
import CategorySkeleton from './CategorySkeleton';

const dummyArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]; // Yes this is dumb. No I don't care

export default function ArticleSkeleton() {
  return (
    <article>
      <h1 className="text-center text-5xl mb-20 animate-shimmer-text">_ _ _ _ _ _ _ _ _</h1>

      <AnswerBox guess={""} onChangeAction={()=>{}} onAnswerAction={()=>{}} placeholder="_ _ _ _ _ _ _ _ _" answer={""} />

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
        {
          dummyArray.map(k => {
            return (<CategorySkeleton key={k} />)
          })
        }
      </div>

    </article>
  )
}
