import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  // Check if user is authenticated
  // This assumes authentication data is stored in locals.user
  // Adjust according to your actual auth implementation
  const user = locals.user;

  if (!user) {
    // If not authenticated, redirect to login page with a return URL
    throw redirect(302, "/login?returnUrl=/payment");
  }

  // User is authenticated, proceed to payment page
  return {
    user,
  };
};
