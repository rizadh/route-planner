import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { animated, useSpring } from 'react-spring'
import styled from 'styled-components'
import { appVersion } from '../..'
import { useCompactMode } from '../../hooks/useCompactMode'
import { AppAction } from '../../redux/actionTypes'
import { AppState, attributesForEditorPane, EditorPane } from '../../redux/state'
import { Alert } from '../common/Alert'
import { Button, Variant } from '../common/Button'
import { InputRow } from '../common/InputRow'
import { Link } from '../common/Link'
import compactBreakpoint from '../constants/compactBreakpoint'
import { InfoBar } from './InfoBar'
import { BulkEditPane } from './panes/BulkEditPane'
import { ImportPane } from './panes/ImportPane'
import { NavigatePane } from './panes/NavigatePane'
import { OptimizePane } from './panes/OptimizePane'
import { ExportPane } from './panes/ExportPane'
import { WaypointsPane } from './panes/WaypointsPane'
import { PaneSelector } from './PaneSelector'

const Container = animated(styled.div`
    position: absolute;
    width: 420px;
    height: 100%;
    display: flex;
    flex-direction: column;

    background-color: var(--primary-fill-color);

    ${InfoBar.Container} {
        flex-shrink: 0;
    }

    @media (max-width: ${compactBreakpoint}px) {
        width: 100%;

        border: none;
    }
`)

const Header = styled.div`
    top: 0;
    flex-shrink: 0;

    border-bottom: var(--standard-border);
    border-right: var(--standard-border);

    @media (max-width: ${compactBreakpoint}px) {
        border-right: none;
    }

    background-color: var(--secondary-fill-color);
`

export const Body = styled.div`
    padding: calc(var(--standard-margin) / 2);

    overflow: auto;
    -webkit-overflow-scrolling: touch;

    border-right: var(--standard-border);

    @media (max-width: ${compactBreakpoint}px) {
        border-right: none;
    }

    > ${Alert}, ${InputRow} {
        padding: calc(var(--standard-margin) / 2);
    }
`

export const Footer = styled.div`
    bottom: 0;
    flex-shrink: 0;
    flex-grow: 1;

    border-top: var(--standard-border);
    border-right: var(--standard-border);
    border-bottom: var(--standard-border);

    @media (max-width: ${compactBreakpoint}px) {
        border-right: none;
    }

    padding: calc(var(--standard-margin) / 2);

    background-color: var(--secondary-fill-color);

    button,
    ${InputRow} {
        margin: calc(var(--standard-margin) / 2);
    }

    ${InputRow} button {
        margin: initial;
    }
`

const HideButton = styled(Button)`
    float: right;
    margin: var(--standard-margin);
`

const AppTitle = styled.div`
    font-size: 24px;
    font-weight: 500;

    margin: var(--standard-margin);
`

const AppVersion = styled.div`
    font-size: 16px;
    color: var(--secondary-text-color);
`

export const Editor = () => {
    const editorIsHidden = useSelector((state: AppState) => state.editorIsHidden)
    const editorPane = useSelector((state: AppState) => state.editorPane)
    const title = attributesForEditorPane(editorPane).displayName
    const compactMode = useCompactMode()

    const dispatch: Dispatch<AppAction> = useDispatch()
    const hideEditorPane = useCallback(() => dispatch({ type: 'HIDE_EDITOR_PANE' }), [dispatch])

    const props = useSpring({
        transform: `translateX(${editorIsHidden ? -100 : 0}%)`,
        config: { mass: 1, tension: 350, friction: 35 },
    })

    return (
        <Container style={props}>
            <Header>
                <HideButton title="Minimize editor" onClick={hideEditorPane} variant={Variant.Primary}>
                    {compactMode ? (
                        <i className="fas fa-fw fa-map-marked" />
                    ) : (
                        <i className="fas fa-fw fa-chevron-left" />
                    )}
                </HideButton>

                <AppTitle>
                    {compactMode ? title : 'QuickRoute'}
                    <AppVersion>
                        {compactMode ? 'QuickRoute' : `v${appVersion}`} by{' '}
                        <Link href="https://github.com/rizadh">@rizadh</Link>
                    </AppVersion>
                </AppTitle>
                <PaneSelector />
            </Header>
            <Content />
            <InfoBar />
        </Container>
    )
}

const Content = () => {
    const editorPane = useSelector((state: AppState) => state.editorPane)

    switch (editorPane) {
        case EditorPane.Waypoints:
            return <WaypointsPane />
        case EditorPane.Navigate:
            return <NavigatePane />
        case EditorPane.BulkEdit:
            return <BulkEditPane />
        case EditorPane.Import:
            return <ImportPane />
        case EditorPane.Optimize:
            return <OptimizePane />
        case EditorPane.Export:
            return <ExportPane />
    }
}
