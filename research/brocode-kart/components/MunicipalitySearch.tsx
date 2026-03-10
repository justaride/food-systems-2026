"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useFoodSystems } from '@/contexts/FoodSystemsContext';
import type { Municipality } from '@/lib/food-systems/types';

interface MunicipalitySearchProps {
    onSelectMunicipality?: (code: string, bounds?: [[number, number], [number, number]]) => void;
}

function fuzzyMatch(text: string, query: string): { match: boolean; score: number } {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    if (lowerText === lowerQuery) {
        return { match: true, score: 100 };
    }

    if (lowerText.startsWith(lowerQuery)) {
        return { match: true, score: 90 };
    }

    if (lowerText.includes(lowerQuery)) {
        return { match: true, score: 70 };
    }

    let queryIdx = 0;
    let consecutiveMatches = 0;
    let maxConsecutive = 0;

    for (let i = 0; i < lowerText.length && queryIdx < lowerQuery.length; i++) {
        if (lowerText[i] === lowerQuery[queryIdx]) {
            queryIdx++;
            consecutiveMatches++;
            maxConsecutive = Math.max(maxConsecutive, consecutiveMatches);
        } else {
            consecutiveMatches = 0;
        }
    }

    if (queryIdx === lowerQuery.length) {
        const score = 30 + (maxConsecutive / lowerQuery.length) * 30;
        return { match: true, score };
    }

    return { match: false, score: 0 };
}

export default function MunicipalitySearch({ onSelectMunicipality }: MunicipalitySearchProps) {
    const pathname = usePathname() ?? "/en";
    const isNorwegian = pathname.split("/")[1] === "no";
    const t = (en: string, no: string) => (isNorwegian ? no : en);

    const { setSelectedMunicipality, setIsPanelOpen, municipalities, setZoomToBounds, geojson } = useFoodSystems();

    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const listboxId = "municipality-search-listbox";

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 150);
        return () => clearTimeout(timer);
    }, [query]);

    const suggestions = useMemo(() => {
        if (!debouncedQuery.trim() || !municipalities) {
            return [];
        }

        const results: { municipality: Municipality; score: number }[] = [];

        Object.values(municipalities).forEach((muni) => {
            const { match, score } = fuzzyMatch(muni.name, debouncedQuery);
            if (match) {
                results.push({ municipality: muni, score });
            }
        });

        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(r => r.municipality);
    }, [debouncedQuery, municipalities]);

    const getMunicipalityBounds = useCallback((code: string): [[number, number], [number, number]] | undefined => {
        const geojsonFeatures = geojson?.features ?? [];
        const feature = geojsonFeatures.find(f => f.properties?.kommunenummer === code);
        if (!feature || !feature.geometry) return undefined;

        let minLat = Infinity, maxLat = -Infinity;
        let minLng = Infinity, maxLng = -Infinity;

        const processCoords = (coords: number[] | number[][] | number[][][] | number[][][][]) => {
            if (typeof coords[0] === 'number') {
                const [lng, lat] = coords as number[];
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
                minLng = Math.min(minLng, lng);
                maxLng = Math.max(maxLng, lng);
            } else {
                (coords as (number[] | number[][] | number[][][] | number[][][][])[]).forEach(c => processCoords(c as number[] | number[][] | number[][][] | number[][][][]));
            }
        };

        if (feature.geometry.type === 'Polygon') {
            processCoords(feature.geometry.coordinates);
        } else if (feature.geometry.type === 'MultiPolygon') {
            processCoords(feature.geometry.coordinates);
        }

        if (minLat === Infinity) return undefined;

        return [[minLat, minLng], [maxLat, maxLng]];
    }, [geojson]);

    const handleSelect = useCallback((municipality: Municipality) => {
        setQuery('');
        setIsOpen(false);
        setHighlightedIndex(-1);

        const bounds = getMunicipalityBounds(municipality.code);

        setSelectedMunicipality(municipality.code);
        setIsPanelOpen(true);

        if (bounds) {
            setZoomToBounds(bounds);
        }

        if (onSelectMunicipality) {
            onSelectMunicipality(municipality.code, bounds);
        }
    }, [setSelectedMunicipality, setIsPanelOpen, getMunicipalityBounds, setZoomToBounds, onSelectMunicipality]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isOpen && suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setIsOpen(true);
                setHighlightedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                    handleSelect(suggestions[highlightedIndex]);
                } else if (suggestions.length === 1) {
                    handleSelect(suggestions[0]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setHighlightedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    }, [isOpen, suggestions, highlightedIndex, handleSelect]);

    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const item = listRef.current.children[highlightedIndex] as HTMLElement;
            item?.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightedIndex]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full sm:max-w-md">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        setHighlightedIndex(-1);
                    }}
                    onFocus={() => {
                        if (query.trim()) {
                            setIsOpen(true);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={t("Search municipalities...", "Sok kommuner...")}
                    className="w-full px-4 py-2.5 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    aria-label={t("Search municipalities", "Sok kommuner")}
                    aria-expanded={isOpen && suggestions.length > 0}
                    aria-controls={listboxId}
                    aria-activedescendant={
                        highlightedIndex >= 0 && suggestions[highlightedIndex]
                            ? `municipality-option-${suggestions[highlightedIndex].code}`
                            : undefined
                    }
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                    role="combobox"
                />
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setIsOpen(false);
                            inputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded transition-colors"
                        aria-label={t("Clear search", "Tøm søk")}
                    >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <ul
                    ref={listRef}
                    id={listboxId}
                    className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-72 overflow-y-auto"
                    role="listbox"
                >
                    {suggestions.map((municipality, index) => (
                        <li
                            key={municipality.code}
                            id={`municipality-option-${municipality.code}`}
                            onClick={() => handleSelect(municipality)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            className={`px-4 py-3 cursor-pointer transition-colors ${
                                index === highlightedIndex
                                    ? 'bg-emerald-600 text-white'
                                    : 'hover:bg-gray-700 text-gray-100'
                            }`}
                            role="option"
                            aria-selected={index === highlightedIndex}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{municipality.name}</span>
                                <span className={`text-sm ${
                                    index === highlightedIndex ? 'text-emerald-100' : 'text-gray-400'
                                }`}>
                                    {municipality.population?.toLocaleString() ?? 'N/A'} {t("pop.", "innb.")}
                                </span>
                            </div>
                            <div className={`text-xs mt-0.5 ${
                                index === highlightedIndex ? 'text-emerald-200' : 'text-gray-500'
                            }`}>
                                {t("Code", "Kode")}: {municipality.code}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {isOpen && query.trim() && suggestions.length === 0 && debouncedQuery === query && (
                <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 text-gray-400 text-center">
                    {t("No municipalities found", "Ingen kommuner funnet")}
                </div>
            )}
        </div>
    );
}
