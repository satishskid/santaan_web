export function tagToSlug(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function slugToLabel(slug: string) {
  return slug
    .trim()
    .replace(/-+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

