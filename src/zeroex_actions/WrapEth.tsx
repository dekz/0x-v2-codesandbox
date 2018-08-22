import { ZeroEx } from '0x.js';
import { BigNumber } from '@0xproject/utils';
import { Button, Control, Field, Input, PanelBlock } from 'bloomer';
import * as React from 'react';
import { PanelBlockField } from '../helpers/PanelBlockField';
import { tokensByNetwork } from '../helpers/tokens';

interface Props {
    zeroEx: ZeroEx;
    onTxSubmitted: (txHash: string) => void;
}

interface WrapEthState {
    amount: string;
}
export default class WrapEth extends React.Component<Props, WrapEthState> {
    constructor(props: Props) {
        super(props);
        this.state = { amount: '1' };
    }
    wrapEthClick = async (wrap: boolean) => {
        const { zeroEx } = this.props;
        const addresses = await zeroEx.getAvailableAddressesAsync();
        const account = addresses[0];
        const tokens = tokensByNetwork[42];
        const etherTokenAddress = tokens['WETH'].address;
        const amount = new BigNumber(1);
        const txHash = wrap
            ? await zeroEx.etherToken.depositAsync(etherTokenAddress, amount, account)
            : await zeroEx.etherToken.withdrawAsync(etherTokenAddress, amount, account);
        this.props.onTxSubmitted(txHash);
    };
    render() {
        return (
            <div>
                <PanelBlock>
                    <div>
                        Since ETH is not an ERC20 token it needs to first be wrapped to be exchanged on 0x. ETH can be
                        wrapped to become wETH and wETH can be unwrapped get back to ETH
                    </div>
                </PanelBlock>
                <PanelBlockField label="Amount">
                    <Input
                        type="text"
                        placeholder="1"
                        value={this.state.amount}
                        onChange={e => this.setState({ amount: (e.target as any).value })}
                    />
                </PanelBlockField>
                <PanelBlock>
                    <Field isGrouped={true} isHorizontal={true}>
                        <Control>
                            <Button
                                style={{ marginRight: '10px' }}
                                onClick={() => this.wrapEthClick(true)}
                                isSize="small"
                                isColor="primary"
                                id="wrap"
                            >
                                Wrap
                            </Button>
                            <Button
                                onClick={() => this.wrapEthClick(false)}
                                isSize="small"
                                isColor="primary"
                                id="unwrap"
                            >
                                Unwrap
                            </Button>
                        </Control>
                    </Field>
                </PanelBlock>
            </div>
        );
    }
}
