import type { Store, Municipality } from './types';
import { CHAIN_CONFIGS } from './types';

/**
 * Pattern Analysis Functions for Food Systems
 * Tests hypotheses from the systems-thinking synthesis
 */

// ============================================================================
// H1: ZIPF DISTRIBUTION ANALYSIS
// ============================================================================

export interface ZipfAnalysis {
    data: Array<{ rank: number; storeCount: number; logRank: number; logCount: number; municipalityName: string }>;
    slope: number;
    intercept: number;
    rSquared: number;
    isZipf: boolean; // R² > 0.7 and slope close to -1
}

/**
 * Analyze if store distribution follows Zipf's Law
 * Zipf's Law: P(x) ∝ x^(-α), where α ≈ 1
 *
 * Test: Plot log(rank) vs log(store count)
 * If linear with slope ≈ -1, distribution follows Zipf
 */
export function analyzeZipfDistribution(
    municipalities: Record<string, Municipality>
): ZipfAnalysis {
    // Get municipalities with stores, sorted by store count descending
    const muniArray = Object.values(municipalities)
        .filter(m => m.metrics && m.metrics.storeCount > 0)
        .sort((a, b) => (b.metrics?.storeCount || 0) - (a.metrics?.storeCount || 0));

    // Create rank-size data
    const data = muniArray.map((m, index) => ({
        rank: index + 1,
        storeCount: m.metrics?.storeCount || 0,
        logRank: Math.log10(index + 1),
        logCount: Math.log10(m.metrics?.storeCount || 1),
        municipalityName: m.name,
    }));

    // Linear regression on log-log data
    const { slope, intercept, rSquared } = linearRegression(
        data.map(d => d.logRank),
        data.map(d => d.logCount)
    );

    return {
        data,
        slope,
        intercept,
        rSquared,
        isZipf: rSquared > 0.7 && slope < -0.5 && slope > -1.5,
    };
}

// ============================================================================
// H2 & H3: CONCENTRATION ANALYSIS
// ============================================================================

export interface ConcentrationAnalysis {
    national: {
        byChain: Array<{ chain: string; count: number; share: number }>;
        byParent: Array<{ parent: string; count: number; share: number }>;
        chainHHI: number;
        parentHHI: number;
        top3Share: number;
    };
    giniCoefficient: number;
    lorenzCurve: Array<{ cumulativePopShare: number; cumulativeStoreShare: number }>;
}

/**
 * Calculate Gini coefficient for market concentration
 * 0 = perfect equality, 1 = perfect inequality
 */
export function calculateGiniCoefficient(stores: Store[]): number {
    if (stores.length === 0) return 0;

    // Count stores by chain
    const chainCounts = new Map<string, number>();
    for (const store of stores) {
        chainCounts.set(store.chain, (chainCounts.get(store.chain) || 0) + 1);
    }

    // Sort by count
    const counts = Array.from(chainCounts.values()).sort((a, b) => a - b);
    const n = counts.length;
    const total = counts.reduce((sum, c) => sum + c, 0);

    // Calculate Gini
    let sumOfDifferences = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            sumOfDifferences += Math.abs(counts[i] - counts[j]);
        }
    }

    return sumOfDifferences / (2 * n * total);
}

/**
 * Calculate Lorenz curve data for visualization
 */
export function calculateLorenzCurve(
    municipalities: Record<string, Municipality>
): Array<{ cumulativePopShare: number; cumulativeStoreShare: number }> {
    const muniArray = Object.values(municipalities)
        .filter(m => m.population > 0)
        .sort((a, b) => {
            const densityA = (a.metrics?.storeCount || 0) / a.population;
            const densityB = (b.metrics?.storeCount || 0) / b.population;
            return densityA - densityB;
        });

    const totalPop = muniArray.reduce((sum, m) => sum + m.population, 0);
    const totalStores = muniArray.reduce((sum, m) => sum + (m.metrics?.storeCount || 0), 0);

    let cumulativePop = 0;
    let cumulativeStores = 0;

    const curve = [{ cumulativePopShare: 0, cumulativeStoreShare: 0 }];

    for (const m of muniArray) {
        cumulativePop += m.population;
        cumulativeStores += m.metrics?.storeCount || 0;
        curve.push({
            cumulativePopShare: cumulativePop / totalPop,
            cumulativeStoreShare: cumulativeStores / totalStores,
        });
    }

    return curve;
}

/**
 * Full concentration analysis
 */
export function analyzeConcentration(
    stores: Store[],
    municipalities: Record<string, Municipality>
): ConcentrationAnalysis {
    // By chain
    const chainCounts = new Map<string, number>();
    for (const store of stores) {
        chainCounts.set(store.chain, (chainCounts.get(store.chain) || 0) + 1);
    }

    const byChain = Array.from(chainCounts.entries())
        .map(([chain, count]) => ({
            chain,
            count,
            share: (count / stores.length) * 100,
        }))
        .sort((a, b) => b.count - a.count);

    // By parent company
    const parentCounts = new Map<string, number>();
    for (const store of stores) {
        const config = CHAIN_CONFIGS[store.chainId as keyof typeof CHAIN_CONFIGS];
        const parent = config?.parent || 'Unknown';
        parentCounts.set(parent, (parentCounts.get(parent) || 0) + 1);
    }

    const byParent = Array.from(parentCounts.entries())
        .map(([parent, count]) => ({
            parent,
            count,
            share: (count / stores.length) * 100,
        }))
        .sort((a, b) => b.count - a.count);

    // HHI calculations
    const chainHHI = byChain.reduce((sum, c) => sum + c.share * c.share, 0);
    const parentHHI = byParent.reduce((sum, p) => sum + p.share * p.share, 0);

    // Top 3 parent share
    const top3Share = byParent.slice(0, 3).reduce((sum, p) => sum + p.share, 0);

    return {
        national: {
            byChain,
            byParent,
            chainHHI: Math.round(chainHHI),
            parentHHI: Math.round(parentHHI),
            top3Share: Math.round(top3Share * 10) / 10,
        },
        giniCoefficient: calculateGiniCoefficient(stores),
        lorenzCurve: calculateLorenzCurve(municipalities),
    };
}

// ============================================================================
// DEMOGRAPHIC CORRELATIONS
// ============================================================================

export interface CorrelationResult {
    variable: string;
    correlation: number;
    pValue: number;
    significant: boolean;
    n: number;
}

export interface DemographicCorrelations {
    hhiVsIncome: CorrelationResult;
    hhiVsAge65: CorrelationResult;
    hhiVsPopulation: CorrelationResult;
    densityVsIncome: CorrelationResult;
    densityVsArea: CorrelationResult;
}

/**
 * Calculate Pearson correlation coefficient
 */
export function pearsonCorrelation(x: number[], y: number[]): { r: number; n: number } {
    const n = Math.min(x.length, y.length);
    if (n < 3) return { r: 0, n };

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        numerator += dx * dy;
        denomX += dx * dx;
        denomY += dy * dy;
    }

    const denominator = Math.sqrt(denomX * denomY);
    if (denominator === 0) return { r: 0, n };

    return { r: numerator / denominator, n };
}

/**
 * Approximate p-value for correlation (t-test)
 */
function correlationPValue(r: number, n: number): number {
    if (n < 3) return 1;
    const t = r * Math.sqrt((n - 2) / (1 - r * r));
    // Approximate p-value using normal approximation for large n
    const z = Math.abs(t);
    return 2 * (1 - normalCDF(z));
}

/**
 * Standard normal CDF approximation
 */
function normalCDF(z: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const sign = z < 0 ? -1 : 1;
    z = Math.abs(z) / Math.sqrt(2);
    const t = 1.0 / (1.0 + p * z);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
    return 0.5 * (1.0 + sign * y);
}

/**
 * Analyze demographic correlations
 */
export function analyzeDemographicCorrelations(
    municipalities: Record<string, Municipality>
): DemographicCorrelations {
    const muniArray = Object.values(municipalities).filter(m =>
        m.metrics && m.population > 0
    );

    const hhi = muniArray.map(m => m.metrics?.hhi || 0);
    const density = muniArray.map(m => m.metrics?.storesPerCapita || 0);
    const income = muniArray.map(m => m.medianIncome || 0);
    const age65 = muniArray.map(m => m.ageDistribution?.over65Pct || 0);
    const population = muniArray.map(m => m.population);
    const area = muniArray.map(m => m.area);

    const createResult = (name: string, x: number[], y: number[]): CorrelationResult => {
        const validIndices = x.map((v, i) => v > 0 && y[i] > 0 ? i : -1).filter(i => i >= 0);
        const xValid = validIndices.map(i => x[i]);
        const yValid = validIndices.map(i => y[i]);
        const { r, n } = pearsonCorrelation(xValid, yValid);
        const pValue = correlationPValue(r, n);
        return {
            variable: name,
            correlation: Math.round(r * 1000) / 1000,
            pValue: Math.round(pValue * 10000) / 10000,
            significant: pValue < 0.05,
            n,
        };
    };

    return {
        hhiVsIncome: createResult('HHI vs Median Income', hhi, income),
        hhiVsAge65: createResult('HHI vs Over 65%', hhi, age65),
        hhiVsPopulation: createResult('HHI vs Population', hhi, population),
        densityVsIncome: createResult('Density vs Median Income', density, income),
        densityVsArea: createResult('Density vs Area', density, area),
    };
}

// ============================================================================
// SUMMARY STATISTICS
// ============================================================================

export interface PatternAnalysisSummary {
    zipf: ZipfAnalysis;
    concentration: ConcentrationAnalysis;
    demographics: DemographicCorrelations;
    hypothesisResults: {
        id: string;
        hypothesis: string;
        result: 'supported' | 'not_supported' | 'inconclusive';
        evidence: string;
    }[];
}

/**
 * Run full pattern analysis
 */
export function runPatternAnalysis(
    stores: Store[],
    municipalities: Record<string, Municipality>
): PatternAnalysisSummary {
    const zipf = analyzeZipfDistribution(municipalities);
    const concentration = analyzeConcentration(stores, municipalities);
    const demographics = analyzeDemographicCorrelations(municipalities);

    const hypothesisResults: PatternAnalysisSummary['hypothesisResults'] = [
        {
            id: 'H1',
            hypothesis: 'Store distribution follows Zipf\'s Law',
            result: zipf.isZipf ? 'supported' : 'not_supported',
            evidence: `R² = ${zipf.rSquared.toFixed(3)}, slope = ${zipf.slope.toFixed(3)}`,
        },
        {
            id: 'H2',
            hypothesis: 'Top 3 companies control >90% of market',
            result: concentration.national.top3Share > 90 ? 'supported' : 'not_supported',
            evidence: `Top 3 share = ${concentration.national.top3Share}%`,
        },
        {
            id: 'H3',
            hypothesis: 'Market is highly concentrated (HHI > 2500)',
            result: concentration.national.parentHHI > 2500 ? 'supported' : 'not_supported',
            evidence: `Parent HHI = ${concentration.national.parentHHI}`,
        },
    ];

    return {
        zipf,
        concentration,
        demographics,
        hypothesisResults,
    };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Simple linear regression
 * Returns slope, intercept, and R² for log-log or linear data
 */
export function linearRegression(x: number[], y: number[]): { slope: number; intercept: number; rSquared: number } {
    const n = x.length;
    if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 };

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumXX = x.reduce((total, xi) => total + xi * xi, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R-squared
    const meanY = sumY / n;
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
    const rSquared = 1 - ssRes / ssTot;

    return { slope, intercept, rSquared };
}
