/// <reference types="vite/client" />

declare module '*.jsx' {
  import type { FC } from 'react'
  const Component: FC
  export default Component
}

