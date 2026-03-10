import type { SupplyFlow, LogisticsHub, Store, LogisticsOwner } from './types';

const MAX_FLOW_DISTANCE_KM = 100;
const MAX_FLOWS_PER_HUB = 8;
const MAX_TOTAL_FLOWS = 100;

function haversineDistance(
    coord1: [number, number],
    coord2: [number, number]
): number {
    const R = 6371;
    const [lng1, lat1] = coord1;
    const [lng2, lat2] = coord2;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const OWNER_TO_CHAINS: Record<LogisticsOwner, string[]> = {
    'NorgesGruppen': ['Kiwi', 'Meny', 'Spar', 'Joker', 'Nærbutikken', 'Matkroken'],
    'Coop': ['Coop Prix', 'Coop Extra', 'Coop Mega', 'Coop Marked', 'Obs', 'Extra'],
    'Rema 1000': ['Rema 1000'],
    'Bunnpris AS': ['Bunnpris'],
};

function getOwnedChains(owner: LogisticsOwner): string[] {
    return OWNER_TO_CHAINS[owner] || [];
}

function calculateVolume(storesInRange: number): number {
    if (storesInRange <= 5) return 2;
    if (storesInRange <= 15) return 4;
    if (storesInRange <= 30) return 6;
    if (storesInRange <= 50) return 8;
    return 10;
}

export function generateSupplyFlows(
    hubs: LogisticsHub[],
    stores: Store[]
): SupplyFlow[] {
    const flows: SupplyFlow[] = [];

    for (const hub of hubs) {
        const ownedChains = getOwnedChains(hub.owner);

        const nearbyStores = stores
            .filter(store => {
                const storeCoords: [number, number] = [store.location.lng, store.location.lat];
                const distance = haversineDistance(hub.coordinates, storeCoords);
                return distance <= MAX_FLOW_DISTANCE_KM;
            })
            .filter(store => {
                const chainMatches = ownedChains.some(chain =>
                    store.chain.toLowerCase().includes(chain.toLowerCase()) ||
                    chain.toLowerCase().includes(store.chain.toLowerCase())
                );
                return chainMatches;
            });

        const storesByDistance = nearbyStores
            .map(store => ({
                store,
                distance: haversineDistance(
                    hub.coordinates,
                    [store.location.lng, store.location.lat]
                ),
            }))
            .sort((a, b) => a.distance - b.distance);

        const clusteredStores = clusterStores(storesByDistance.map(s => s.store), MAX_FLOWS_PER_HUB);

        for (const cluster of clusteredStores) {
            const centroid = calculateCentroid(cluster);
            const volume = calculateVolume(cluster.length);

            flows.push({
                id: `flow-${hub.id}-${flows.length}`,
                from: {
                    type: 'hub',
                    id: hub.id,
                    coordinates: hub.coordinates,
                },
                to: {
                    type: 'store',
                    id: cluster[0].id,
                    coordinates: centroid,
                },
                volume,
                type: 'distribution',
            });
        }
    }

    return flows.slice(0, MAX_TOTAL_FLOWS);
}

function clusterStores(stores: Store[], maxClusters: number): Store[][] {
    if (stores.length === 0) return [];
    if (stores.length <= maxClusters) {
        return stores.map(s => [s]);
    }

    const clusters: Store[][] = [];
    const clusterRadius = 20;

    const assigned = new Set<string>();

    for (const store of stores) {
        if (assigned.has(store.id)) continue;

        const cluster: Store[] = [store];
        assigned.add(store.id);

        for (const other of stores) {
            if (assigned.has(other.id)) continue;

            const distance = haversineDistance(
                [store.location.lng, store.location.lat],
                [other.location.lng, other.location.lat]
            );

            if (distance <= clusterRadius) {
                cluster.push(other);
                assigned.add(other.id);
            }
        }

        clusters.push(cluster);

        if (clusters.length >= maxClusters) break;
    }

    return clusters;
}

function calculateCentroid(stores: Store[]): [number, number] {
    if (stores.length === 0) return [0, 0];

    const sum = stores.reduce(
        (acc, store) => ({
            lng: acc.lng + store.location.lng,
            lat: acc.lat + store.location.lat,
        }),
        { lng: 0, lat: 0 }
    );

    return [sum.lng / stores.length, sum.lat / stores.length];
}

export function filterFlowsByViewport(
    flows: SupplyFlow[],
    bounds: { north: number; south: number; east: number; west: number }
): SupplyFlow[] {
    return flows.filter(flow => {
        const [fromLng, fromLat] = flow.from.coordinates;
        const [toLng, toLat] = flow.to.coordinates;

        const fromInBounds =
            fromLat >= bounds.south &&
            fromLat <= bounds.north &&
            fromLng >= bounds.west &&
            fromLng <= bounds.east;

        const toInBounds =
            toLat >= bounds.south &&
            toLat <= bounds.north &&
            toLng >= bounds.west &&
            toLng <= bounds.east;

        return fromInBounds || toInBounds;
    });
}
