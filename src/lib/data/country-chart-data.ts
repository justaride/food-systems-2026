import type { CountryCode } from '@/lib/config/countries'

type SelfSufficiencyEntry = { name: string; value: number }
type MarginEntry = { name: string; margin: number }
type MarketShareEntry = { name: string; value: number }

type CountryChartDataSet = {
  selfSufficiency: {
    data: SelfSufficiencyEntry[]
    year: string
    source: string
    subtitle: string
  }
  margins: {
    data: MarginEntry[]
    industryAvg: number
    year: string
    source: string
  } | null
  marketShare: {
    data: MarketShareEntry[]
    year: string
    source: string
  } | null
}

export const countryChartData: Record<CountryCode, CountryChartDataSet> = {
  no: {
    selfSufficiency: {
      data: [
        { name: 'Melk', value: 98 },
        { name: 'Kjøtt', value: 96 },
        { name: 'Poteter', value: 77 },
        { name: 'Grønnsaker', value: 49 },
        { name: 'Kalorier', value: 44 },
        { name: 'Frukt', value: 4 },
      ],
      year: '2023',
      source: 'SSB/Landbruksdirektoratet',
      subtitle: 'Andel av forbruk dekket av norsk produksjon',
    },
    margins: {
      data: [
        { name: 'NorgesGruppen', margin: 3.3 },
        { name: 'Reitan (Rema)', margin: 3.85 },
        { name: 'Coop Norge', margin: 1.0 },
        { name: 'Leverandører', margin: 6.0 },
      ],
      industryAvg: 1.9,
      year: '2024',
      source: 'Årsrapporter 2024, Konkurransetilsynet verdikjedestudie',
    },
    marketShare: {
      data: [
        { name: 'Lavpris', value: 66.3 },
        { name: 'Supermarked', value: 22.9 },
        { name: 'Nærbutikk', value: 10.9 },
      ],
      year: '2024',
      source: 'SSB/Landbruksdirektoratet markedsdata 2024',
    },
  },
  se: {
    selfSufficiency: {
      data: [
        { name: 'Mjölk', value: 90 },
        { name: 'Kött', value: 75 },
        { name: 'Potatis', value: 80 },
        { name: 'Grönsaker', value: 30 },
        { name: 'Kalorier', value: 50 },
        { name: 'Frukt', value: 3 },
      ],
      year: '2023',
      source: 'Jordbruksverket',
      subtitle: 'Andel av konsumtion från svensk produktion',
    },
    margins: null,
    marketShare: {
      data: [
        { name: 'Stormarknad', value: 25 },
        { name: 'Snabbköp', value: 35 },
        { name: 'Lågpris', value: 30 },
        { name: 'Övriga', value: 10 },
      ],
      year: '2024',
      source: 'DLF/HUI Research marknadsdata 2024',
    },
  },
  dk: {
    selfSufficiency: {
      data: [
        { name: 'Mælk', value: 100 },
        { name: 'Kød', value: 100 },
        { name: 'Kartofler', value: 90 },
        { name: 'Grøntsager', value: 50 },
        { name: 'Kalorier', value: 100 },
        { name: 'Frugt', value: 10 },
      ],
      year: '2023',
      source: 'Danmarks Statistik/Landbrug & Fødevarer',
      subtitle: 'Andel af forbrug dækket af dansk produktion',
    },
    margins: null,
    marketShare: {
      data: [
        { name: 'Discount', value: 50 },
        { name: 'Supermarked', value: 35 },
        { name: 'Hypermarked', value: 10 },
        { name: 'Øvrige', value: 5 },
      ],
      year: '2024',
      source: 'DST/Dansk Erhverv markedsdata 2024',
    },
  },
  fi: {
    selfSufficiency: {
      data: [
        { name: 'Maito', value: 95 },
        { name: 'Liha', value: 85 },
        { name: 'Perunat', value: 85 },
        { name: 'Vihannekset', value: 40 },
        { name: 'Kalorit', value: 80 },
        { name: 'Hedelmät', value: 2 },
      ],
      year: '2023',
      source: 'Luke/Ruokavirasto',
      subtitle: 'Osuus kulutuksesta suomalaisesta tuotannosta',
    },
    margins: null,
    marketShare: {
      data: [
        { name: 'Hypermarket', value: 30 },
        { name: 'Supermarket', value: 40 },
        { name: 'Lähikauppa', value: 20 },
        { name: 'Muut', value: 10 },
      ],
      year: '2024',
      source: 'PTY/Päivittäistavarakauppa ry markkina-analyysi 2024',
    },
  },
  is: {
    selfSufficiency: { data: [], year: '', source: '', subtitle: '' },
    margins: null,
    marketShare: null,
  },
}
