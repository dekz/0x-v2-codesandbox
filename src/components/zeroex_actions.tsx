import { ContractWrappers } from '0x.js';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import { Column, Columns, Content, Panel, PanelTabs, Subtitle } from 'bloomer';
import * as _ from 'lodash';
import * as React from 'react';

import { CancelOrder } from './zeroex_actions/cancel_order';
import { CreateOrder } from './zeroex_actions/create_order';
import { FillOrder } from './zeroex_actions/fill_order';
import { GetOrderInfo } from './zeroex_actions/order_info';
import { WrapEth } from './zeroex_actions/wrap_eth';

interface Props {
    contractWrappers: ContractWrappers;
    web3Wrapper: Web3Wrapper;
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

export class ZeroExActions extends React.Component<Props, ZeroExActionsState> {
    constructor(props: Props) {
        super(props);
        this.state = { selectedForm: FormType.CREATE };
    }
    public onTxSubmitted = async (txHash: string) => {
        this.props.toastManager.add(`Transaction Submitted: ${txHash}`, {
            appearance: 'success',
            autoDismiss: true,
        });
        const receipt = await this.props.web3Wrapper.awaitTransactionMinedAsync(txHash);
        const appearance = receipt.status === 1 ? 'success' : 'error';
        this.props.toastManager.add(`Transaction Mined: ${txHash}`, {
            appearance,
            autoDismiss: true,
        });
    }
    public render(): React.ReactNode {
        const { selectedForm } = this.state;
        let currentFormRender;
        switch (selectedForm) {
            case FormType.CREATE:
                currentFormRender = (
                    <CreateOrder
                        web3Wrapper={this.props.web3Wrapper}
                        contractWrappers={this.props.contractWrappers}
                        onTxSubmitted={this.onTxSubmitted}
                    />
                );
                break;
            case FormType.CANCEL:
                currentFormRender = (
                    <CancelOrder contractWrappers={this.props.contractWrappers} onTxSubmitted={this.onTxSubmitted} />
                );
                break;
            case FormType.FILL:
                currentFormRender = (
                    <FillOrder
                        contractWrappers={this.props.contractWrappers}
                        web3Wrapper={this.props.web3Wrapper}
                        onTxSubmitted={this.onTxSubmitted}
                    />
                );
                break;
            case FormType.WRAP_ETH:
                currentFormRender = (
                    <WrapEth
                        web3Wrapper={this.props.web3Wrapper}
                        contractWrappers={this.props.contractWrappers}
                        onTxSubmitted={this.onTxSubmitted}
                    />
                );
                break;
            case FormType.GET_ORDER_INFO:
                currentFormRender = (
                    <GetOrderInfo contractWrappers={this.props.contractWrappers} onTxSubmitted={this.onTxSubmitted} />
                );
                break;
            default:
                currentFormRender = <div />;
                break;
        }
        const panelTabsRender = _.map(Object.keys(FormType), formType => {
            const type = FormType[formType];
            const isActive = selectedForm === type;
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
                <p> Below are common examples of 0x.js actions you will come across when creating your dApp </p>
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
