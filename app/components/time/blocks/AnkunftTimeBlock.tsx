"use client";

import TimeRow from "../ui/TimeRow";
import { TimeParts } from "../lib/time";

type AnkunftTimeBlockProps = {
 
  includeAnkunft: boolean; 
  onToggleIncludeAnkunft: (value: boolean) => void;

  ankunftVon: TimeParts;
  ankunftBis: TimeParts;
  onAnkunftVonChange: (value: TimeParts) => void;
  onAnkunftBisChange: (value: TimeParts) => void;
  
  timeOptions: {
    hours: string[];
    minutes: string[];
  };

  disabled?: boolean;
};

export default function AnkunftTimeBlock({
 
  includeAnkunft, 
  onToggleIncludeAnkunft,  
  timeOptions,
  ankunftVon,
  ankunftBis,
  onAnkunftVonChange,
  onAnkunftBisChange,
  disabled = false,
}: AnkunftTimeBlockProps) {
  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm space-y-4 transition-opacity ${disabled ? "border-gray-100 opacity-40 pointer-events-none select-none" : "border-gray-200"}`}>
      <label className="flex items-center gap-2 text-sm text-gray-800">
        <input
          type="checkbox"
          checked={includeAnkunft}
          onChange={(e) => onToggleIncludeAnkunft(e.target.checked)}
          className="h-4 w-4"
        />
        Ankunft berücksichtigen
      </label>
      
      {includeAnkunft && (
        <div className="space-y-3 pt-2 border-t">
          <div className="text-xs font-medium text-gray-600">Ankunft</div>

          <div className="grid grid-cols-2 gap-3">
            <TimeRow
              label="Von"
              value={ankunftVon}
              onChange={onAnkunftVonChange}
              timeOptions={timeOptions}
            />

            <TimeRow
              label="Bis"
              value={ankunftBis}
              onChange={onAnkunftBisChange}
              timeOptions={timeOptions}
            />
          </div>
        </div>
      )}
      
    </div>
  );
}
