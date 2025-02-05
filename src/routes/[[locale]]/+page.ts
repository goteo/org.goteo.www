import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  const response = await fetch("/api/locales");
  const { locales } = await response.json();

  return {
    locales,
  };
};
