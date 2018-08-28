import { BigNumber, ContractWrappers, orderHashUtils, OrderStatus } from '0x.js';
import { Button, PanelBlock, TextArea } from 'bloomer';
import * as React from 'react';
import { PanelBlockField } from '../helpers/PanelBlockField';

interface Props {
    contractWrappers: ContractWrappers;
    onTxSubmitted: (txHash: string) => void;
}

interface CancelOrderState {
    order?: string;
}

export default class CancelOrder extends React.Component<Props, CancelOrderState> {
    cancelClick = async () => {
        const { order } = this.state;
        if (order) {
            const signedOrder = JSON.parse(order);
            signedOrder.salt = new BigNumber(signedOrder.salt);
            signedOrder.makerAssetAmount = new BigNumber(signedOrder.makerAssetAmount);
            signedOrder.takerAssetAmount = new BigNumber(signedOrder.takerAssetAmount);
            signedOrder.makerFee = new BigNumber(signedOrder.makerFee);
            signedOrder.takerFee = new BigNumber(signedOrder.takerFee);
            signedOrder.expirationTimeSeconds = new BigNumber(signedOrder.expirationTimeSeconds);
            const orderHashHex = orderHashUtils.getOrderHashHex(signedOrder);
            const orderInfo = await this.props.contractWrappers.exchange.getOrderInfoAsync(signedOrder);
            if (orderInfo.orderStatus == OrderStatus.FILLABLE) {
                const txHash = await this.props.contractWrappers.exchange.cancelOrderAsync(signedOrder);
                this.props.onTxSubmitted(txHash);
            } else {
                console.log('Order already filled or cancelled: ', orderHashHex);
            }
        }
    };
    render() {
        return (
            <div>
                <PanelBlock>
                    <div>Orders must be cancelled on-chain (or their specified expiry time passes).</div>
                </PanelBlock>
                <PanelBlockField label="Order">
                    <TextArea
                        type="text"
                        placeholder="Order"
                        onChange={e => {
                            const value = (e.target as any).value;
                            this.setState(prevState => {
                                return { ...prevState, order: value };
                            });
                        }}
                    />
                </PanelBlockField>
                <PanelBlock>
                    <Button
                        onClick={() => this.cancelClick()}
                        isFullWidth={true}
                        isSize="small"
                        isColor="primary"
                        id="personalSignButton"
                    >
                        Cancel Order
                    </Button>
                </PanelBlock>
            </div>
        );
    }
}
