"use client";

import { useState } from "react";

type AnswerBoxParams =
{
  guess: string;
  placeholder: string;
  answer: string;
  onAnswer: (answer: string) => void;
  onChange: (value: string) => void;
}

export default function AnswerBox({ guess, placeholder, answer, onAnswer, onChange }: AnswerBoxParams) {
  return <div className="text-center w-50%">
    <input  value={guess}
            type="text" 
            maxLength={ answer.length } 
            className="border-6 border-cyan-500 rounded-lg p-5 w-full" 
            placeholder={placeholder || ""} 
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && guess.trim())
              {
                onAnswer(guess.trim());
              }
            }}/>
  </div>
}
