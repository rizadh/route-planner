import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { useCompactMode } from '../hooks/useCompactMode'
import { AppAction } from '../redux/actionTypes'
import { AppState } from '../redux/state'
import { Button, PrimaryButton, WarningButton } from './Button'
import { InfoBar } from './InfoBar'
import { compactBreakpoint, editorWidth } from './styleVariables'

const Container = styled.div`
    position: absolute;
    top: 0;
    left: ${editorWidth}px;
    padding: var(--standard-margin);

    overflow: auto;
    -webkit-overflow-scrolling: touch;

    display: flex;

    &::-webkit-scrollbar {
        display: none;
    }

    @media (max-width: ${compactBreakpoint}px) {
        top: initial;
        left: 0;
        bottom: 0;

        #root:not(.editor-hidden) & {
            display: none;
        }
    }

    #root.editor-hidden & {
        left: 0;
    }

    > button {
        flex-shrink: 0;
        margin-right: calc(var(--standard-margin) / 2);
    }
`

export const MapButtons = () => {
    const autofitIsEnabled = useSelector((state: AppState) => state.autofitIsEnabled)
    const mutedMapIsEnabled = useSelector((state: AppState) => state.mutedMapIsEnabled)
    const editorIsHidden = useSelector((state: AppState) => state.editorIsHidden)
    const dispatch: Dispatch<AppAction> = useDispatch()
    const compactMode = useCompactMode()

    const enableAutofit = useCallback(() => dispatch({ type: 'ENABLE_AUTOFIT' }), [])
    const muteMap = useCallback(() => dispatch({ type: 'USE_MUTED_MAP' }), [])
    const unmuteMap = useCallback(() => dispatch({ type: 'USE_REGULAR_MAP' }), [])
    const showEditorPane = useCallback(() => dispatch({ type: 'SHOW_EDITOR_PANE' }), [])

    return (
        <Container>
            {editorIsHidden && (
                <Button onClick={showEditorPane}>
                    <InfoBar /> <i className={`fas fa-fw fa-chevron-${compactMode ? 'up' : 'right'}`} />
                </Button>
            )}
            {!compactMode &&
                (mutedMapIsEnabled ? (
                    <PrimaryButton onClick={unmuteMap}>
                        <i className="fas fa-fw fa-map-marked" /> Use Regular Map
                    </PrimaryButton>
                ) : (
                    <PrimaryButton onClick={muteMap}>
                        <i className="fas fa-fw fa-map" /> Use Muted Map
                    </PrimaryButton>
                ))}
            <WarningButton onClick={enableAutofit} disabled={autofitIsEnabled}>
                <i className="fas fa-fw fa-expand" />
                {!compactMode && ' Auto-Fit'}
            </WarningButton>
        </Container>
    )
}
