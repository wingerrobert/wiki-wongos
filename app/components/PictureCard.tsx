export default function PictureCard({ src }: { src: string | undefined })
{
 return (
    <article className="flex justify-center items-center h-[50vh]"> 
      <img src={src} className="bg-white rounded-xl max-h-full object-contain" />
    </article>
  ) 
}
