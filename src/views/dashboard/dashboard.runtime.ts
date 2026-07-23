export type GeoPosition = [longitude: number, latitude: number]
export type GeoPolygonCoordinates = GeoPosition[][]
export type GeoMultiPolygonCoordinates = GeoPosition[][][]

export interface DashboardGeoFeature {
  type: 'Feature'
  properties: {
    id?: string
    name?: string
  }
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: GeoPolygonCoordinates | GeoMultiPolygonCoordinates
  }
}

export interface DashboardGeoCollection {
  type: 'FeatureCollection'
  features: DashboardGeoFeature[]
}
