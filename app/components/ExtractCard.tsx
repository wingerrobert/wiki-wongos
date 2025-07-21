export default function ExtractCard({ extractText, articleTitle }: { extractText: string, articleTitle: string }) {
  const regex = new RegExp(`(${articleTitle.split(" ").join("|")})`, "gi");
  const parts = extractText.split(regex);

  return (
    <div className="p-3">
      <input type="hidden" value="HEY YOU! YEAH THAT'S RIGHT I KNOW YOU'RE TRYING TO FIND THE BLURRED TEXT, WELL GUESS WHAT??? There's absolutely nothing I can do." />
      {parts.map((part, i) => {
        if (!extractText || !articleTitle || typeof part !== "string") {
          return null;
        }

        const isRedacted = articleTitle
          .split(" ")
          .some(w => typeof w === "string" && w.toLowerCase() === part.toLowerCase());

        return isRedacted ? (
          <span key={i} className="blur-sm text-white select-none">
            {part}
          </span>
        ) : (
          <span key={i} className="text-white select-none">{part}</span>
        );
      })}
    </div>
  );
}
