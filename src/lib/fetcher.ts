import { err, ok, type Result } from "neverthrow";

interface PageResult<T> {
  data: T[];
  totalPages: number;
}

export async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<Result<PageResult<T>, Error>>,
  page = 1,
  accumulatedActors: T[] = [],
): Promise<Result<T[], Error>> {
  const result = await fetchPage(page);
  return result.match(
    (d) => {
      const { data, totalPages } = d;
      const newAccumulatedActors = [...accumulatedActors, ...data];
      if (data.length === 0 || page >= totalPages) {
        return ok(newAccumulatedActors);
      }
      return fetchAllPages(fetchPage, page + 1, newAccumulatedActors);
    },
    (error) => err(new Error(`Failed to fetch actors: ${error.message}`)),
  );
};
