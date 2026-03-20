import { NextResponse } from 'next/server'
import { getPropertiesGeoJSON } from '@/lib/queries/properties'

export async function GET() {
  const geojson = await getPropertiesGeoJSON()
  return NextResponse.json(geojson)
}
