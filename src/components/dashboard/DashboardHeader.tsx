interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-[#F1F5F9]">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-[#94A3B8]">{subtitle}</p>
      )}
    </div>
  )
}
