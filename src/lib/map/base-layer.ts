import L from 'leaflet'

// Standard browser tile requests with attribution and normal HTTP caching.
// Policy: https://operations.osmfoundation.org/policies/tiles/
export function addBaseLayer(map: L.Map): L.TileLayer {
  const notice = new L.Control({ position: 'bottomright' })
  notice.onAdd = () => {
    const element = L.DomUtil.create('div', 'rounded bg-white p-3 text-sm text-stone-800 shadow max-w-64')
    element.setAttribute('role', 'status')
    element.textContent = 'Bakgrunnskartet kunne ikke lastes. Prøv å laste siden på nytt.'
    return element
  }
  let failed = false
  const layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    updateWhenIdle: true,
  })
  layer.on('loading', () => { failed = false })
  layer.on('tileerror', () => { failed = true; notice.addTo(map) })
  layer.on('load', () => { if (!failed) notice.remove() })
  return layer.addTo(map)
}
