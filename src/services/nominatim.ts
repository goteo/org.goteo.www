/**
 * Service to interact with OpenStreetMap Nominatim API
 * Used for geocoding and retrieving ISO codes for territories
 */

import type { Territory } from "../openapi/client";

export const nominatim = {
    /**
     * Searches for a location and returns ISO codes
     * @param text The location string to search for
     */
    async findIsoByText(text: string): Promise<Territory | null> {
        if (!text || text.trim().length < 1) return null;

        try {
            const url = "https://nominatim.openstreetmap.org/search?";
            const params = new URLSearchParams({
                q: text,
                format: "json",
                addressdetails: "1",
                limit: "1",
            });

            const fullUrl = url + params.toString();
            const cache = await caches.open("nominatim-cache");
            let response = await cache.match(fullUrl);

            if (!response) {
                response = await fetch(fullUrl, {
                    headers: {
                        "User-Agent": "Platoniq Goteo-v4-web",
                    },
                });

                if (response.ok) {
                    await cache.put(fullUrl, response.clone());
                }
            }

            if (!response.ok) {
                throw new Error(`Nominatim API error: ${response.statusText}`);
            }

            const data = await response.json();

            if (data && data.length > 0) {
                const address = data[0].address;

                const foundIsoCodes: string[] = [];
                for (let level = 1; level <= 10; level++) {
                    const key = `ISO3166-2-lvl${level}`;
                    if (address[key]) {
                        foundIsoCodes.push(address[key]);
                    }
                }

                return {
                    country: address.country_code?.toUpperCase() || null,
                    subLvl1: foundIsoCodes[0] || null,
                    subLvl2: foundIsoCodes[1] || null,
                };
            }

            return null;
        } catch (error) {
            console.error("Failed to fetch from Nominatim:", error);
            return null;
        }
    },
};
