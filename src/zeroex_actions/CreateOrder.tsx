import { ContractWrappers, assetDataUtils, signatureUtils } from '0x.js';
import { generatePseudoRandomSalt, orderHashUtils } from '@0xproject/order-utils';
import { Order, SignerType } from '@0xproject/types';
import { BigNumber } from 'bignumber.js';
import { Button, Control, Field, Input, PanelBlock, Select, TextArea } from 'bloomer';
import * as _ from 'lodash';
import * as React from 'react';
import { PanelBlockField } from '../helpers/PanelBlockField';
import { tokensByNetwork } from '../helpers/tokens';
import { Web3Wrapper } from '@0xproject/web3-wrapper';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

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
    signedOrder?: string;
    orderHash?: string;
}
export default class CreateOrder extends React.Component<Props, CreateOrderState> {
    constructor(props: Props) {
        super(props);
        this.state = { makerToken: 'ZRX', takerToken: 'WETH', makerAmount: '1', takerAmount: '1' };
    }
    createOrderTokenSelected = (symbol: string, maker: boolean) => {
        this.setState(prevState => {
            return maker ? { ...prevState, makerToken: symbol } : { ...prevState, takerToken: symbol };
        });
    };
    createOrderTokenTokenAmount = (amount: string, maker: boolean) => {
        this.setState(prevState => {
            return maker ? { ...prevState, makerAmount: amount } : { ...prevState, takerAmount: amount };
        });
    };
    createOrderClick = async () => {
        const { makerToken, makerAmount, takerToken, takerAmount } = this.state;
        const addresses = await this.props.web3Wrapper.getAvailableAddressesAsync();
        const account = addresses[0];
        const tokens = tokensByNetwork[42];
        const makerAssetData = assetDataUtils.encodeERC20AssetData(tokens[makerToken].address);
        const takerAssetData = assetDataUtils.encodeERC20AssetData(tokens[takerToken].address);
        const exchangeAddress = this.props.contractWrappers.exchange.getContractAddress();
        const order: Order = {
            senderAddress: NULL_ADDRESS,
            feeRecipientAddress: NULL_ADDRESS,
            makerAddress: account,
            takerAddress: NULL_ADDRESS,
            makerFee: new BigNumber(0),
            takerFee: new BigNumber(0),
            makerAssetAmount: new BigNumber(makerAmount),
            takerAssetAmount: new BigNumber(takerAmount),
            salt: generatePseudoRandomSalt(),
            expirationTimeSeconds: new BigNumber(Date.now() + 10 * 60 * 1000),
            makerAssetData,
            takerAssetData,
            exchangeAddress,
        };
        const orderHashHex = orderHashUtils.getOrderHashHex(order);
        const provider = this.props.web3Wrapper.getProvider();
        const signature = await signatureUtils.ecSignOrderHashAsync(
            provider,
            orderHashHex,
            account,
            SignerType.Metamask,
        );
        const signedOrderJSON = JSON.stringify({ ...order, signature }, null, 2);
        this.setState(prevState => {
            return { ...prevState, signedOrder: signedOrderJSON, orderHash: orderHashHex };
        });
        console.log('orderHash', orderHashHex);
        console.log(signedOrderJSON);
    };
    render() {
        const buildTokenSelector = (maker: boolean) => {
            const selected = maker ? this.state.makerToken : this.state.takerToken;
            return (
                <Select onChange={e => this.createOrderTokenSelected((e.target as any).value, maker)} value={selected}>
                    {_.map(Object.keys(tokensByNetwork[42]), token => {
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
                    <TextArea value={this.state.signedOrder} type="text" readOnly={true} />
                </PanelBlockField>
            </div>
        ) : (
            <div />
        );
        return (
            <div>
                <PanelBlock>
                    <div>
                        Creates a 0x order, specifying the Maker and Taker tokens and their amounts. Orders are signed
                        by the maker. Takers find these signed orders and "fill" them by submitting to the blockchain.
                    </div>
                </PanelBlock>
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
                {signedOrderRender}
                <PanelBlock>
                    <Button
                        onClick={() => this.createOrderClick()}
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
}
