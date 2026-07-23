declare module 'china-map-geojson/lib/china' {
  type GeoPosition = [longitude: number, latitude: number]
  type GeoPolygonCoordinates = GeoPosition[][]
  type GeoMultiPolygonCoordinates = GeoPosition[][][]

  interface ChinaGeoFeature {
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

  const ChinaData: {
    type: 'FeatureCollection'
    features: ChinaGeoFeature[]
  }

  export default ChinaData
}
