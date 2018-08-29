import { ContractWrappers, orderHashUtils, OrderInfo, OrderStatus } from '0x.js';
import { Button, Input, PanelBlock, TextArea } from 'bloomer';
import * as React from 'react';
import { PanelBlockField } from '../helpers/PanelBlockField';
import { parseJSONSignedOrder } from '../helpers/utils';
import { dispatch, actions } from 'codesandbox-api';

interface Props {
    contractWrappers: ContractWrappers;
    onTxSubmitted: (txHash: string) => void;
}

interface OrderInfoState {
    order?: string;
    orderInfo?: OrderInfo;
    orderHash?: string;
}

export default class GetOrderInfo extends React.Component<Props, OrderInfoState> {
    getInfoClick = async () => {
        const { order } = this.state;
        const { contractWrappers } = this.props;
        if (order) {
            // Parse the Order JSON into types (converting into BigNumber)
            const signedOrder = parseJSONSignedOrder(order);
            // Generate the Order Hash for the order
            const orderHashHex = orderHashUtils.getOrderHashHex(signedOrder);
            // call getOrderInfo on the Exchange contract
            const orderInfo = await contractWrappers.exchange.getOrderInfoAsync(signedOrder);
            this.setState(prev => {
                return { ...prev, orderHash: orderHashHex, orderInfo };
            });
        }
    };
    render() {
        const orderInfoRender =
            this.state && this.state.orderInfo ? (
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
                <PanelBlock>
                    <div>
                        Retrieve information about the Order from the Exchange contract.{' '}
                        <a onClick={() => dispatch(actions.editor.openModule('/src/zeroex_actions/OrderInfo.tsx', 20))}>
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
