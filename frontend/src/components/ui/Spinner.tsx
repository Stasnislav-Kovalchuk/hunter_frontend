export default function Spinner({ label = 'Завантаження…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-zinc-100">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      <div className="text-sm text-zinc-700">{label}</div>
    </div>
  )
}

