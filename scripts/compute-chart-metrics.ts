import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { bbox as turfBbox, booleanPointInPolygon, point } from '@turf/turf'

type Store = {
  id: string
  chain: string
  chainId: string
  location: { lat: number; lng: number }
}

type Municipality = {
  code: string
  name: string
  population: number
  area: number
}

type CountryDef = {
  dataDir: string
  storesFile: string
  municipalitiesFile: string
  boundariesFile: string
  municipalityIdProp: string
  chainParents: Record<string, string>
  parentColors: Record<string, string>
}

const BASE_DIR = join(__dirname, '..', 'public', 'data', 'food-systems')

const COUNTRIES: Record<string, CountryDef> = {
  no: {
    dataDir: join(BASE_DIR, 'no'),
    storesFile: 'stores.json',
    municipalitiesFile: 'municipalities.json',
    boundariesFile: 'norway-municipalities.geojson',
    municipalityIdProp: 'kommunenummer',
    chainParents: {
      rema: 'Reitangruppen',
      kiwi: 'NorgesGruppen',
      extra: 'Coop Norge',
      'coop-prix': 'Coop Norge',
      bunnpris: 'Bunnpris AS',
      joker: 'NorgesGruppen',
      spar: 'NorgesGruppen',
      meny: 'NorgesGruppen',
      'coop-mega': 'Coop Norge',
      'coop-marked': 'Coop Norge',
      naerbutikken: 'NorgesGruppen',
      matkroken: 'NorgesGruppen',
      obs: 'Coop Norge',
    },
    parentColors: {
      NorgesGruppen: '#1565C0',
      'Coop Norge': '#E30613',
      Reitangruppen: '#4CAF50',
      'Bunnpris AS': '#E91E63',
    },
  },
  se: {
    dataDir: join(BASE_DIR, 'se'),
    storesFile: 'stores.json',
    municipalitiesFile: 'municipalities.json',
    boundariesFile: 'municipalities.geojson',
    municipalityIdProp: 'kommunkod',
    chainParents: {
      'ica-n-ra': 'ICA Gruppen',
      'ica-supermarket': 'ICA Gruppen',
      'ica-kvantum': 'ICA Gruppen',
      'maxi-ica-stormarknad': 'ICA Gruppen',
      ica: 'ICA Gruppen',
      'ica-maxi': 'ICA Gruppen',
      coop: 'Coop Sverige',
      'coop-sweden': 'Coop Sverige',
      'coop-konsum': 'Coop Sverige',
      'coop-n-ra': 'Coop Sverige',
      'x-tra': 'Coop Sverige',
      willys: 'Axfood',
      'hemk-p': 'Axfood',
      tempo: 'Axfood',
      'handlar-n': 'Axfood',
      handlarn: 'Axfood',
      'mat-ppet': 'Axfood',
      lidl: 'Lidl',
      'city-gross': 'Bergendahls',
    },
    parentColors: {
      'ICA Gruppen': '#E3000B',
      Axfood: '#00843D',
      'Coop Sverige': '#00529B',
      Lidl: '#0050AA',
      Bergendahls: '#FF6900',
    },
  },
  dk: {
    dataDir: join(BASE_DIR, 'dk'),
    storesFile: 'stores.json',
    municipalitiesFile: 'municipalities.json',
    boundariesFile: 'municipalities.geojson',
    municipalityIdProp: 'kommunekode',
    chainParents: {
      netto: 'Salling Group',
      'rema-1000': 'Reitangruppen',
      '365discount': 'Coop Danmark',
      'coop-365discount': 'Coop Danmark',
      'coop-365-discount': 'Coop Danmark',
      superbrugsen: 'Coop Danmark',
      'dagli-brugsen': 'Coop Danmark',
      daglibrugsen: 'Coop Danmark',
      brugsen: 'Coop Danmark',
      kvickly: 'Coop Danmark',
      lidl: 'Lidl',
      'min-k-bmand': 'Dagrofa',
      spar: 'Dagrofa',
      meny: 'Dagrofa',
      'f-tex': 'Salling Group',
      'f-tex-food': 'Salling Group',
      bilka: 'Salling Group',
      'abc-lavpris': 'Dagrofa',
      'elite-k-bmand': 'Dagrofa',
      'l-vbjerg': 'Dagrofa',
      'let-k-b': 'Dagrofa',
      'letk-b': 'Dagrofa',
    },
    parentColors: {
      'Salling Group': '#E31937',
      'Coop Danmark': '#00529B',
      Reitangruppen: '#003DA5',
      Dagrofa: '#2E8B57',
      Lidl: '#0050AA',
    },
  },
  fi: {
    dataDir: join(BASE_DIR, 'fi'),
    storesFile: 'stores.json',
    municipalitiesFile: 'municipalities.json',
    boundariesFile: 'municipalities.geojson',
    municipalityIdProp: 'kuntanumero',
    chainParents: {
      'k-market': 'Kesko',
      'k-supermarket': 'Kesko',
      'k-citymarket': 'Kesko',
      's-market': 'S-Group',
      sale: 'S-Group',
      alepa: 'S-Group',
      prisma: 'S-Group',
      lidl: 'Lidl',
      halpahalli: 'Tokmanni Group',
      minimani: 'Minimani',
    },
    parentColors: {
      'S-Group': '#00A651',
      Kesko: '#FF6600',
      Lidl: '#0050AA',
      'Tokmanni Group': '#E31937',
      Minimani: '#6B7280',
    },
  },
}

function loadJson<T>(dir: string, filename: string): T {
  return JSON.parse(readFileSync(join(dir, filename), 'utf-8'))
}

function assignStoresToMunicipalities(
  stores: Store[],
  geojson: GeoJSON.FeatureCollection,
  municipalityIdProp: string
): Record<string, Store[]> {
  const result: Record<string, Store[]> = {}

  const features = geojson.features
    .map(f => {
      const code = f.properties?.[municipalityIdProp] as string
      if (!code) return null
      const geomType = f.geometry?.type
      if (!geomType || geomType === 'GeometryCollection') return null
      try {
        const b = turfBbox(f)
        return { code, feature: f, bbox: b }
      } catch {
        return null
      }
    })
    .filter((f): f is NonNullable<typeof f> => f !== null)

  for (const store of stores) {
    const lng = store.location.lng
    const lat = store.location.lat
    const pt = point([lng, lat])

    for (const { code, feature, bbox: b } of features) {
      if (lng >= b[0] && lng <= b[2] && lat >= b[1] && lat <= b[3]) {
        try {
          if (booleanPointInPolygon(pt, feature as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>)) {
            if (!result[code]) result[code] = []
            result[code].push(store)
            break
          }
        } catch {
          continue
        }
      }
    }
  }

  return result
}

function linearRegression(x: number[], y: number[]): { slope: number; intercept: number; rSquared: number } {
  const n = x.length
  if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 }

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0)
  const sumXX = x.reduce((total, xi) => total + xi * xi, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const meanY = sumY / n
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0)
  const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0)
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0

  return { slope, intercept, rSquared }
}

function computeForCountry(countryCode: string) {
  const def = COUNTRIES[countryCode]
  if (!def) {
    console.error(`Unknown country: ${countryCode}. Available: ${Object.keys(COUNTRIES).join(', ')}`)
    process.exit(1)
  }

  if (!existsSync(def.dataDir)) {
    console.error(`Data directory not found: ${def.dataDir}`)
    process.exit(1)
  }

  console.log(`\n=== Computing metrics for ${countryCode.toUpperCase()} ===`)
  console.log('Loading data...')
  const stores = loadJson<Store[]>(def.dataDir, def.storesFile)
  const municipalitiesRaw = loadJson<Record<string, Municipality>>(def.dataDir, def.municipalitiesFile)
  const geojson = loadJson<GeoJSON.FeatureCollection>(def.dataDir, def.boundariesFile)

  console.log(`Loaded ${stores.length} stores, ${Object.keys(municipalitiesRaw).length} municipalities`)

  console.log('Running PIP assignment...')
  const storesByMuni = assignStoresToMunicipalities(stores, geojson, def.municipalityIdProp)

  const assignedCount = Object.values(storesByMuni).reduce((sum, s) => sum + s.length, 0)
  console.log(`Assigned ${assignedCount}/${stores.length} stores to municipalities`)

  console.log('Computing parent company shares...')
  const parentCounts = new Map<string, number>()
  for (const store of stores) {
    const parent = def.chainParents[store.chainId] || 'Unknown'
    parentCounts.set(parent, (parentCounts.get(parent) || 0) + 1)
  }

  const byParent = Array.from(parentCounts.entries())
    .map(([parent, count]) => ({
      id: parent,
      label: parent,
      value: Math.round((count / stores.length) * 1000) / 10,
      count,
      color: def.parentColors[parent] || '#6B7280',
    }))
    .sort((a, b) => b.count - a.count)

  const parentHHI = byParent.reduce((sum, p) => sum + p.value * p.value, 0)

  console.log('Parent shares:', byParent.map(p => `${p.id}: ${p.value}% (${p.count})`).join(', '))
  console.log('Parent HHI:', Math.round(parentHHI))

  const muniStoreData: Array<{ code: string; name: string; population: number; storeCount: number }> = []

  for (const [code, muni] of Object.entries(municipalitiesRaw)) {
    if (code.startsWith('_')) continue
    const muniStores = storesByMuni[code] || []
    muniStoreData.push({
      code,
      name: muni.name,
      population: muni.population,
      storeCount: muniStores.length,
    })
  }

  console.log('Computing Zipf distribution...')
  const zipfData = muniStoreData
    .filter(m => m.storeCount > 0)
    .sort((a, b) => b.storeCount - a.storeCount)
    .map((m, i) => ({
      rank: i + 1,
      storeCount: m.storeCount,
      logRank: Math.round(Math.log10(i + 1) * 1000) / 1000,
      logCount: Math.round(Math.log10(m.storeCount) * 1000) / 1000,
      name: m.name,
    }))

  const { slope, intercept, rSquared } = linearRegression(
    zipfData.map(d => d.logRank),
    zipfData.map(d => d.logCount)
  )

  const isZipf = rSquared > 0.7 && slope < -0.5 && slope > -1.5

  console.log(`Zipf: slope=${slope.toFixed(3)}, R²=${rSquared.toFixed(3)}, isZipf=${isZipf}`)

  console.log('Computing Lorenz curve...')
  const lorenzInput = muniStoreData
    .filter(m => m.population > 0)
    .sort((a, b) => {
      const densityA = a.storeCount / a.population
      const densityB = b.storeCount / b.population
      return densityA - densityB
    })

  const totalPop = lorenzInput.reduce((sum, m) => sum + m.population, 0)
  const totalStores = lorenzInput.reduce((sum, m) => sum + m.storeCount, 0)

  let cumulativePop = 0
  let cumulativeStores = 0

  const lorenzCurveRaw = [{ cumulativePopShare: 0, cumulativeStoreShare: 0 }]

  for (const m of lorenzInput) {
    cumulativePop += m.population
    cumulativeStores += m.storeCount
    lorenzCurveRaw.push({
      cumulativePopShare: cumulativePop / totalPop,
      cumulativeStoreShare: cumulativeStores / totalStores,
    })
  }

  const lorenzCurve: Array<{ popShare: number; storeShare: number }> = []
  for (let pct = 0; pct <= 100; pct += 5) {
    const target = pct / 100
    const closest = lorenzCurveRaw.reduce((prev, curr) =>
      Math.abs(curr.cumulativePopShare - target) < Math.abs(prev.cumulativePopShare - target) ? curr : prev
    )
    lorenzCurve.push({
      popShare: pct,
      storeShare: Math.round(closest.cumulativeStoreShare * 1000) / 10,
    })
  }

  let areaUnderLorenz = 0
  for (let i = 1; i < lorenzCurveRaw.length; i++) {
    const dx = lorenzCurveRaw[i].cumulativePopShare - lorenzCurveRaw[i - 1].cumulativePopShare
    const avgY = (lorenzCurveRaw[i].cumulativeStoreShare + lorenzCurveRaw[i - 1].cumulativeStoreShare) / 2
    areaUnderLorenz += dx * avgY
  }
  const gini = Math.round((1 - 2 * areaUnderLorenz) * 1000) / 1000

  console.log(`Lorenz: Gini=${gini}, ${lorenzCurve.length} chart points`)

  const output = {
    generated: new Date().toISOString(),
    country: countryCode,
    totalStores: stores.length,
    parentCompany: {
      data: byParent,
      parentHHI: Math.round(parentHHI),
    },
    lorenzCurve: {
      data: lorenzCurve,
      gini,
    },
    zipf: {
      data: zipfData.map(d => ({
        logRank: d.logRank,
        logCount: d.logCount,
        name: d.rank <= 10 ? d.name : `#${d.rank}`,
        rank: d.rank,
        storeCount: d.storeCount,
      })),
      slope: Math.round(slope * 1000) / 1000,
      intercept: Math.round(intercept * 1000) / 1000,
      rSquared: Math.round(rSquared * 1000) / 1000,
      isZipf,
    },
  }

  const outPath = join(def.dataDir, 'chart-metrics.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`Wrote ${outPath}`)
}

function main() {
  const countryArg = process.argv.find(a => a.startsWith('--country='))
  const country = countryArg ? countryArg.split('=')[1] : 'no'

  if (country === 'all') {
    for (const code of Object.keys(COUNTRIES)) {
      computeForCountry(code)
    }
  } else {
    computeForCountry(country)
  }
}

main()
