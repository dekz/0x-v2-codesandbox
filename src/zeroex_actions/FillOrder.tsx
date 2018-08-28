import { BigNumber, ContractWrappers, SignedOrder } from '0x.js';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import { Button, PanelBlock, TextArea } from 'bloomer';
import * as React from 'react';
import { PanelBlockField } from '../helpers/PanelBlockField';

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
        const addresses = await this.props.web3Wrapper.getAvailableAddressesAsync();
        const account = addresses[0];
        const txHash = await this.props.contractWrappers.exchange.fillOrderAsync(
            signedOrder,
            signedOrder.takerAssetAmount,
            account,
        );
        return txHash;
    };
    fillOrderClick = async () => {
        const signedOrderJSON = this.state.signedOrder;
        if (signedOrderJSON) {
            const signedOrder = JSON.parse(signedOrderJSON);
            signedOrder.salt = new BigNumber(signedOrder.salt);
            signedOrder.makerAssetAmount = new BigNumber(signedOrder.makerAssetAmount);
            signedOrder.takerAssetAmount = new BigNumber(signedOrder.takerAssetAmount);
            signedOrder.makerFee = new BigNumber(signedOrder.makerFee);
            signedOrder.takerFee = new BigNumber(signedOrder.takerFee);
            signedOrder.expirationTimeSeconds = new BigNumber(signedOrder.expirationTimeSeconds);
            const txHash = await this.fillOrder(signedOrder as SignedOrder);
            this.props.onTxSubmitted(txHash);
        }
    };
    render() {
        return (
            <div>
                <PanelBlock>
                    <div>
                        Orders are filled when a taker submits them to the blockchain. This example executes a
                        fillOrder, filling the entire amount of the order.
                    </div>
                </PanelBlock>
                <PanelBlockField label="Order">
                    <TextArea
                        type="text"
                        placeholder="Order Details"
                        onChange={e => {
                            const value = (e.target as any).value;
                            this.setState(prev => {
                                return { ...prev, signedOrder: value };
                            });
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
}
