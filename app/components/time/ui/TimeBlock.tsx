import { ReactNode } from "react"

type Props = {
  title: string
  children: ReactNode
  disabled?: boolean
}

export default function TimeBlock({ title, children, disabled = false }: Props) {
  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm space-y-3 transition-opacity ${disabled ? "border-gray-100 opacity-40 pointer-events-none select-none" : "border-gray-200"}`}>
      <h2 className={`text-sm font-semibold uppercase ${disabled ? "text-gray-400" : "text-blue-600"}`}>
        {title}
      </h2>

      {children}
    </div>
  )
}
