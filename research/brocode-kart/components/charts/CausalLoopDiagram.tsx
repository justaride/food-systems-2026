'use client';

interface CausalLoopDiagramProps {
    isNorwegian?: boolean;
}

export default function CausalLoopDiagram({ isNorwegian = false }: CausalLoopDiagramProps) {
    const t = <T,>(en: T, no: T): T => (isNorwegian ? no : en);

    return (
        <div className="bg-gray-900/60 rounded-xl p-4">
            <svg
                viewBox="0 0 600 400"
                className="w-full h-auto"
                role="img"
                aria-label={t(
                    'Causal loop diagram showing reinforcing and balancing feedback loops in the Norwegian grocery market',
                    'Årsaksløkkediagram som viser forsterkende og balanserende tilbakekoblingsløkker i det norske dagligvaremarkedet'
                )}
            >
                <defs>
                    <marker
                        id="arrowRed"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                        markerUnits="strokeWidth"
                    >
                        <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
                    </marker>
                    <marker
                        id="arrowBlue"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                        markerUnits="strokeWidth"
                    >
                        <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
                    </marker>
                    <marker
                        id="arrowGray"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                        markerUnits="strokeWidth"
                    >
                        <path d="M0,0 L0,6 L9,3 z" fill="#6b7280" />
                    </marker>
                </defs>

                {/* R1: Scale Reinforcing Loop - Left side */}
                <g className="r1-loop">
                    {/* Loop label */}
                    <circle cx="120" cy="180" r="20" fill="#ef444420" stroke="#ef4444" strokeWidth="2" />
                    <text x="120" y="185" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold">R1</text>

                    {/* Nodes */}
                    <rect x="40" y="60" width="100" height="36" rx="6" fill="#1f2937" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="90" y="83" textAnchor="middle" fill="#f9fafb" fontSize="11">
                        {t('Market Share', 'Markedsandel')}
                    </text>

                    <rect x="160" y="120" width="100" height="36" rx="6" fill="#1f2937" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="210" y="143" textAnchor="middle" fill="#f9fafb" fontSize="11">
                        {t('Buyer Power', 'Kjøpsmakt')}
                    </text>

                    <rect x="160" y="220" width="100" height="36" rx="6" fill="#1f2937" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="210" y="243" textAnchor="middle" fill="#f9fafb" fontSize="11">
                        {t('Better Terms', 'Bedre vilkår')}
                    </text>

                    <rect x="40" y="280" width="100" height="36" rx="6" fill="#1f2937" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="90" y="303" textAnchor="middle" fill="#f9fafb" fontSize="11">
                        {t('Lower Prices', 'Lavere priser')}
                    </text>

                    {/* Arrows */}
                    <path d="M140 78 Q170 78 170 110" fill="none" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)" />
                    <text x="165" y="88" fill="#22c55e" fontSize="10" fontWeight="bold">+</text>

                    <path d="M210 156 L210 210" fill="none" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)" />
                    <text x="220" y="185" fill="#22c55e" fontSize="10" fontWeight="bold">+</text>

                    <path d="M160 238 Q90 238 90 270" fill="none" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)" />
                    <text x="115" y="248" fill="#22c55e" fontSize="10" fontWeight="bold">+</text>

                    <path d="M90 280 Q90 180 90 106" fill="none" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)" />
                    <text x="75" y="200" fill="#22c55e" fontSize="10" fontWeight="bold">+</text>
                </g>

                {/* R2: EMV Dependency Loop - Right side */}
                <g className="r2-loop">
                    {/* Loop label */}
                    <circle cx="480" cy="180" r="20" fill="#ef444420" stroke="#ef4444" strokeWidth="2" />
                    <text x="480" y="185" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold">R2</text>

                    {/* Nodes */}
                    <rect x="380" y="60" width="120" height="36" rx="6" fill="#1f2937" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="440" y="83" textAnchor="middle" fill="#f9fafb" fontSize="11">
                        {t('Shelf Control', 'Hyllekontroll')}
                    </text>

                    <rect x="380" y="140" width="120" height="36" rx="6" fill="#1f2937" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="440" y="163" textAnchor="middle" fill="#f9fafb" fontSize="11">
                        {t('EMV Pressure', 'EMV-press')}
                    </text>

                    <rect x="380" y="220" width="120" height="36" rx="6" fill="#1f2937" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="440" y="243" textAnchor="middle" fill="#f9fafb" fontSize="11">
                        {t('Brand Erosion', 'Merkevare-erosjon')}
                    </text>

                    <rect x="380" y="300" width="120" height="36" rx="6" fill="#1f2937" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="440" y="323" textAnchor="middle" fill="#f9fafb" fontSize="11">
                        {t('EMV Expansion', 'EMV-ekspansjon')}
                    </text>

                    {/* Arrows */}
                    <path d="M440 96 L440 130" fill="none" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)" />
                    <text x="450" y="115" fill="#22c55e" fontSize="10" fontWeight="bold">+</text>

                    <path d="M440 176 L440 210" fill="none" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)" />
                    <text x="450" y="195" fill="#22c55e" fontSize="10" fontWeight="bold">+</text>

                    <path d="M440 256 L440 290" fill="none" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)" />
                    <text x="450" y="275" fill="#22c55e" fontSize="10" fontWeight="bold">+</text>

                    <path d="M500 318 Q560 318 560 78 Q560 60 510 60" fill="none" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)" />
                    <text x="568" y="190" fill="#22c55e" fontSize="10" fontWeight="bold">+</text>
                </g>

                {/* B1: Broken Balancing Loop - Bottom center */}
                <g className="b1-loop">
                    {/* Loop label */}
                    <circle cx="300" cy="350" r="20" fill="#3b82f620" stroke="#3b82f6" strokeWidth="2" />
                    <text x="300" y="355" textAnchor="middle" fill="#3b82f6" fontSize="14" fontWeight="bold">B1</text>

                    {/* Connection showing broken loop */}
                    <rect x="265" y="370" width="70" height="24" rx="4" fill="#1f2937" stroke="#6b7280" strokeWidth="1" strokeDasharray="4 2" />
                    <text x="300" y="386" textAnchor="middle" fill="#6b7280" fontSize="9">
                        {t('BLOCKED', 'BLOKKERT')}
                    </text>

                    {/* X mark showing broken */}
                    <line x1="285" y1="330" x2="315" y2="360" stroke="#ef4444" strokeWidth="3" />
                    <line x1="315" y1="330" x2="285" y2="360" stroke="#ef4444" strokeWidth="3" />
                </g>

                {/* Legend */}
                <g className="legend" transform="translate(230, 10)">
                    <rect x="0" y="0" width="140" height="40" rx="4" fill="#1f293780" />
                    <circle cx="15" cy="13" r="6" fill="#ef444440" stroke="#ef4444" strokeWidth="1" />
                    <text x="26" y="17" fill="#9ca3af" fontSize="10">R = {t('Reinforcing', 'Forsterkende')}</text>
                    <circle cx="15" cy="30" r="6" fill="#3b82f640" stroke="#3b82f6" strokeWidth="1" />
                    <text x="26" y="34" fill="#9ca3af" fontSize="10">B = {t('Balancing', 'Balanserende')}</text>
                </g>
            </svg>

            <p className="text-center text-gray-500 text-xs mt-2">
                {t(
                    'R1 and R2 reinforce concentration; B1 (new entrant competition) is blocked by infrastructure barriers',
                    'R1 og R2 forsterker konsentrasjon; B1 (konkurranse fra nyetablering) er blokkert av infrastrukturbarrierer'
                )}
            </p>
        </div>
    );
}
