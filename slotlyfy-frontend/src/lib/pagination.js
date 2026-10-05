/**
 * Utilidades sobre el `Page<T>` que devuelve Spring Data.
 *
 * Serializado, sólo son fiables los campos de primer nivel que exponen los
 * getters de `Chunk`: `content`, `number`, `size`, `totalElements`,
 * `totalPages`, `first`, `last`, `empty`, `numberOfElements`. Los objetos
 * anidados `pageable` y `sort` son internos de Spring Data y cambiaron entre
 * versiones, así que nunca los leemos.
 */

export function emptyPage(size = 10) {
  return {
    content: [],
    number: 0,
    size,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    empty: true,
    numberOfElements: 0,
  }
}

/**
 * Normaliza el cuerpo JSON de un `Page<T>` de Spring Data.
 *
 * Recibe el cuerpo ya desenvuelto de axios (`const { data } = await http.get()`),
 * no la respuesta completa, y devuelve siempre la misma forma para que los
 * componentes no tengan que comprobar qué campos faltan.
 */
export function toPage(body, size = 10) {
  if (!body || typeof body !== 'object') return emptyPage(size)
  return {
    content: Array.isArray(body.content) ? body.content : [],
    number: Number(body.number ?? 0),
    size: Number(body.size ?? size),
    totalElements: Number(body.totalElements ?? 0),
    totalPages: Number(body.totalPages ?? 0),
    first: Boolean(body.first ?? true),
    last: Boolean(body.last ?? true),
    empty: Boolean(body.empty ?? true),
    numberOfElements: Number(body.numberOfElements ?? 0),
  }
}

/**
 * Construye un `Page<T>` en memoria. Necesario para la vista "Todos", donde
 * paginamos en cliente la unión de todas las categorías (el backend obliga a
 * filtrar por una categoría exacta, no hay consulta sin filtro).
 */
export function buildPage(items, pageNumber, pageSize) {
  const totalElements = items.length
  const totalPages = pageSize > 0 ? Math.ceil(totalElements / pageSize) : 0
  const safeNumber = totalPages === 0 ? 0 : Math.min(pageNumber, totalPages - 1)
  const start = safeNumber * pageSize
  return {
    content: items.slice(start, start + pageSize),
    number: safeNumber,
    size: pageSize,
    totalElements,
    totalPages,
    first: safeNumber === 0,
    last: safeNumber >= totalPages - 1,
    empty: totalElements === 0,
    numberOfElements: Math.min(pageSize, Math.max(totalElements - start, 0)),
  }
}

/** Quita duplicados por id y ordena por nombre (estable para la vista "Todos"). */
export function dedupeAndSort(items) {
  const seen = new Set()
  const unique = []
  for (const item of items) {
    if (item?.id == null || seen.has(item.id)) continue
    seen.add(item.id)
    unique.push(item)
  }
  return unique.sort((a, b) =>
    String(a.name || '').localeCompare(String(b.name || ''), 'es'),
  )
}

/** Número de páginas visibles en el control de paginación. */
export function pageWindow(current, totalPages, span = 1) {
  const pages = new Set()
  for (let i = 0; i < totalPages; i += 1) {
    if (i <= current + span && i >= current - span) pages.add(i)
  }
  if (totalPages > 0) {
    pages.add(0)
    pages.add(totalPages - 1)
  }
  return [...pages].sort((a, b) => a - b)
}
