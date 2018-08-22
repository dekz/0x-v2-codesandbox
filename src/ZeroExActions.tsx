import { ZeroEx } from '0x.js';
import { Column, Columns, Content, Panel, PanelTabs, Subtitle } from 'bloomer';
import * as _ from 'lodash';
import * as React from 'react';
import CancelOrder from './zeroex_actions/CancelOrder';
import CreateOrder from './zeroex_actions/CreateOrder';
import FillOrder from './zeroex_actions/FillOrder';
import WrapEth from './zeroex_actions/WrapEth';
import GetOrderInfo from './zeroex_actions/OrderInfo';

interface Props {
    zeroEx: ZeroEx;
    toastManager: { add: (msg: string, appearance: {}) => void };
}

enum FormType {
    CREATE = 'Create',
    FILL = 'Fill',
    CANCEL = 'Cancel',
    WRAP_ETH = 'Wrap ETH',
    GET_ORDER_INFO = 'Order Info',
}
interface ZeroExActionsState {
    selectedForm: FormType;
}

export default class ZeroExActions extends React.Component<Props, ZeroExActionsState> {
    constructor(props: Props) {
        super(props);
        this.state = { selectedForm: FormType.CREATE };
    }
    onTxSubmitted = async (txHash: string) => {
        this.props.toastManager.add(`Transaction Submitted: ${txHash}`, {
            appearance: 'success',
            autoDismiss: true,
        });
        const receipt = await this.props.zeroEx.awaitTransactionMinedAsync(txHash);
        const appearance = receipt.status == 1 ? 'success' : 'error';
        this.props.toastManager.add(`Transaction Mined: ${txHash}`, {
            appearance,
            autoDismiss: true,
        });
    };
    render() {
        const { selectedForm } = this.state;
        let currentFormRender;
        switch (selectedForm) {
            case FormType.CREATE:
                currentFormRender = <CreateOrder zeroEx={this.props.zeroEx} onTxSubmitted={this.onTxSubmitted} />;
                break;
            case FormType.CANCEL:
                currentFormRender = <CancelOrder zeroEx={this.props.zeroEx} onTxSubmitted={this.onTxSubmitted} />;
                break;
            case FormType.FILL:
                currentFormRender = <FillOrder zeroEx={this.props.zeroEx} onTxSubmitted={this.onTxSubmitted} />;
                break;
            case FormType.WRAP_ETH:
                currentFormRender = <WrapEth zeroEx={this.props.zeroEx} onTxSubmitted={this.onTxSubmitted} />;
                break;
            case FormType.GET_ORDER_INFO:
                currentFormRender = <GetOrderInfo zeroEx={this.props.zeroEx} onTxSubmitted={this.onTxSubmitted} />;
                break;
            default:
                currentFormRender = <div />;
                break;
        }
        const panelTabsRender = _.map(Object.keys(FormType), formType => {
            const type = FormType[formType];
            const isActive = selectedForm == type;
            const className = isActive ? 'is-active' : '';
            return (
                <a key={type} onClick={() => this.setState({ selectedForm: type })} className={className}>
                    {type}
                </a>
            );
        });
        return (
            <Content>
                <Subtitle isSize={6}>Try 0x.js</Subtitle>
                <p> These are examples of 0x.js actions you may come across when creating your dApp </p>
                <Columns>
                    <Column isSize={{ mobile: 11, default: 7 }}>
                        <Panel>
                            <PanelTabs>{panelTabsRender}</PanelTabs>
                            {currentFormRender}
                        </Panel>
                    </Column>
                </Columns>
            </Content>
        );
    }
}
