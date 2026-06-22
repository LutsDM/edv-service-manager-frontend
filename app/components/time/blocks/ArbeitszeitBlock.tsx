import TimeBlock from "../ui/TimeBlock"
import TimeRow from "../ui/TimeRow"
import { TimeParts } from "../lib/time"

type Props = {
 
  // Arbeitszeit
  start: TimeParts
  end: TimeParts
  onStartChange: (value: TimeParts) => void
  onEndChange: (value: TimeParts) => void

  timeOptions: {
    hours: string[]
    minutes: string[]
  }

  disabled?: boolean
}

export default function ArbeitszeitBlock({
 
  start,
  end,
  onStartChange,
  onEndChange,
  timeOptions,
  disabled = false,
}: Props) {
  return (
    <TimeBlock title="Arbeitszeit" disabled={disabled}>
      <div className="space-y-4">
        
        {/* Arbeitszeit */}
        <div>
          <div className="flex justify-center font-bold text-xs text-gray-600 mb-1">
            Arbeitszeit
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TimeRow
              label="Beginn"
              value={start}
              onChange={onStartChange}
              timeOptions={timeOptions}
            />

            <TimeRow
              label="Ende"
              value={end}
              onChange={onEndChange}
              timeOptions={timeOptions}
            />
          </div>
        </div>
      </div>
    </TimeBlock>
  )
}
