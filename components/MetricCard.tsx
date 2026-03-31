interface MetricCardProps {
  label: string
  value: string | number
  accent?: boolean
  sublabel?: string
}

export default function MetricCard({ label, value, accent, sublabel }: MetricCardProps) {
  return (
    <div className="bg-surface rounded-xl p-5 border border-border">
      <p className="text-[11px] uppercase tracking-widest text-muted font-semibold mb-3">
        {label}
      </p>
      <p
        className="text-[28px] font-bold leading-none tabular-nums"
        style={{ color: accent ? '#b8f724' : '#e8e5e0' }}
      >
        {value}
      </p>
      {sublabel && (
        <p className="text-[11px] text-muted mt-2">{sublabel}</p>
      )}
    </div>
  )
}
