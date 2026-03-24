import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
  isLoading?: boolean
}

const styles: Record<NonNullable<Props['variant']>, string> = {
  primary:
    'bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 shadow-soft',
  secondary:
    'bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50 active:bg-zinc-100',
  danger: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700',
}

export default function Button({ variant = 'primary', isLoading, disabled, className, ...rest }: Props) {
  const isDisabled = Boolean(disabled || isLoading)
  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
        'focus:outline-none focus:ring-2 focus:ring-zinc-900/20',
        isDisabled ? 'opacity-60 cursor-not-allowed' : '',
        styles[variant],
        className ?? '',
      ].join(' ')}
    >
      {isLoading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : null}
      {rest.children}
    </button>
  )
}

