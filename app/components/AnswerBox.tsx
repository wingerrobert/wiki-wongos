"use client";

import { useState } from "react";

export default function AnswerBox({ placeholder, answer, onAnswer }: { placeholder: string, answer: string, onAnswer: (answer: string) => void }) {
  const [inputValue, setInputValue] = useState("");

  return <div className="text-center w-50%">
    <input  value={inputValue}
            type="text" 
            maxLength={ answer.length } 
            className="border-6 border-cyan-500 rounded-lg p-5 w-full" 
            placeholder={placeholder || ""} 
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && inputValue.trim())
              {
                onAnswer(inputValue.trim());
                setInputValue("");
              }
            }}/>
  </div>
}
