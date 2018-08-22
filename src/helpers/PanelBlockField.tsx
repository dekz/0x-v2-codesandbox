import { Field, FieldBody, FieldLabel, Label, PanelBlock } from 'bloomer';
import * as React from 'react';

export class PanelBlockField extends React.Component<{ label: string }, {}> {
    render() {
        return (
            <PanelBlock>
                <Field isHorizontal={true}>
                    <FieldLabel>
                        <Label>{this.props.label}</Label>
                    </FieldLabel>
                    <FieldBody>{this.props.children}</FieldBody>
                </Field>
            </PanelBlock>
        );
    }
}
