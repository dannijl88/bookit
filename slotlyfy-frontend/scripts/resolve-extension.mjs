/**
 * Hook de resolución para ejecutar el código fuente del proyecto en Node.
 *
 * El fuente usa imports sin extensión (`from '../lib/api'`), que es lo normal en
 * un proyecto de Vite, pero el resolver ESM de Node exige el fichero completo.
 * Este hook añade la extensión sólo cuando el specifier es relativo y falla.
 */
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const CANDIDATES = ['.js', '.jsx', '/index.js', '/index.jsx']

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    const base = specifier.startsWith('/')
      ? fileURLToPath(specifier)
      : new URL(specifier, context.parentURL).pathname.replace(/^\/([A-Za-z]:)/, '$1')

    if (!existsSync(base)) {
      for (const suffix of CANDIDATES) {
        if (existsSync(base + suffix)) {
          return nextResolve(specifier + suffix, context)
        }
      }
    }
  }
  return nextResolve(specifier, context)
}
