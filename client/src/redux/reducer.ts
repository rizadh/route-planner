import {
    AddWaypointAction,
    AppAction,
    DeleteWaypointAction,
    FetchPlaceFailedAction,
    FetchPlaceInProgressAction,
    FetchPlaceSuccessAction,
    FetchRouteFailedAction,
    FetchRouteInProgressAction,
    FetchRouteSuccessAction,
    MoveSelectedWaypointsAction,
    MoveWaypointAction,
    ReplaceWaypointsAction,
    ReverseWaypointsAction,
    SelectWaypointAction,
    SelectWaypointRangeAction,
    SetAddressAction,
    ToggleWaypointSelectionAction,
} from './actionTypes'
import { AppState, EditorPane, fetchFailed, fetchInProgress, fetchSuccess } from './state'

const initialState: AppState = {
    waypoints: [],
    lastSelectedWaypointIndex: 0,
    fetchedPlaces: new Map(),
    fetchedRoutes: new Map(),
    autofitIsEnabled: true,
    mutedMapIsEnabled: false,
    editorPane: EditorPane.List,
    editorIsHidden: false,
}

export default (state: AppState = initialState, action: AppAction): AppState => {
    switch (action.type) {
        case 'REPLACE_WAYPOINTS':
            return replaceWaypoints(state, action)
        case 'ADD_WAYPOINT':
            return addWaypoint(state, action)
        case 'DELETE_WAYPOINT':
            return deleteWaypoint(state, action)
        case 'MOVE_WAYPOINT':
            return moveWaypoint(state, action)
        case 'MOVE_SELECTED_WAYPOINTS':
            return moveSelectedWaypoints(state, action)
        case 'REVERSE_WAYPOINTS':
            return reverseWaypoints(state, action)
        case 'SET_ADDRESS':
            return setAddress(state, action)
        case 'SELECT_WAYPOINT':
            return selectWaypoint(state, action)
        case 'TOGGLE_WAYPOINT_SELECTION':
            return toggleWaypoint(state, action)
        case 'SELECT_WAYPOINT_RANGE':
            return selectWaypointRange(state, action)
        case 'FETCH_PLACE_IN_PROGRESS':
            return fetchPlaceInProgress(state, action)
        case 'FETCH_PLACE_SUCCESS':
            return fetchPlaceSuccess(state, action)
        case 'FETCH_PLACE_FAILED':
            return fetchPlaceFailed(state, action)
        case 'FETCH_ROUTE_IN_PROGRESS':
            return fetchRouteInProgress(state, action)
        case 'FETCH_ROUTE_SUCCESS':
            return fetchRouteSuccess(state, action)
        case 'FETCH_ROUTE_FAILED':
            return fetchRouteFailed(state, action)
        case 'ENABLE_AUTOFIT':
            return { ...state, autofitIsEnabled: true }
        case 'DISABLE_AUTOFIT':
            return { ...state, autofitIsEnabled: false }
        case 'MUTE_MAP':
            return { ...state, mutedMapIsEnabled: true }
        case 'UNMUTE_MAP':
            return { ...state, mutedMapIsEnabled: false }
        case 'SET_EDITOR_PANE':
            return { ...state, editorPane: action.editorPane }
        case 'HIDE_EDITOR_PANE':
            return { ...state, editorIsHidden: true }
        case 'SHOW_EDITOR_PANE':
            return { ...state, editorIsHidden: false }
    }

    return state
}

type Reducer<T> = (state: AppState, action: T) => AppState

const replaceWaypoints: Reducer<ReplaceWaypointsAction> = (state, { waypoints }) => ({
    ...state,
    waypoints,
})

const addWaypoint: Reducer<AddWaypointAction> = (state, { waypoint }) => ({
    ...state,
    waypoints: [...state.waypoints, waypoint],
})

const deleteWaypoint: Reducer<DeleteWaypointAction> = (state, { index }) => {
    const waypoints = [...state.waypoints]
    waypoints.splice(index, 1)
    return { ...state, waypoints }
}

const moveWaypoint: Reducer<MoveWaypointAction> = (state, { sourceIndex, targetIndex }) => {
    if (sourceIndex === targetIndex) return state

    const waypoints = [...state.waypoints]
    const [removed] = waypoints.splice(sourceIndex, 1)
    waypoints.splice(targetIndex, 0, removed)
    return { ...state, waypoints }
}

const moveSelectedWaypoints: Reducer<MoveSelectedWaypointsAction> = (state, { index: targetIndex }) => {
    const lowestIndex = state.waypoints.findIndex(waypoint => waypoint.isSelected)
    const partitionIndex = lowestIndex < targetIndex ? targetIndex + 1 : targetIndex

    const waypointsBeforePartition = state.waypoints.filter(
        (waypoint, index) => !waypoint.isSelected && index < partitionIndex,
    )
    const movedWaypoints = state.waypoints.filter(waypoint => waypoint.isSelected)
    const waypointsAfterPartition = state.waypoints.filter(
        (waypoint, index) => !waypoint.isSelected && index >= partitionIndex,
    )

    const waypoints = [...waypointsBeforePartition, ...movedWaypoints, ...waypointsAfterPartition]

    const lastSelectedWaypoint = state.waypoints[state.lastSelectedWaypointIndex]
    const lastSelectedWaypointIndex = waypoints.indexOf(lastSelectedWaypoint)

    return { ...state, lastSelectedWaypointIndex, waypoints }
}

const reverseWaypoints: Reducer<ReverseWaypointsAction> = state => ({
    ...state,
    waypoints: [...state.waypoints].reverse(),
})

const setAddress: Reducer<SetAddressAction> = (state, { index, address }) => {
    const waypoints = [...state.waypoints]
    waypoints.splice(index, 1, {
        ...state.waypoints[index],
        address,
    })
    return { ...state, waypoints }
}

const selectWaypoint: Reducer<SelectWaypointAction> = (state, { index }) => {
    const selectedWaypointsCount = state.waypoints.filter(w => w.isSelected).length

    return {
        ...state,
        lastSelectedWaypointIndex: index,
        waypoints: state.waypoints.map((waypoint, waypointIndex) => {
            if (waypointIndex !== index && waypoint.isSelected) {
                return { ...waypoint, isSelected: false }
            }

            if (waypointIndex === index && !waypoint.isSelected) {
                return { ...waypoint, isSelected: true }
            }

            if (waypointIndex === index && selectedWaypointsCount === 1) {
                return { ...waypoint, isSelected: false }
            }

            return waypoint
        }),
    }
}

const toggleWaypoint: Reducer<ToggleWaypointSelectionAction> = (state, { index }) => ({
    ...state,
    lastSelectedWaypointIndex: index,
    waypoints: state.waypoints.map((waypoint, waypointIndex) => {
        if (waypointIndex === index) {
            return { ...waypoint, isSelected: !waypoint.isSelected }
        }

        return waypoint
    }),
})

const selectWaypointRange: Reducer<SelectWaypointRangeAction> = (state, { index }) => {
    if (index < state.lastSelectedWaypointIndex) {
        return {
            ...state,
            waypoints: state.waypoints.map((waypoint, waypointIndex) => {
                if (waypointIndex >= index && waypointIndex < state.lastSelectedWaypointIndex) {
                    return { ...waypoint, isSelected: true }
                }

                return waypoint
            }),
        }
    } else {
        return {
            ...state,
            waypoints: state.waypoints.map((waypoint, waypointIndex) => {
                if (waypointIndex <= index && waypointIndex > state.lastSelectedWaypointIndex) {
                    return { ...waypoint, isSelected: true }
                }

                return waypoint
            }),
        }
    }
}

const fetchPlaceInProgress: Reducer<FetchPlaceInProgressAction> = (state, { address, fetchId }) => ({
    ...state,
    fetchedPlaces: new Map(state.fetchedPlaces).set(address, fetchInProgress(fetchId)),
})

const fetchPlaceSuccess: Reducer<FetchPlaceSuccessAction> = (state, { address, place }) => ({
    ...state,
    fetchedPlaces: new Map(state.fetchedPlaces).set(address, fetchSuccess(place)),
})

const fetchPlaceFailed: Reducer<FetchPlaceFailedAction> = (state, { address, error }) => ({
    ...state,
    fetchedPlaces: new Map(state.fetchedPlaces).set(address, fetchFailed(error)),
})

const fetchRouteInProgress: Reducer<FetchRouteInProgressAction> = (state, { origin, destination, fetchId }) => ({
    ...state,
    fetchedRoutes: new Map(state.fetchedRoutes).set(
        origin,
        new Map(state.fetchedRoutes.get(origin) || []).set(destination, fetchInProgress(fetchId)),
    ),
})

const fetchRouteSuccess: Reducer<FetchRouteSuccessAction> = (state, { origin, destination, route }) => ({
    ...state,
    fetchedRoutes: new Map(state.fetchedRoutes).set(
        origin,
        new Map(state.fetchedRoutes.get(origin) || []).set(destination, fetchSuccess(route)),
    ),
})

const fetchRouteFailed: Reducer<FetchRouteFailedAction> = (state, { origin, destination, error }) => ({
    ...state,
    fetchedRoutes: new Map(state.fetchedRoutes).set(
        origin,
        new Map(state.fetchedRoutes.get(origin) || []).set(destination, fetchFailed(error)),
    ),
})
