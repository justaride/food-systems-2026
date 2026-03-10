import buffer from '@turf/buffer';
import area from '@turf/area';
import union from '@turf/union';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, featureCollection } from '@turf/helpers';
import type { Feature, Polygon, MultiPolygon, FeatureCollection } from 'geojson';
import type { Store, Municipality } from './types';

export interface CoverageAnalysis {
    coveredArea: number;
    uncoveredArea: number;
    affectedMunicipalities: string[];
    coveragePercent: number;
}

export interface MunicipalityCoverage {
    code: string;
    totalArea: number;
    coveredArea: number;
    coveragePercent: number;
    nearestStoreDistance?: number;
}

export const FOOD_DESERT_RADIUS_KM = 5;

export function createStoreBuffers(
    stores: Store[],
    radiusKm: number = FOOD_DESERT_RADIUS_KM
): Feature<Polygon | MultiPolygon>[] {
    return stores
        .map(store => {
            try {
                const storePoint = point([store.location.lng, store.location.lat]);
                const buffered = buffer(storePoint, radiusKm, { units: 'kilometers' });
                return buffered as Feature<Polygon | MultiPolygon>;
            } catch {
                return null;
            }
        })
        .filter((b): b is Feature<Polygon | MultiPolygon> => b !== null);
}

export function calculateCoverageAnalysis(
    stores: Store[],
    municipalities: Record<string, Municipality>,
    geojson: FeatureCollection
): CoverageAnalysis {
    if (stores.length === 0) {
        const totalArea = Object.values(municipalities).reduce((sum, m) => sum + (m.area || 0), 0);
        return {
            coveredArea: 0,
            uncoveredArea: totalArea,
            affectedMunicipalities: Object.keys(municipalities),
            coveragePercent: 0,
        };
    }

    const storeBuffers = createStoreBuffers(stores);

    let mergedCoverage: Feature<Polygon | MultiPolygon> | null = null;
    for (const buf of storeBuffers) {
        if (!mergedCoverage) {
            mergedCoverage = buf;
        } else {
            try {
                const merged = union(featureCollection([mergedCoverage, buf]));
                if (merged) {
                    mergedCoverage = merged as Feature<Polygon | MultiPolygon>;
                }
            } catch {
                continue;
            }
        }
    }

    const totalNorwayArea = Object.values(municipalities).reduce((sum, m) => sum + (m.area || 0), 0);

    let coveredAreaKm2 = 0;
    if (mergedCoverage) {
        coveredAreaKm2 = area(mergedCoverage) / 1_000_000;
    }

    const affectedMunicipalities: string[] = [];

    for (const feature of geojson.features) {
        const code = feature.properties?.kommunenummer;
        if (!code || !municipalities[code]) continue;

        const muniStores = stores.filter(store => {
            try {
                const storePoint = point([store.location.lng, store.location.lat]);
                return booleanPointInPolygon(
                    storePoint,
                    feature as Feature<Polygon | MultiPolygon>
                );
            } catch {
                return false;
            }
        });

        if (muniStores.length === 0) {
            affectedMunicipalities.push(code);
        }
    }

    const uncoveredArea = Math.max(0, totalNorwayArea - coveredAreaKm2);
    const coveragePercent = totalNorwayArea > 0
        ? Math.min(100, (coveredAreaKm2 / totalNorwayArea) * 100)
        : 0;

    return {
        coveredArea: Math.round(coveredAreaKm2),
        uncoveredArea: Math.round(uncoveredArea),
        affectedMunicipalities,
        coveragePercent: Math.round(coveragePercent * 10) / 10,
    };
}

export function calculateMunicipalityCoverage(
    municipalityCode: string,
    stores: Store[],
    municipalities: Record<string, Municipality>,
    geojson: FeatureCollection
): MunicipalityCoverage | null {
    const municipality = municipalities[municipalityCode];
    if (!municipality) return null;

    const feature = geojson.features.find(
        f => f.properties?.kommunenummer === municipalityCode
    );
    if (!feature) return null;

    const muniStores = stores.filter(store => {
        try {
            const storePoint = point([store.location.lng, store.location.lat]);
            return booleanPointInPolygon(
                storePoint,
                feature as Feature<Polygon | MultiPolygon>
            );
        } catch {
            return false;
        }
    });

    const totalArea = municipality.area || 0;

    if (muniStores.length === 0) {
        return {
            code: municipalityCode,
            totalArea,
            coveredArea: 0,
            coveragePercent: 0,
        };
    }

    const storeBuffers = createStoreBuffers(muniStores);

    let coveredAreaKm2 = 0;
    for (const buf of storeBuffers) {
        coveredAreaKm2 += area(buf) / 1_000_000;
    }

    coveredAreaKm2 = Math.min(coveredAreaKm2, totalArea);

    const coveragePercent = totalArea > 0
        ? Math.min(100, (coveredAreaKm2 / totalArea) * 100)
        : 0;

    return {
        code: municipalityCode,
        totalArea,
        coveredArea: Math.round(coveredAreaKm2),
        coveragePercent: Math.round(coveragePercent * 10) / 10,
    };
}

export function getStoresInViewport(
    stores: Store[],
    bounds: { north: number; south: number; east: number; west: number }
): Store[] {
    return stores.filter(store => {
        const { lat, lng } = store.location;
        return (
            lat >= bounds.south &&
            lat <= bounds.north &&
            lng >= bounds.west &&
            lng <= bounds.east
        );
    });
}
