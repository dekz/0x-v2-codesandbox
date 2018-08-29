import { ContractWrappers, SignedOrder } from '0x.js';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import { Button, PanelBlock, TextArea } from 'bloomer';
import { actions, dispatch } from 'codesandbox-api';
import * as React from 'react';
import { PanelBlockField } from '../helpers/PanelBlockField';
import { parseJSONSignedOrder } from '../helpers/utils';

interface Props {
    contractWrappers: ContractWrappers;
    web3Wrapper: Web3Wrapper;
    onTxSubmitted: (txHash: string) => void;
}
interface FillOrderState {
    signedOrder?: string;
}

export default class FillOrder extends React.Component<Props, FillOrderState> {
    fillOrder = async (signedOrder: SignedOrder): Promise<string> => {
        const { web3Wrapper, contractWrappers } = this.props;
        // Query all available addresses
        const addresses = await web3Wrapper.getAvailableAddressesAsync();
        // Taker is the first address
        const takerAddress = addresses[0];
        const takerFillAmount = signedOrder.takerAssetAmount;
        // Call fillOrder on the Exchange contract
        const txHash = await contractWrappers.exchange.fillOrderAsync(signedOrder, takerFillAmount, takerAddress);
        return txHash;
    };
    render() {
        return (
            <div>
                <PanelBlock>
                    <div>
                        Orders are filled when a taker submits them to the blockchain. This example executes a
                        fillOrder, filling the entire amount of the order.{' '}
                        <a onClick={() => dispatch(actions.editor.openModule('/src/zeroex_actions/FillOrder.tsx', 19))}>
                            View the code
                        </a>
                        .
                    </div>
                </PanelBlock>
                <PanelBlockField label="Order">
                    <TextArea
                        type="text"
                        placeholder="Order"
                        onChange={e => {
                            const value = (e.target as any).value;
                            this.setState(prev => ({ ...prev, signedOrder: value }));
                        }}
                    />
                </PanelBlockField>
                <PanelBlock>
                    <Button
                        onClick={this.fillOrderClick}
                        isFullWidth={true}
                        isSize="small"
                        isColor="primary"
                        id="fillOrder"
                    >
                        Fill Order
                    </Button>
                </PanelBlock>
            </div>
        );
    }
    fillOrderClick = async () => {
        const signedOrderJSON = this.state.signedOrder;
        if (signedOrderJSON) {
            const signedOrder = parseJSONSignedOrder(signedOrderJSON);
            const txHash = await this.fillOrder(signedOrder);
            this.props.onTxSubmitted(txHash);
        }
    };
}
