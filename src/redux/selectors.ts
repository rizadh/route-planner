import AppState from '../redux/state'
import { fetchedRoutesKey } from '../redux/reducer'

type EmptyRouteInformation = {
    status: 'EMPTY'
}

type FetchedRouteInformation = {
    status: 'FETCHED'
    totalDistance: number
    totalTime: number
}

type FetchFailedRouteInformation = {
    status: 'FAILED'
}

type FetchingRouteInformation = {
    status: 'FETCHING'
    fetchProgress: number
}

export type RouteInformation = FetchedRouteInformation | FetchFailedRouteInformation | FetchingRouteInformation | EmptyRouteInformation

export const routeInformation = (state: AppState): RouteInformation => {
    const waypointCount = state.waypoints.length

    if (waypointCount < 2) return { status: 'EMPTY' }

    const geocodedWaypointCount = state.waypoints.filter(waypoint => state.fetchedPlaces[waypoint.address]).length
    const routes = state.waypoints.map((waypoint, index, waypoints) => {
        if (index === 0) return
        const previousWaypoint = waypoints[index - 1]
        return state.fetchedRoutes[fetchedRoutesKey(previousWaypoint.address, waypoint.address)]
    })
    const fetchedRoutes = routes.filter((route): route is mapkit.Route => !!route)
    const totalDistance = fetchedRoutes.reduce((total, route) => total + route.distance, 0)
    const totalTime = fetchedRoutes.reduce((total, route) => total + route.expectedTravelTime, 0)
    const routeCount = fetchedRoutes.length

    const failedRouteExists = routes.some(route => route === null)
    const failedLookupExists = state.waypoints.some(waypoint => state.fetchedPlaces[waypoint.address] === null)

    const totalItems = 2 * waypointCount - 1
    const completedItems = geocodedWaypointCount + routeCount

    if (failedLookupExists || failedRouteExists)
        return { status: 'FAILED' }

    return totalItems === completedItems
        ? {
            status: 'FETCHED',
            totalDistance,
            totalTime
        }
        : {
            status: 'FETCHING',
            fetchProgress: completedItems / totalItems
        }
}