export const NOMINATIM_ADDRESS = "https://nominatim.openstreetmap.org";

/**
 * Shape of Nominatim results
 * @see https://nominatim.org/release-docs/develop/api/Output/#json
 */
export interface NominatimResult {
    /**
     * Reference to the Nominatim internal database ID
     */
    place_id: number;

    licence: string;

    /**
     * Reference to the OSM object
     */
    osm_type: string;

    /**
     * Reference to the OSM object
     */
    osm_id: number;

    /**
     * Area of corner coordinates
     */
    boundingbox: number[];

    /**
     * Latitude of the centroid of the object
     */
    lat: number;

    /**
     * Longitude of the centroid of the object
     */
    lon: number;

    /**
     * Full comma-separated address
     */
    display_name: string;

    /**
     * Key of the main OSM tag
     */
    class: string;

    /**
     * Value of the main OSM tag
     */
    type: string;

    /**
     * Computed importance rank
     */
    importance: number;

    /**
     * Link to class icon (if available)
     */
    icon?: string;

    /**
     * Dictionary of address details
     */
    address?: Record<string, string>;

    /**
     * Dictionary with additional useful tags like website or maxspeed
     */
    extratags?: Record<string, string>;
}

export async function searchPlace(
    value: string,
    limit: number = 6,
    extratags: boolean = false,
): Promise<NominatimResult[]> {
    const url = new URL(
        "/search?" +
            new URLSearchParams({
                q: value,
                limit: limit.toString(),
                format: "json",
                addressdetails: "1",
                extratags: extratags ? "1" : "0",
            }),
        NOMINATIM_ADDRESS,
    );

    if (caches !== undefined) {
        const cache = await caches.open(NOMINATIM_ADDRESS);
        const cached = await cache.match(url);

        if (cached) {
            return await cached.json();
        }

        await cache.add(url);
    }

    return await fetch(url).then((res) => res.json());
}
