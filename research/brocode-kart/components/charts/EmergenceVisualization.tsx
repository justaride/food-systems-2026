'use client';

import { useState, useEffect, useCallback } from 'react';

interface EmergenceVisualizationProps {
    isNorwegian?: boolean;
}

interface Agent {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    velocityX: number;
    velocityY: number;
}

const COLORS = {
    norgesgruppen: '#22c55e',
    coop: '#f97316',
    reitangruppen: '#3b82f6',
};

export default function EmergenceVisualization({ isNorwegian = false }: EmergenceVisualizationProps) {
    const t = <T,>(en: T, no: T): T => (isNorwegian ? no : en);
    const [isRunning, setIsRunning] = useState(false);
    const [generation, setGeneration] = useState(0);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [marketShares, setMarketShares] = useState({ ng: 33, coop: 33, reitan: 34 });

    const initAgents = useCallback(() => {
        const newAgents: Agent[] = [];
        const groups = [
            { color: COLORS.norgesgruppen, count: 15 },
            { color: COLORS.coop, count: 12 },
            { color: COLORS.reitangruppen, count: 8 },
        ];

        let id = 0;
        groups.forEach(group => {
            for (let i = 0; i < group.count; i++) {
                newAgents.push({
                    id: id++,
                    x: 50 + Math.random() * 300,
                    y: 30 + Math.random() * 140,
                    size: 4 + Math.random() * 6,
                    color: group.color,
                    velocityX: (Math.random() - 0.5) * 2,
                    velocityY: (Math.random() - 0.5) * 2,
                });
            }
        });
        return newAgents;
    }, []);

    useEffect(() => {
        setAgents(initAgents());
    }, [initAgents]);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            setGeneration(g => g + 1);

            setAgents(prevAgents => {
                return prevAgents.map(agent => {
                    let newX = agent.x + agent.velocityX;
                    let newY = agent.y + agent.velocityY;
                    let newVX = agent.velocityX;
                    let newVY = agent.velocityY;

                    // Boundary bounce
                    if (newX < 10 || newX > 390) {
                        newVX = -newVX * 0.9;
                        newX = Math.max(10, Math.min(390, newX));
                    }
                    if (newY < 10 || newY > 190) {
                        newVY = -newVY * 0.9;
                        newY = Math.max(10, Math.min(190, newY));
                    }

                    // Rule: agents cluster with same color (simple attraction)
                    prevAgents.forEach(other => {
                        if (other.id !== agent.id && other.color === agent.color) {
                            const dx = other.x - agent.x;
                            const dy = other.y - agent.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist > 10 && dist < 80) {
                                newVX += (dx / dist) * 0.05;
                                newVY += (dy / dist) * 0.05;
                            }
                        }
                    });

                    // Rule: slight repulsion from different colors
                    prevAgents.forEach(other => {
                        if (other.id !== agent.id && other.color !== agent.color) {
                            const dx = other.x - agent.x;
                            const dy = other.y - agent.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < 30) {
                                newVX -= (dx / dist) * 0.03;
                                newVY -= (dy / dist) * 0.03;
                            }
                        }
                    });

                    // Damping
                    newVX *= 0.98;
                    newVY *= 0.98;

                    // Grow slightly based on cluster size
                    const sameColorNearby = prevAgents.filter(
                        other => other.color === agent.color &&
                            Math.sqrt((other.x - agent.x) ** 2 + (other.y - agent.y) ** 2) < 50
                    ).length;
                    const newSize = Math.min(15, agent.size + (sameColorNearby > 3 ? 0.02 : -0.01));

                    return {
                        ...agent,
                        x: newX,
                        y: newY,
                        velocityX: newVX,
                        velocityY: newVY,
                        size: Math.max(3, newSize),
                    };
                });
            });

            // Update market shares based on agent sizes
            setAgents(prevAgents => {
                const totalSize = prevAgents.reduce((sum, a) => sum + a.size, 0);
                const ngSize = prevAgents.filter(a => a.color === COLORS.norgesgruppen).reduce((sum, a) => sum + a.size, 0);
                const coopSize = prevAgents.filter(a => a.color === COLORS.coop).reduce((sum, a) => sum + a.size, 0);
                const reitanSize = prevAgents.filter(a => a.color === COLORS.reitangruppen).reduce((sum, a) => sum + a.size, 0);

                setMarketShares({
                    ng: Math.round((ngSize / totalSize) * 100),
                    coop: Math.round((coopSize / totalSize) * 100),
                    reitan: Math.round((reitanSize / totalSize) * 100),
                });

                return prevAgents;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [isRunning]);

    const handleReset = () => {
        setIsRunning(false);
        setGeneration(0);
        setAgents(initAgents());
        setMarketShares({ ng: 33, coop: 33, reitan: 34 });
    };

    return (
        <div className="bg-gray-900/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            isRunning
                                ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                                : 'bg-green-500/20 text-green-400 border border-green-500/50'
                        }`}
                    >
                        {isRunning ? t('Pause', 'Pause') : t('Start', 'Start')}
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600/50"
                    >
                        {t('Reset', 'Nullstill')}
                    </button>
                    <span className="text-gray-400 text-sm">
                        {t('Generation', 'Generasjon')}: {generation}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.norgesgruppen }} />
                        <span className="text-gray-300">{marketShares.ng}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.coop }} />
                        <span className="text-gray-300">{marketShares.coop}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.reitangruppen }} />
                        <span className="text-gray-300">{marketShares.reitan}%</span>
                    </div>
                </div>
            </div>

            <svg
                viewBox="0 0 400 200"
                className="w-full h-auto bg-gray-950/50 rounded-lg border border-gray-700/50"
                role="img"
                aria-label={t(
                    'Agent-based emergence simulation showing how simple rules create market concentration',
                    'Agent-basert fremvekstsimulering som viser hvordan enkle regler skaper markedskonsentrasjon'
                )}
            >
                {agents.map(agent => (
                    <circle
                        key={agent.id}
                        cx={agent.x}
                        cy={agent.y}
                        r={agent.size}
                        fill={agent.color}
                        opacity={0.8}
                        className="transition-all duration-75"
                    />
                ))}
            </svg>

            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-800/50 rounded p-2 text-center">
                    <div className="text-amber-400 font-semibold">{t('Rule 1', 'Regel 1')}</div>
                    <div className="text-gray-400">{t('Cluster with same', 'Klynge med like')}</div>
                </div>
                <div className="bg-gray-800/50 rounded p-2 text-center">
                    <div className="text-amber-400 font-semibold">{t('Rule 2', 'Regel 2')}</div>
                    <div className="text-gray-400">{t('Repel different', 'Frastøt ulike')}</div>
                </div>
                <div className="bg-gray-800/50 rounded p-2 text-center">
                    <div className="text-amber-400 font-semibold">{t('Rule 3', 'Regel 3')}</div>
                    <div className="text-gray-400">{t('Grow in clusters', 'Voks i klynger')}</div>
                </div>
            </div>

            <p className="text-center text-gray-500 text-xs mt-3">
                {t(
                    'Watch: Simple local rules → emergent clustering → concentration. No central coordination needed.',
                    'Se: Enkle lokale regler → fremvoksende klynger → konsentrasjon. Ingen sentral koordinering nødvendig.'
                )}
            </p>
        </div>
    );
}
