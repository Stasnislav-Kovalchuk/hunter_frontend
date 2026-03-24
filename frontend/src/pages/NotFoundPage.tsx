import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5">
      <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-zinc-100">
        <div className="text-lg font-semibold">Сторінку не знайдено</div>
        <div className="mt-1 text-sm text-zinc-600">Спробуйте повернутись у меню або адмін-панель.</div>
        <div className="mt-4 flex gap-3">
          <Link
            to="/menu/1"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          >
            Відкрити меню
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-900 ring-1 ring-zinc-200"
          >
            Адмін
          </Link>
        </div>
      </div>
    </div>
  )
}

