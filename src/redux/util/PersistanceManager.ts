import { AppState, FetchResult, FetchSuccess } from '../state'

export class PersistanceManager {
    static persistState(state: AppState) {
        localStorage.setItem(
            PersistanceManager.STATE_STORAGE_KEY,
            JSON.stringify(PersistanceManager.sanitizeState(state)),
        )
    }

    static persistedState(): Partial<AppState> {
        const state = JSON.parse(localStorage.getItem(PersistanceManager.STATE_STORAGE_KEY) || '{}')
        const { waypoints, fetchedPlaces, fetchedRoutes } = state

        return {
            ...state,
            autofitIsEnabled: true,
            waypoints,
            fetchedPlaces,
            fetchedRoutes:
                fetchedRoutes &&
                new Map(
                    fetchedRoutes.map(([key, value]: [string, any]) => [
                        key,
                        PersistanceManager.sanitizeFetchResultsMap(new Map(value)),
                    ]),
                ),
        }
    }

    static resetState() {
        localStorage.removeItem(PersistanceManager.STATE_STORAGE_KEY)
    }
    private static STATE_STORAGE_KEY = 'com.rizadh.QuickRoute.state'

    private static sanitizeState(state: AppState): AppState {
        const { waypoints, fetchedPlaces, fetchedRoutes } = state
        const addresses = waypoints.map(w => w.address)

        return {
            ...state,
            waypoints: waypoints.map(waypoint => ({ ...waypoint, selected: undefined })),
            fetchedPlaces: PersistanceManager.objectFromEntries(
                PersistanceManager.filterSuccessfulFetchResults(Object.entries(fetchedPlaces), addresses.includes),
            ),
            fetchedRoutes: new Map(
                [...fetchedRoutes.entries()]
                    .filter(([key]) => !addresses || addresses.includes(key))
                    .map(([key, value]: [string, any]) => [
                        key,
                        PersistanceManager.sanitizeFetchResultsMap(new Map(value), addresses),
                    ]),
            ),
        }
    }

    private static objectFromEntries<V>(entries: Iterable<[string, V]>): { [key: string]: V } {
        const obj: { [key: string]: V } = {}
        for (const [key, value] of entries) obj[key] = value
        return obj
    }

    private static filterSuccessfulFetchResults<V>(
        source: Iterable<[string, FetchResult<V> | undefined]>,
        predicate: (key: string) => boolean,
    ): Iterable<[string, FetchSuccess<V>]> {
        return [...source].filter(
            (entry): entry is [string, FetchSuccess<V>] =>
                entry[1]?.status === 'SUCCESS' && (!predicate || predicate(entry[0])),
        )
    }

    private static sanitizeFetchResultsMap<K, V>(
        source: ReadonlyMap<K, FetchResult<V>>,
        addresses?: K[],
    ): ReadonlyMap<K, FetchSuccess<V>> {
        return new Map(
            [...source.entries()].filter(
                (entry): entry is [K, FetchSuccess<V>] =>
                    entry[1].status === 'SUCCESS' && (!addresses || addresses.includes(entry[0])),
            ),
        )
    }
}
