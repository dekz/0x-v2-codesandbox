import { BigNumber, ContractWrappers } from '0x.js';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import { Button, Control, Field, Input, PanelBlock } from 'bloomer';
import { actions, dispatch } from 'codesandbox-api';
import * as React from 'react';

import { PanelBlockField } from '../panel_block_field';

interface Props {
    contractWrappers: ContractWrappers;
    web3Wrapper: Web3Wrapper;
    onTxSubmitted: (txHash: string) => void;
}
interface WrapEthState {
    amount: string;
}

export class WrapEth extends React.Component<Props, WrapEthState> {
    constructor(props: Props) {
        super(props);
        this.state = { amount: '1' };
    }
    public wrapOrUnwrapEthAsync = async (wrap: boolean) => {
        const { web3Wrapper, contractWrappers, onTxSubmitted } = this.props;
        const { amount } = this.state;
        // Retrieve the ether token address
        const etherTokenAddress = contractWrappers.etherToken.getContractAddressIfExists();
        if (etherTokenAddress) {
            // List all of the available addresses
            const addresses = await web3Wrapper.getAvailableAddressesAsync();
            // The first address is one the which deposits or withdraws Eth
            const account = addresses[0];
            const weiAmount = new BigNumber(amount);
            // Call deposit or withdraw on the ethertoken
            const txHash = wrap
                ? await contractWrappers.etherToken.depositAsync(etherTokenAddress, weiAmount, account)
                : await contractWrappers.etherToken.withdrawAsync(etherTokenAddress, weiAmount, account);
            onTxSubmitted(txHash);
        }
    }
    public render(): React.ReactNode {
        return (
            <div>
                <PanelBlock>
                    <div>
                        ETH is not an ERC20 token and it must first be wrapped to be used in 0x. ETH can be wrapped to
                        become wETH and wETH can be unwrapped retrieve ETH.{' '}
                        <a
                            onClick={() =>
                                dispatch(actions.editor.openModule('/src/components/zeroex_actions/wrap_eth.tsx', 23))
                            }
                        >
                            View the code
                        </a>
                        .
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
                                onClick={this.wrapEth}
                                isSize="small"
                                isColor="primary"
                                id="wrap"
                            >
                                Wrap
                            </Button>
                            <Button onClick={this.unwrapEth} isSize="small" isColor="primary" id="unwrap">
                                Unwrap
                            </Button>
                        </Control>
                    </Field>
                </PanelBlock>
            </div>
        );
    }
    public wrapEth = async () => this.wrapOrUnwrapEthAsync(true);
    public unwrapEth = async () => this.wrapOrUnwrapEthAsync(false);
}
