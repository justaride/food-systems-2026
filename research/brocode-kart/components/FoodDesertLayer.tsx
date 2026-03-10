"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useFoodSystems } from '@/contexts/FoodSystemsContext';
import { FOOD_DESERT_RADIUS_KM, getStoresInViewport } from '@/lib/food-systems/desert-analysis';
import type { Store } from '@/lib/food-systems/types';

interface FoodDesertLayerProps {
    map: L.Map | null;
    stores: Store[];
}

interface ViewportBounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

function getViewportBounds(map: L.Map, padding: number = 0.5): ViewportBounds {
    const bounds = map.getBounds();
    return {
        north: bounds.getNorth() + padding,
        south: bounds.getSouth() - padding,
        east: bounds.getEast() + padding,
        west: bounds.getWest() - padding,
    };
}

export default function FoodDesertLayer({ map, stores }: FoodDesertLayerProps) {
    const { activeLayers } = useFoodSystems();
    const layerGroupRef = useRef<L.LayerGroup | null>(null);
    const isActive = activeLayers.includes('food-desert');

    useEffect(() => {
        if (!map) return;

        if (!layerGroupRef.current) {
            layerGroupRef.current = L.layerGroup();
        }

        const layerGroup = layerGroupRef.current;

        if (!isActive) {
            layerGroup.clearLayers();
            map.removeLayer(layerGroup);
            return;
        }

        layerGroup.addTo(map);

        const updateCircles = () => {
            layerGroup.clearLayers();

            if (!stores.length) return;

            const viewportBounds = getViewportBounds(map);
            const visibleStores = getStoresInViewport(stores, viewportBounds);
            const radiusMeters = FOOD_DESERT_RADIUS_KM * 1000;

            visibleStores.forEach(store => {
                const circle = L.circle([store.location.lat, store.location.lng], {
                    radius: radiusMeters,
                    fillColor: '#22C55E',
                    fillOpacity: 0.15,
                    color: '#16A34A',
                    weight: 1,
                    opacity: 0.4,
                });

                circle.bindTooltip(`${store.name} - ${FOOD_DESERT_RADIUS_KM}km coverage`, {
                    permanent: false,
                    direction: 'top',
                });

                circle.addTo(layerGroup);
            });
        };

        updateCircles();

        let debounceTimer: ReturnType<typeof setTimeout>;
        const debouncedUpdate = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(updateCircles, 200);
        };

        map.on('moveend', debouncedUpdate);
        map.on('zoomend', debouncedUpdate);

        return () => {
            clearTimeout(debounceTimer);
            map.off('moveend', debouncedUpdate);
            map.off('zoomend', debouncedUpdate);
            layerGroup.clearLayers();
            map.removeLayer(layerGroup);
        };
    }, [map, stores, isActive]);

    return null;
}
