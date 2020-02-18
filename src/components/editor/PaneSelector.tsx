import React, { ButtonHTMLAttributes, Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { useCompactMode } from '../../hooks/useCompactMode'
import { AppAction } from '../../redux/actionTypes'
import { AppState, EditorPane } from '../../redux/state'
import { PrimaryButton, SecondaryButton } from '../common/Button'

const Wrapper = styled.div`
    margin: var(--standard-margin);
    clear: both;
`

const Container = styled.div`
    margin: calc(var(--standard-margin) / -4);
`

type SelectorButtonProps = {
    pane: EditorPane;
} & ButtonHTMLAttributes<HTMLButtonElement>

const SelectorButton = ({ pane, ...props }: SelectorButtonProps) => {
    const selected = useSelector((state: AppState) => state.editorPane === pane)
    const paneIsBusy = useSelector(
        ({ importInProgress, optimizationInProgress }: AppState) => importInProgress || optimizationInProgress,
    )
    const dispatch: Dispatch<AppAction> = useDispatch()
    const setPane = useCallback(() => dispatch({ type: 'SET_EDITOR_PANE', editorPane: pane }), [])

    const Button = selected ? PrimaryButton : SecondaryButton

    return <Button {...props} disabled={paneIsBusy} onClick={selected ? undefined : setPane} />
}

const StyledSelectorButton = styled(SelectorButton)`
    margin: calc(var(--standard-margin) / 4);

    line-height: 1;
`

export const PaneSelector = () => {
    const compactMode = useCompactMode()

    return (
        <Wrapper>
            <Container>
                <StyledSelectorButton pane={EditorPane.Waypoints}>
                    <i className="fas fa-fw fa-stream" />
                    {!compactMode && ' Waypoints'}
                </StyledSelectorButton>
                <StyledSelectorButton pane={EditorPane.BulkEdit}>
                    <i className="fas fa-fw fa-pencil-alt" />
                    {!compactMode && ' Bulk Edit'}
                </StyledSelectorButton>
                <StyledSelectorButton pane={EditorPane.Navigate}>
                    <i className="fas fa-fw fa-directions" />
                    {!compactMode && ' Navigate'}
                </StyledSelectorButton>
                <StyledSelectorButton pane={EditorPane.Import}>
                    <i className="fas fa-fw fa-arrow-alt-circle-down" />
                    {!compactMode && ' Import'}
                </StyledSelectorButton>
                <StyledSelectorButton pane={EditorPane.Optimize}>
                    <i className="fas fa-fw fa-star-half-alt" />
                    {!compactMode && ' Optimize'}
                </StyledSelectorButton>
            </Container>
        </Wrapper>
    )
}
