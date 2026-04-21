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
        if (!text || text.trim().length < 3) return null;

        try {
            // We use addressdetails=1 to get ISO codes in the response
            const params = new URLSearchParams({
                q: text,
                format: "json",
                addressdetails: "1",
                limit: "1",
            });

            const response = await fetch("https://nominatim.openstreetmap.org/search?" + params, {
                headers: {
                    // Nominatim requires a descriptive User-Agent
                    "User-Agent": "BuscarProyecto(contact@yourproyect.com)",
                },
            });

            if (!response.ok) {
                throw new Error(`Nominatim API error: ${response.statusText}`);
            }

            const data = await response.json();

            if (data && data.length > 0) {
                const address = data[0].address;

                return {
                    country: address.country_code?.toUpperCase() || null,
                    subLvl1: address["ISO3166-2-lvl4"] || address["ISO3166-2-lvl3"] || null,
                    subLvl2: address["ISO3166-2-lvl6"] || null,
                };
            }

            return null;
        } catch (error) {
            console.error("Failed to fetch from Nominatim:", error);
            return null;
        }
    },
};
