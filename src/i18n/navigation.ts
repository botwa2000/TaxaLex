/**
 * Locale-aware navigation helpers.
 * Import Link, redirect, usePathname, useRouter from here — not from 'next/navigation'.
 * These automatically prefix paths with the active locale.
 */
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
