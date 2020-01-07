import isMobileFn from 'ismobilejs'
import React, { useCallback, useContext } from 'react'
import { WaypointEditorTemplate } from '.'
import { AppStateContext } from '../../context/AppStateContext'
import { useInputField } from '../../hooks/useInputField'
import { Button } from '../Button'

export const ImportPane = () => {
    const {
        state: { importInProgress, waypoints },
        dispatch,
    } = useContext(AppStateContext)

    const {
        value: driverNumberFieldValue,
        changeHandler: handleDriverNumberFieldChange,
        keyPressHandler: handleDriverNumberFieldKeyPress,
    } = useInputField('', () => driverNumberFieldValue.length && importWaypoints())

    const importWaypoints = useCallback(
        () => dispatch({ type: 'IMPORT_WAYPOINTS', driverNumber: driverNumberFieldValue }),
        [driverNumberFieldValue],
    )

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
                    value={driverNumberFieldValue}
                    onChange={handleDriverNumberFieldChange}
                    onKeyPress={handleDriverNumberFieldKeyPress}
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
            <Button type="primary" disabled={true}>
                <i className="fas fa-fw fa-spin fa-circle-notch" /> Importing
            </Button>
            <Button type="danger" onClick={cancelImport}>
                <i className="fas fa-ban" /> Cancel
            </Button>
        </>
    ) : (
        <Button type="primary" onClick={importWaypoints} disabled={!driverNumberFieldValue.length}>
            <i className="fas fa-fw fa-cloud-download-alt" /> Import
        </Button>
    )

    return <WaypointEditorTemplate body={body} footer={footer} />
}
