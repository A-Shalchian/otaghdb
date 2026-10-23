"use client";

import { useState } from "react";
import { chatFocus } from "./chat-parts";
import { runSteps } from "./content";

export function RunSteps() {
  const [system, setSystem] = useState(runSteps[0].system);
  const current = runSteps.find((steps) => steps.system === system) ?? runSteps[0];

  return (
    <div className="mt-4">
      <div role="tablist" aria-label="Operating system" className="flex flex-wrap gap-2">
        {runSteps.map((steps) => {
          const selected = steps.system === system;
          return (
            <button
              key={steps.system}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setSystem(steps.system)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                selected ? "bg-[#18212c] text-[#e8ecf1]" : "border border-[#aab6c6] hover:bg-[#dde3eb]"
              } ${chatFocus}`}
            >
              {steps.system}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        aria-label={`${current.system} steps`}
        className="chat-code mt-3 overflow-x-auto rounded-[14px] bg-[#18212c] px-5 py-4 font-mono text-sm leading-7 text-[#e8ecf1]"
      >
        {current.commands.map((command) => (
          <code key={command} className="block whitespace-pre">
            <span className="select-none text-[#8a96a6]">{current.prompt} </span>
            {command}
          </code>
        ))}
      </div>
    </div>
  );
}
