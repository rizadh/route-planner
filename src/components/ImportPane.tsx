import isMobileFn from 'ismobilejs'
import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useInput } from '../hooks/useInput'
import { AppAction } from '../redux/actionTypes'
import { AppState } from '../redux/state'
import { DangerButton, PrimaryButton } from './Button'
import { WaypointEditorTemplate } from './WaypointEditor'

export const ImportPane = () => {
    const importInProgress = useSelector((state: AppState) => state.importInProgress)
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const dispatch: Dispatch<AppAction> = useDispatch()

    const {
        value: driverNumberFieldValue,
        props: driverNumberFieldProps,
        commitValue: importWaypoints,
        valueIsValid: driverNumberIsValid,
    } = useInput({
        predicate: value => !!value,
        onCommit: useCallback((value: string) => dispatch({ type: 'IMPORT_WAYPOINTS', driverNumber: value }), []),
    })

    const cancelImport = useCallback(
        () => dispatch({ type: 'IMPORT_WAYPOINTS_CANCEL', driverNumber: driverNumberFieldValue }),
        [driverNumberFieldValue],
    )

    const isMobileDevice = isMobileFn().any

    const body = (
        <>
            <div className="text text-secondary" role="alert">
                Waypoints are imported from <a href="http://pickup.atripcocourier.com/ccwap/(S())/cc.aspx">Atripco</a>
            </div>
            <div className="input-row">
                <input
                    type="text"
                    placeholder="Driver number"
                    {...driverNumberFieldProps}
                    disabled={importInProgress}
                    autoFocus={!isMobileDevice}
                />
            </div>
            {waypoints.length > 0 && (
                <div className="text text-warning" role="alert">
                    Existing waypoints will be replaced
                </div>
            )}
        </>
    )

    const footer = importInProgress ? (
        <>
            <PrimaryButton disabled={true}>
                <i className="fas fa-fw fa-spin fa-circle-notch" /> Importing
            </PrimaryButton>
            <DangerButton onClick={cancelImport}>
                <i className="fas fa-ban" /> Cancel
            </DangerButton>
        </>
    ) : (
        <PrimaryButton onClick={importWaypoints} disabled={!driverNumberIsValid}>
            <i className="fas fa-fw fa-cloud-download-alt" /> Import
        </PrimaryButton>
    )

    return <WaypointEditorTemplate body={body} footer={footer} />
}