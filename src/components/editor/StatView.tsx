import React from 'react'

import styled from 'styled-components'

type StatViewProps = {
    title: string
    value: string
}

const Title = styled.span`
    color: var(--primary-text-color);
    font-weight: 500;
`

const Value = styled.span`
    color: var(--secondary-text-color);
`

const Spacer = styled.div`
    width: 8px;
    display: inline-block;
`

export const StatView = (props: StatViewProps) => (
    <div>
        <Title>{props.title}</Title>
        <Spacer />
        <Value>{props.value}</Value>
    </div>
)
