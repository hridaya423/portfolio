const USER = "hridaya423";

// Below this a count reads as a shrug rather than a signal, so the button stays an icon.
export const STAR_FLOOR = 10;

/**
 * Star counts for every public repo with at least one star, keyed by lowercase
 * repo name. One search request, cached for a day; an outage just hides the counts.
 */
export async function getStars(): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=user:${USER}+stars:%3E=1&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
        next: { revalidate: 86400 },
      },
    );
    if (!response.ok) return {};
    const { items } = (await response.json()) as {
      items: { name: string; stargazers_count: number }[];
    };
    return Object.fromEntries(
      items.map((repo) => [repo.name.toLowerCase(), repo.stargazers_count]),
    );
  } catch {
    return {};
  }
}

export function starsFor(stars: Record<string, number>, repo?: string) {
  const count = repo ? stars[repo.split("/").pop()!.toLowerCase()] : undefined;
  return count !== undefined && count >= STAR_FLOOR ? count : undefined;
}

export const formatStars = (count: number) =>
  count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(count);
