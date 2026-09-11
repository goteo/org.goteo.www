import { createBanner, deleteBanner } from "./banners";
import { createHomeHero } from "./hero";
import { payment } from "./payment";
import { register } from "./register";

export const server = {
    register,
    payment,
    createBanner,
    deleteBanner,
    createHomeHero,
};
