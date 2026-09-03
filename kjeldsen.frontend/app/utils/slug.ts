/**
 * A heading's anchor id, from its plain text.
 *
 * Emphasis markers are stripped first - `**Easy Caching**` and `Easy Caching` must land on the same
 * id, because the outline on a post and the heading itself derive it independently.
 */
export function slugify(text: string | null | undefined): string {
  return (text ?? '')
    .replace(/\*\*|--/g, '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
