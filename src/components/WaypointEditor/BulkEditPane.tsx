import isMobileFn from 'ismobilejs'
import React, { useCallback, useContext } from 'react'
import Textarea from 'react-textarea-autosize'
import { WaypointEditorTemplate } from '.'
import { AppStateContext } from '../../context/AppStateContext'
import { useInputField } from '../../hooks/useInputField'
import { EditorPane } from '../../redux/state'
import { createWaypointFromAddress } from '../../redux/util'
import { isValidAddress } from '../../redux/validator'
import { Button } from '../Button'

export const BulkEditPane = () => {
    const {
        state: {
            waypoints: { list: waypoints },
        },
        dispatch,
    } = useContext(AppStateContext)

    const {
        value: bulkEditFieldValue,
        changeHandler: handleBulkEditFieldChange,
        keyPressHandler: handleBulkEditFieldKeyPress,
    } = useInputField(waypoints.map(w => w.address).join('\n'), event => event.shiftKey && commitBulkEdit())

    const commitBulkEdit = useCallback(() => {
        const validAddresses = bulkEditFieldValue
            .split('\n')
            .filter(isValidAddress)
            .map(address => address.trim())

        dispatch({ type: 'REPLACE_WAYPOINTS', waypoints: validAddresses.map(createWaypointFromAddress) })
        dispatch({ type: 'SET_EDITOR_PANE', editorPane: EditorPane.List })
    }, [bulkEditFieldValue])

    const isMobileDevice = isMobileFn().any

    const body = (
        <>
            <div className="text text-secondary" role="alert">
                Enter one address per line
            </div>
            <div className="input-row">
                <Textarea
                    minRows={3}
                    onChange={handleBulkEditFieldChange}
                    onKeyPress={handleBulkEditFieldKeyPress}
                    value={bulkEditFieldValue}
                    autoFocus={!isMobileDevice}
                />
            </div>
        </>
    )

    const footer = (
        <div id="waypoint-editor-footer-items">
            <Button type="primary" onClick={commitBulkEdit}>
                <i className="fas fa-fw fa-save" /> Save
            </Button>
        </div>
    )

    return <WaypointEditorTemplate body={body} footer={footer} />
}
