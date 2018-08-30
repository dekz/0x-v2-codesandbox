import {
    assetDataUtils,
    BigNumber,
    ContractWrappers,
    generatePseudoRandomSalt,
    Order,
    orderHashUtils,
    signatureUtils,
    SignedOrder,
    SignerType,
} from '0x.js';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import { Button, Control, Field, Input, PanelBlock, Select, TextArea } from 'bloomer';
import { actions, dispatch } from 'codesandbox-api';
import * as _ from 'lodash';
import * as React from 'react';

import { tokens, tokensByNetwork } from '../../tokens';
import { NULL_ADDRESS, ZERO } from '../../utils';
import { PanelBlockField } from '../panel_block_field';

interface Props {
    contractWrappers: ContractWrappers;
    web3Wrapper: Web3Wrapper;
    onTxSubmitted: (txHash: string) => void;
}
interface CreateOrderState {
    makerToken: string;
    takerToken: string;
    makerAmount: string;
    takerAmount: string;
    signedOrder?: SignedOrder;
    orderHash?: string;
}

export class CreateOrder extends React.Component<Props, CreateOrderState> {
    constructor(props: Props) {
        super(props);
        this.state = {
            makerToken: tokens.ZRX.symbol,
            takerToken: tokens.WETH.symbol,
            makerAmount: '1',
            takerAmount: '1',
        };
    }
    public createOrder = async (): Promise<SignedOrder> => {
        const { makerToken, makerAmount, takerToken, takerAmount } = this.state;
        const { web3Wrapper, contractWrappers } = this.props;
        // Query the available addresses
        const addresses = await web3Wrapper.getAvailableAddressesAsync();
        // Retrieve the network for the correct token addresses
        const networkId = await web3Wrapper.getNetworkIdAsync();
        // Use the first account as the maker
        const makerAddress = addresses[0];
        const tokensForNetwork = tokensByNetwork[networkId];
        // Encode the selected makerToken as assetData for 0x
        const makerAssetData = assetDataUtils.encodeERC20AssetData(tokensForNetwork[makerToken].address);
        // Encode the selected takerToken as assetData for 0x
        const takerAssetData = assetDataUtils.encodeERC20AssetData(tokensForNetwork[takerToken].address);
        const exchangeAddress = contractWrappers.exchange.getContractAddress();
        // Create the order
        const order: Order = {
            makerAddress, // maker is the first address
            takerAddress: NULL_ADDRESS, // taker is open and can be filled by anyone
            makerAssetAmount: new BigNumber(makerAmount), // The maker token amount
            takerAssetAmount: new BigNumber(takerAmount), // The taker token amount
            expirationTimeSeconds: new BigNumber(Date.now() + 10 * 60), // Time when this order expires
            makerFee: ZERO, // 0 maker fees
            takerFee: ZERO, // 0 taker fees
            feeRecipientAddress: NULL_ADDRESS, // No fee recipient
            senderAddress: NULL_ADDRESS, // Sender address is open and can be submitted by anyone
            salt: generatePseudoRandomSalt(), // Random value to provide uniqueness
            makerAssetData,
            takerAssetData,
            exchangeAddress,
        };
        // Generate the order hash for the order
        const orderHashHex = orderHashUtils.getOrderHashHex(order);
        const provider = web3Wrapper.getProvider();
        // The maker signs the order as a proof
        const signature = await signatureUtils.ecSignOrderHashAsync(
            provider,
            orderHashHex,
            makerAddress,
            SignerType.Metamask,
        );
        const signedOrder = { ...order, signature };
        // Store the signed Order
        this.setState(prevState => {
            return { ...prevState, signedOrder, orderHash: orderHashHex };
        });
        console.log('orderHash', orderHashHex);
        console.log(JSON.stringify(signedOrder, null, 2));

        return signedOrder;
    }
    public render(): React.ReactNode {
        const buildTokenSelector = (maker: boolean) => {
            const selected = maker ? this.state.makerToken : this.state.takerToken;
            console.log(Object.keys(tokens));
            console.log(selected);
            return (
                <Select onChange={e => this.createOrderTokenSelected((e.target as any).value, maker)} value={selected}>
                    {_.map(Object.keys(tokens), token => {
                        return (
                            <option key={`${token}${maker}`} value={token}>
                                {token}
                            </option>
                        );
                    })}
                </Select>
            );
        };
        const signedOrderRender = this.state.signedOrder ? (
            <div>
                <PanelBlockField label="Order Hash">
                    <Input value={this.state.orderHash} readOnly={true} />
                </PanelBlockField>
                <PanelBlockField label="Signed Order">
                    <TextArea value={JSON.stringify(this.state.signedOrder, null, 2)} type="text" readOnly={true} />
                </PanelBlockField>
            </div>
        ) : (
            <div />
        );
        const makerTokenRender = (
            <PanelBlockField label="Maker Token">
                <Field hasAddons={true}>
                    <Control>{buildTokenSelector(true)}</Control>
                    <Input
                        onChange={e => this.createOrderTokenTokenAmount((e.target as any).value, true)}
                        value={this.state.makerAmount}
                        type="text"
                        placeholder="Amount"
                    />
                </Field>
            </PanelBlockField>
        );
        const takerTokenRender = (
            <PanelBlockField label="Taker Token">
                <Field hasAddons={true}>
                    <Control>{buildTokenSelector(false)}</Control>
                    <Control isExpanded={true}>
                        <Input
                            onChange={e => this.createOrderTokenTokenAmount((e.target as any).value, false)}
                            value={this.state.takerAmount}
                            type="text"
                            placeholder="Amount"
                        />
                    </Control>
                </Field>
            </PanelBlockField>
        );
        return (
            <div>
                <PanelBlock>
                    <div>
                        Creates a 0x order, specifying the Maker and Taker tokens and their amounts. Orders are signed
                        by the maker. Takers find these signed orders and "fill" them by submitting to the blockchain.{' '}
                        <a
                            onClick={() =>
                                dispatch(actions.editor.openModule('/src/zeroex_actions/CreateOrder.tsx', 40))
                            }
                        >
                            View the code
                        </a>
                        .
                    </div>
                </PanelBlock>
                {makerTokenRender}
                {takerTokenRender}
                {signedOrderRender}
                <PanelBlock>
                    <Button
                        onClick={this.createOrder}
                        isFullWidth={true}
                        isSize="small"
                        isColor="primary"
                        id="signOrder"
                    >
                        Sign Order
                    </Button>
                </PanelBlock>
            </div>
        );
    }
    public createOrderTokenSelected = (symbol: string, maker: boolean) => {
        this.setState(prevState => {
            return maker ? { ...prevState, makerToken: symbol } : { ...prevState, takerToken: symbol };
        });
    }
    public createOrderTokenTokenAmount = (amount: string, maker: boolean) => {
        this.setState(prevState => {
            return maker ? { ...prevState, makerAmount: amount } : { ...prevState, takerAmount: amount };
        });
    }
}
