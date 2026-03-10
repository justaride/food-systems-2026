"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import type { SupplyFlow } from '@/lib/food-systems/types';
import { FLOW_TYPE_COLORS } from '@/lib/food-systems/types';
import { filterFlowsByViewport } from '@/lib/food-systems/flow-utils';

interface FlowLayerProps {
    map: L.Map | null;
    flows: SupplyFlow[];
    isActive: boolean;
}

const ANIMATION_DURATION = 2000;
const DASH_LENGTH = 8;
const GAP_LENGTH = 12;

export default function FlowLayer({ map, flows, isActive }: FlowLayerProps) {
    const svgOverlayRef = useRef<HTMLDivElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const [visibleFlows, setVisibleFlows] = useState<SupplyFlow[]>([]);

    const updateVisibleFlows = useCallback(() => {
        if (!map || !isActive) {
            setVisibleFlows([]);
            return;
        }

        const bounds = map.getBounds();
        const viewportBounds = {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
        };

        const filtered = filterFlowsByViewport(flows, viewportBounds);
        setVisibleFlows(filtered.slice(0, 50));
    }, [map, flows, isActive]);

    useEffect(() => {
        if (!map) return;

        updateVisibleFlows();

        map.on('moveend', updateVisibleFlows);
        map.on('zoomend', updateVisibleFlows);

        return () => {
            map.off('moveend', updateVisibleFlows);
            map.off('zoomend', updateVisibleFlows);
        };
    }, [map, updateVisibleFlows]);

    useEffect(() => {
        if (!map || !isActive) {
            if (svgOverlayRef.current) {
                svgOverlayRef.current.remove();
                svgOverlayRef.current = null;
            }
            return;
        }

        const container = map.getContainer();
        let svgContainer = svgOverlayRef.current;

        if (!svgContainer) {
            svgContainer = document.createElement('div');
            svgContainer.className = 'flow-layer-container';
            svgContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 450;
            `;
            container.appendChild(svgContainer);
            svgOverlayRef.current = svgContainer;
        }

        const styleId = 'flow-animation-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                @keyframes flowDash {
                    from { stroke-dashoffset: ${DASH_LENGTH + GAP_LENGTH}; }
                    to { stroke-dashoffset: 0; }
                }
                .flow-path {
                    animation: flowDash ${ANIMATION_DURATION}ms linear infinite;
                }
            `;
            document.head.appendChild(style);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [map, isActive]);

    useEffect(() => {
        if (!map || !svgOverlayRef.current || !isActive) return;

        const renderFlows = () => {
            if (!svgOverlayRef.current) return;

            const size = map.getSize();
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', `${size.x}`);
            svg.setAttribute('height', `${size.y}`);
            svg.style.cssText = 'position: absolute; top: 0; left: 0;';

            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

            visibleFlows.forEach((flow, index) => {
                const markerId = `arrowhead-${index}`;
                const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
                marker.setAttribute('id', markerId);
                marker.setAttribute('markerWidth', '6');
                marker.setAttribute('markerHeight', '6');
                marker.setAttribute('refX', '5');
                marker.setAttribute('refY', '3');
                marker.setAttribute('orient', 'auto');
                marker.setAttribute('markerUnits', 'strokeWidth');

                const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                arrowPath.setAttribute('d', 'M0,0 L6,3 L0,6 Z');
                arrowPath.setAttribute('fill', FLOW_TYPE_COLORS[flow.type]);
                arrowPath.setAttribute('opacity', '0.8');

                marker.appendChild(arrowPath);
                defs.appendChild(marker);
            });

            svg.appendChild(defs);

            visibleFlows.forEach((flow, index) => {
                const fromPoint = map.latLngToContainerPoint([flow.from.coordinates[1], flow.from.coordinates[0]]);
                const toPoint = map.latLngToContainerPoint([flow.to.coordinates[1], flow.to.coordinates[0]]);

                const dx = toPoint.x - fromPoint.x;
                const dy = toPoint.y - fromPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 20) return;

                const midX = fromPoint.x + dx * 0.5;
                const midY = fromPoint.y + dy * 0.5;

                const perpX = -dy / distance;
                const perpY = dx / distance;
                const curveOffset = Math.min(distance * 0.15, 30);

                const controlX = midX + perpX * curveOffset;
                const controlY = midY + perpY * curveOffset;

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const pathData = `M ${fromPoint.x} ${fromPoint.y} Q ${controlX} ${controlY} ${toPoint.x} ${toPoint.y}`;
                path.setAttribute('d', pathData);

                const strokeWidth = Math.max(1, Math.min(flow.volume * 0.5, 4));
                path.setAttribute('stroke', FLOW_TYPE_COLORS[flow.type]);
                path.setAttribute('stroke-width', `${strokeWidth}`);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke-linecap', 'round');
                path.setAttribute('stroke-dasharray', `${DASH_LENGTH} ${GAP_LENGTH}`);
                path.setAttribute('opacity', '0.7');
                path.setAttribute('marker-end', `url(#arrowhead-${index})`);
                path.classList.add('flow-path');

                svg.appendChild(path);
            });

            svgOverlayRef.current.innerHTML = '';
            svgOverlayRef.current.appendChild(svg);
        };

        renderFlows();

        const handleMapMove = () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            animationFrameRef.current = requestAnimationFrame(renderFlows);
        };

        map.on('move', handleMapMove);
        map.on('zoom', handleMapMove);

        return () => {
            map.off('move', handleMapMove);
            map.off('zoom', handleMapMove);
        };
    }, [map, visibleFlows, isActive]);

    useEffect(() => {
        return () => {
            if (svgOverlayRef.current) {
                svgOverlayRef.current.remove();
                svgOverlayRef.current = null;
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return null;
}
