import { memo, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import ChinaData from 'china-map-geojson/lib/china'
import type { DashboardCity, DashboardEvent } from './dashboard.data.ts'
import {
  type DashboardGeoFeature,
  type GeoPolygonCoordinates,
} from './dashboard.runtime.ts'

interface ChinaNetworkMapProps {
  cities: readonly DashboardCity[]
  latestEvent?: DashboardEvent
}

interface FlightAnimation {
  line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>
  particle: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
  curve: THREE.QuadraticBezierCurve3
  startedAt: number
  duration: number
  pointCount: number
}

interface MapController {
  addFlight(cityId: string): void
  dispose(): void
}

const MAP_CENTER: readonly [number, number] = [104.5, 35.4]
const MAP_SCALE = 0.9

function projectCoordinate(coordinate: readonly [number, number]): [number, number] {
  return [
    (coordinate[0] - MAP_CENTER[0]) * MAP_SCALE,
    (coordinate[1] - MAP_CENTER[1]) * MAP_SCALE,
  ]
}

function getPolygons(feature: DashboardGeoFeature): GeoPolygonCoordinates[] {
  if (feature.geometry.type === 'Polygon') {
    return [feature.geometry.coordinates as GeoPolygonCoordinates]
  }

  return feature.geometry.coordinates as GeoPolygonCoordinates[]
}

function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    const renderable = child as THREE.Object3D & {
      geometry?: THREE.BufferGeometry
      material?: THREE.Material | THREE.Material[]
    }
    renderable.geometry?.dispose()
    if (Array.isArray(renderable.material)) {
      renderable.material.forEach((material) => material.dispose())
    } else {
      renderable.material?.dispose()
    }
  })
}

function createMapController(
  container: HTMLDivElement,
  cities: readonly DashboardCity[],
): MapController {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 500)
  const mapGroup = new THREE.Group()
  const cityNodes = new Map<string, THREE.Group>()
  const flightAnimations: FlightAnimation[] = []
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let frameId = 0
  let disposed = false
  let pageVisible = !document.hidden
  let resizeObserver: ResizeObserver | undefined
  let visibilityListenerAttached = false

  const handleVisibilityChange = () => {
    pageVisible = !document.hidden
  }

  const removeFlight = (flight: FlightAnimation) => {
    scene.remove(flight.line, flight.particle)
    flight.line.geometry.dispose()
    flight.line.material.dispose()
    flight.particle.geometry.dispose()
    flight.particle.material.dispose()
  }

  const cleanup = () => {
    if (disposed) {
      return
    }

    disposed = true
    window.cancelAnimationFrame(frameId)
    resizeObserver?.disconnect()
    if (visibilityListenerAttached) {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    flightAnimations.splice(0).forEach(removeFlight)
    disposeObject(scene)
    renderer.dispose()
    renderer.forceContextLoss()
    renderer.domElement.remove()
  }

  try {

  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
  renderer.domElement.className = 'dashboard-map-canvas'
  renderer.domElement.setAttribute('aria-hidden', 'true')
  container.append(renderer.domElement)

  camera.position.set(0, -42, 88)
  camera.lookAt(0, 0, 0)
  scene.add(mapGroup)
  scene.add(new THREE.AmbientLight(0x5b8fc7, 1.7))

  const directionalLight = new THREE.DirectionalLight(0x7eeeff, 2.6)
  directionalLight.position.set(-12, -18, 60)
  scene.add(directionalLight)

  ChinaData.features.forEach((feature, featureIndex) => {
    getPolygons(feature).forEach((polygon) => {
      const [outerRing, ...holes] = polygon
      if (!outerRing || outerRing.length < 4) {
        return
      }

      const shape = new THREE.Shape()
      outerRing.forEach((coordinate, index) => {
        const [x, y] = projectCoordinate(coordinate)
        if (index === 0) shape.moveTo(x, y)
        else shape.lineTo(x, y)
      })

      holes.forEach((holeRing) => {
        if (holeRing.length < 4) {
          return
        }
        const hole = new THREE.Path()
        holeRing.forEach((coordinate, index) => {
          const [x, y] = projectCoordinate(coordinate)
          if (index === 0) hole.moveTo(x, y)
          else hole.lineTo(x, y)
        })
        shape.holes.push(hole)
      })

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 1.15,
        bevelEnabled: false,
        curveSegments: 1,
      })
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshPhongMaterial({
          color: featureIndex % 3 === 0 ? 0x082b53 : featureIndex % 3 === 1 ? 0x0a3763 : 0x0b315a,
          emissive: 0x031326,
          shininess: 62,
          transparent: true,
          opacity: 0.94,
        }),
      )
      mapGroup.add(mesh)

      const edgeGeometry = new THREE.EdgesGeometry(geometry, 20)
      const edge = new THREE.LineSegments(
        edgeGeometry,
        new THREE.LineBasicMaterial({ color: 0x1acbf2, transparent: true, opacity: 0.5 }),
      )
      mapGroup.add(edge)
    })
  })

  cities.forEach((city, index) => {
    const [x, y] = projectCoordinate(city.coordinate)
    const node = new THREE.Group()
    const isHeadquarters = city.kind === 'HEADQUARTERS'
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(isHeadquarters ? 0.58 : 0.35, 18, 18),
      new THREE.MeshBasicMaterial({ color: isHeadquarters ? 0xffffff : 0x42e8ff }),
    )
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(isHeadquarters ? 0.82 : 0.54, isHeadquarters ? 1.02 : 0.7, 36),
      new THREE.MeshBasicMaterial({
        color: isHeadquarters ? 0x7b8cff : 0x1fd9ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.58,
      }),
    )
    node.position.set(x, y, 2.05)
    node.userData.phase = index * 0.63
    node.userData.pulseUntil = 0
    node.add(core, halo)

    if (isHeadquarters) {
      const beacon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.46, 6.4, 18, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0x73ddff,
          transparent: true,
          opacity: 0.26,
          side: THREE.DoubleSide,
        }),
      )
      beacon.rotation.x = Math.PI / 2
      beacon.position.z = 2.8
      node.add(beacon)
    }

    scene.add(node)
    cityNodes.set(city.id, node)
  })

  resizeObserver = new ResizeObserver(() => {
    const width = Math.max(container.clientWidth, 1)
    const height = Math.max(container.clientHeight, 1)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
  })
  resizeObserver.observe(container)

  document.addEventListener('visibilitychange', handleVisibilityChange)
  visibilityListenerAttached = true

  const render = (time: number) => {
    if (disposed) {
      return
    }

    if (pageVisible) {
      cityNodes.forEach((node) => {
        const phase = typeof node.userData.phase === 'number' ? node.userData.phase : 0
        const pulseUntil = typeof node.userData.pulseUntil === 'number' ? node.userData.pulseUntil : 0
        const eventPulse = pulseUntil > time ? 0.3 * Math.sin(((pulseUntil - time) / 1600) * Math.PI) : 0
        const breathing = reducedMotion ? 0 : Math.sin(time * 0.0018 + phase) * 0.055
        node.scale.setScalar(1 + breathing + eventPulse)
      })

      for (let index = flightAnimations.length - 1; index >= 0; index -= 1) {
        const flight = flightAnimations[index]
        const progress = Math.min((time - flight.startedAt) / flight.duration, 1)
        flight.line.geometry?.setDrawRange(0, Math.max(2, Math.floor(progress * flight.pointCount)))
        flight.particle.position.copy(flight.curve.getPointAt(progress))

        if (progress >= 1) {
          removeFlight(flight)
          flightAnimations.splice(index, 1)
        }
      }

      renderer.render(scene, camera)
    }
    frameId = window.requestAnimationFrame(render)
  }
  frameId = window.requestAnimationFrame(render)

  return {
    addFlight(cityId: string) {
      const sourceNode = cityNodes.get(cityId)
      const headquartersNode = cityNodes.get('beijing')
      if (!sourceNode || !headquartersNode || disposed) {
        return
      }

      sourceNode.userData.pulseUntil = performance.now() + 1600
      const start = new THREE.Vector3(sourceNode.position.x, sourceNode.position.y, 2.6)
      const end = new THREE.Vector3(headquartersNode.position.x, headquartersNode.position.y, 3.2)
      const midpoint = start.clone().lerp(end, 0.5)
      midpoint.z += Math.max(5.5, start.distanceTo(end) * 0.18)
      const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end)
      const points = curve.getPoints(84)
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
      lineGeometry.setDrawRange(0, 0)
      const line = new THREE.Line(
        lineGeometry,
        new THREE.LineBasicMaterial({ color: 0x3de8ff, transparent: true, opacity: 0.78 }),
      )
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
      )
      particle.position.copy(start)
      scene.add(line, particle)

      flightAnimations.push({
        line,
        particle,
        curve,
        startedAt: performance.now(),
        duration: reducedMotion ? 1200 : 2800,
        pointCount: points.length,
      })

      while (flightAnimations.length > 4) {
        const oldest = flightAnimations.shift()
        if (oldest) removeFlight(oldest)
      }
    },
    dispose() {
      cleanup()
    },
  }
  } catch (error) {
    cleanup()
    throw error
  }
}

export const ChinaNetworkMap = memo(function ChinaNetworkMap({
  cities,
  latestEvent,
}: ChinaNetworkMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<MapController | undefined>(undefined)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    try {
      controllerRef.current = createMapController(container, cities)
    } catch {
      setFailed(true)
    }

    return () => {
      controllerRef.current?.dispose()
      controllerRef.current = undefined
    }
  }, [cities])

  useEffect(() => {
    if (latestEvent) {
      controllerRef.current?.addFlight(latestEvent.cityId)
    }
  }, [latestEvent])

  return (
    <div ref={containerRef} className="dashboard-map-stage" aria-label="全国协同节点地图">
      {failed && (
        <div className="dashboard-map-fallback">
          <span>CHINA NETWORK</span>
          <strong>地图渲染暂时不可用</strong>
          <small>全国节点数据仍在持续同步</small>
        </div>
      )}
    </div>
  )
})
