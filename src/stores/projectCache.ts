import { writable } from "svelte/store";

import type { Project } from "../openapi/client/types.gen";

/**
 * Project Cache Store
 *
 * Session-level cache for project details to avoid refetching the same projects
 * across component mounts and page navigations.
 *
 * Key features:
 * - Multi-key indexing: Projects are indexed by ID, slug, and original idOrSlug
 * - Persistent across component mounts
 * - Shared across all components
 * - Automatic cache validation
 *
 * Usage:
 * ```ts
 * import { projectCache } from './stores/projectCache';
 *
 * // Add a project to the cache
 * projectCache.add(project, originalIdOrSlug);
 *
 * // Get a project from the cache
 * const project = projectCache.get(idOrSlug);
 *
 * // Clear the cache
 * projectCache.clear();
 * ```
 */

interface ProjectCacheStore {
    projects: Map<string, Project>;
}

function createProjectCache() {
    const { subscribe, update } = writable<ProjectCacheStore>({
        projects: new Map(),
    });

    return {
        subscribe,

        /**
         * Add a project to the cache using multiple keys for reliable lookups
         * @param project - The project to cache
         * @param originalKey - Optional original ID or slug used to fetch this project
         */
        add: (project: Project, originalKey?: string) => {
            update((state) => {
                const newProjects = new Map(state.projects);

                // Always add using the original key if provided
                if (originalKey) {
                    newProjects.set(originalKey, project);
                }

                // Add by slug (preferred for URLs)
                if (project.slug) {
                    newProjects.set(project.slug, project);
                }

                // Add by ID (for API IRI lookups)
                if (project.id) {
                    newProjects.set(project.id.toString(), project);
                }

                return { projects: newProjects };
            });
        },

        /**
         * Add multiple projects to the cache
         * @param projects - Array of projects to cache
         */
        addMany: (projects: Project[]) => {
            update((state) => {
                const newProjects = new Map(state.projects);

                projects.forEach((project) => {
                    // Add by slug
                    if (project.slug) {
                        newProjects.set(project.slug, project);
                    }

                    // Add by ID
                    if (project.id) {
                        newProjects.set(project.id.toString(), project);
                    }
                });

                return { projects: newProjects };
            });
        },

        /**
         * Get a project from the cache by ID or slug
         * @param key - Project ID or slug
         * @returns The cached project or undefined
         */
        get: (key: string | undefined): Project | undefined => {
            if (!key) return undefined;

            let result: Project | undefined;
            update((state) => {
                result = state.projects.get(key);
                return state;
            });
            return result;
        },

        /**
         * Check if a project exists in the cache
         * @param key - Project ID or slug
         * @returns True if the project is cached
         */
        has: (key: string | undefined): boolean => {
            if (!key) return false;

            let result = false;
            update((state) => {
                result = state.projects.has(key);
                return state;
            });
            return result;
        },

        /**
         * Clear all cached projects
         */
        clear: () => {
            update(() => ({ projects: new Map() }));
        },

        /**
         * Get cache statistics for debugging
         * @returns Object containing cache size and sample keys
         */
        getStats: () => {
            const stats = { size: 0, sampleKeys: [] as string[] };
            update((state) => {
                stats.size = state.projects.size;
                stats.sampleKeys = Array.from(state.projects.keys()).slice(0, 10);
                return state;
            });
            return stats;
        },
    };
}

export const projectCache = createProjectCache();
