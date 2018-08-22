import { OrderInfo, ZeroEx } from '0x.js';
import { OrderStatus } from '@0xproject/contract-wrappers';
import { orderHashUtils } from '@0xproject/order-utils';
import { BigNumber } from '@0xproject/utils';
import { Button, Input, PanelBlock, TextArea } from 'bloomer';
import * as React from 'react';
import { PanelBlockField } from '../helpers/PanelBlockField';

interface Props {
    zeroEx: ZeroEx;
    onTxSubmitted: (txHash: string) => void;
}

interface OrderInfoState {
    order?: string;
    orderInfo?: OrderInfo;
    orderHash?: string;
}

export default class GetOrderInfo extends React.Component<Props, OrderInfoState> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }
    getInfoClick = async () => {
        const { zeroEx } = this.props;
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
            const orderInfo = await zeroEx.exchange.getOrderInfoAsync(signedOrder);
            this.setState(prev => {
                return { ...prev, orderHash: orderHashHex, orderInfo };
            });
        }
    };
    render() {
        const orderInfoRender = this.state.orderInfo ? (
            <div>
                <PanelBlockField label="Hash">
                    <Input value={this.state.orderHash} readOnly={true} />
                </PanelBlockField>
                <PanelBlockField label="Status">{OrderStatus[this.state.orderInfo.orderStatus]}</PanelBlockField>
                <PanelBlockField label="Filled Amount">
                    {this.state.orderInfo.orderTakerAssetFilledAmount.toString()}
                </PanelBlockField>
            </div>
        ) : (
            <div />
        );
        return (
            <div>
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
                {orderInfoRender}
                <PanelBlock>
                    <Button
                        onClick={() => this.getInfoClick()}
                        isFullWidth={true}
                        isSize="small"
                        isColor="primary"
                        id="getOrderInfo"
                    >
                        Get Order Info
                    </Button>
                </PanelBlock>
            </div>
        );
    }
}
