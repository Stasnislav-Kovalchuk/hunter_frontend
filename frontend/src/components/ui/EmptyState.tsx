export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-white p-6 text-center shadow-soft ring-1 ring-zinc-100">
      <div className="text-base font-semibold text-zinc-900">{title}</div>
      {description ? <div className="mt-1 text-sm text-zinc-600">{description}</div> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}

