import { ContractWrappers, orderHashUtils, OrderStatus } from '0x.js';
import { Button, PanelBlock, TextArea } from 'bloomer';
import { actions, dispatch } from 'codesandbox-api';
import * as React from 'react';

import { parseJSONSignedOrder } from '../../utils';
import { PanelBlockField } from '../panel_block_field';

interface Props {
    contractWrappers: ContractWrappers;
    onTxSubmitted: (txHash: string) => void;
}

interface CancelOrderState {
    order?: string;
}

export class CancelOrder extends React.Component<Props, CancelOrderState> {
    public cancelOrderAsync = async () => {
        const { order } = this.state;
        const { contractWrappers, onTxSubmitted } = this.props;
        if (order) {
            // Parse the Order JSON into types (converting into BigNumber)
            const signedOrder = parseJSONSignedOrder(order);
            // Retrieve the order info, only cancel fillable orders
            const orderInfo = await contractWrappers.exchange.getOrderInfoAsync(signedOrder);
            if (orderInfo.orderStatus === OrderStatus.FILLABLE) {
                // Call Cancel Order on the Exchange contract
                const txHash = await contractWrappers.exchange.cancelOrderAsync(signedOrder);
                onTxSubmitted(txHash);
            } else {
                // Generate the Order Hash for this order
                const orderHashHex = orderHashUtils.getOrderHashHex(signedOrder);
                console.log('Order already filled or cancelled: ', orderHashHex);
            }
        }
    }
    public render(): React.ReactNode {
        return (
            <div>
                <PanelBlock>
                    <div>
                        Orders must be cancelled on-chain (or their specified expiry time passes).{' '}
                        <a
                            onClick={() =>
                                dispatch(actions.editor.openModule('/src/zeroex_actions/CancelOrder.tsx', 18))
                            }
                        >
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
                <PanelBlock>
                    <Button
                        onClick={this.cancelOrderAsync}
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
