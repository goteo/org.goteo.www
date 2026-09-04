import { createBanner, deleteBanner } from "./banners";
import { deleteHighlights, saveHighlights, searchProjects } from "./highlights";
import { payment } from "./payment";
import { register } from "./register";

export const server = {
    register,
    payment,
    createBanner,
    deleteBanner,
    saveHighlights,
    deleteHighlights,
    searchProjects,
};
