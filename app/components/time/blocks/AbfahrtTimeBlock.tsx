"use client";

import TimeRow from "../ui/TimeRow";
import { TimeParts } from "../lib/time";

type AbfahrtTimeBlockProps = {
  includeAbfahrt: boolean;
  onToggleIncludeAbfahrt: (value: boolean) => void;

  abfahrtVon: TimeParts;
  abfahrtBis: TimeParts;
  onAbfahrtVonChange: (value: TimeParts) => void;
  onAbfahrtBisChange: (value: TimeParts) => void;

  timeOptions: {
    hours: string[];
    minutes: string[];
  };

  disabled?: boolean;
};

export default function AbfahrtTravelTimeBlock({
  includeAbfahrt,

  onToggleIncludeAbfahrt,

  abfahrtVon,
  abfahrtBis,
  onAbfahrtVonChange,
  onAbfahrtBisChange,
  timeOptions,
  disabled = false,
}: AbfahrtTimeBlockProps) {
  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm space-y-4 transition-opacity ${disabled ? "border-gray-100 opacity-40 pointer-events-none select-none" : "border-gray-200"}`}>
      <label className="flex items-center gap-2 text-sm text-gray-800">
        <input
          type="checkbox"
          checked={includeAbfahrt}
          onChange={(e) => onToggleIncludeAbfahrt(e.target.checked)}
          className="h-4 w-4"
        />
        Abfahrt berücksichtigen
      </label>

      {includeAbfahrt && (
        <div className="space-y-3 pt-2 border-t">
          <div className="text-xs font-medium text-gray-600">Abfahrt</div>

          <div className="grid grid-cols-2 gap-3">
            <TimeRow
              label="Von"
              value={abfahrtVon}
              onChange={onAbfahrtVonChange}
              timeOptions={timeOptions}
            />

            <TimeRow
              label="Bis"
              value={abfahrtBis}
              onChange={onAbfahrtBisChange}
              timeOptions={timeOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
}
