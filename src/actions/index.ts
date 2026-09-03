import { createBanner, deleteBanner } from "./banners";
import { payment } from "./payment";
import { register } from "./register";

export const server = {
    register,
    payment,
    createBanner,
    deleteBanner,
};
