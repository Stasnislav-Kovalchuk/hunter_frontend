import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
}

export default function Input({ label, hint, error, className, ...rest }: Props) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm font-medium text-zinc-800">{label}</div> : null}
      <input
        {...rest}
        className={[
          'w-full rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-zinc-200 outline-none',
          'focus:ring-2 focus:ring-zinc-900/20',
          error ? 'ring-red-300 focus:ring-red-300/40' : '',
          className ?? '',
        ].join(' ')}
      />
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : hint ? <div className="mt-1 text-xs text-zinc-500">{hint}</div> : null}
    </label>
  )
}

