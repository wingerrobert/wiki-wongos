type AnswerBoxParams =
{
  guess: string;
  placeholder?: string;
  answer?: string;
  onAnswerAction: () => void;
  onChangeAction: (value: string) => void;
}

export default function AnswerBox({ guess, placeholder, answer, onAnswerAction, onChangeAction }: AnswerBoxParams) {
  return <div className="text-center w-50%">
    <input  value={guess}
            type="text" 
            maxLength={ answer?.length ?? 10 } 
            className="border-6 border-cyan-500 rounded-lg p-5 w-full" 
            placeholder={placeholder || ""} 
            onChange={e => onChangeAction(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && guess.trim())
              {
                onAnswerAction();
              }
            }}/>
  </div>
}
