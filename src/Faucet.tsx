import * as React from 'react';
import { ZeroEx } from '0x.js';
import { Button, Content, Subtitle, Control } from 'bloomer';

interface Props {
    zeroEx: ZeroEx;
}

export default class Faucet extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);
    }
    render() {
        return (
            <Content style={{ marginTop: '20px' }}>
                <Subtitle isSize={6}>Faucet</Subtitle>
                <p>
                    {' '}
                    Faucets will dispense ETH and ZRX tokens to your account on the test network. This will allow you to
                    begin exchanging ERC20 tokens.
                </p>
                <Control>
                    <Button isSize="small" id="dispenseETH" onClick={this.dispenseETH} isColor="primary">
                        Dispense ETH
                    </Button>
                    <Button
                        isSize="small"
                        style={{ marginLeft: '10px' }}
                        id="dispenseZRX"
                        onClick={this.dispenseZRX}
                        isColor="primary"
                    >
                        Dispense ZRX
                    </Button>
                </Control>
            </Content>
        );
    }
    dispenseZRX = async (): Promise<void> => {
        const addresses = await this.props.zeroEx.getAvailableAddressesAsync();
        const address = addresses[0];
        const url = `https://faucet.0xproject.com/zrx/${address}`;
        await fetch(url);
        console.log('Dispense ZRX requested');
    };
    dispenseETH = async (): Promise<void> => {
        const addresses = await this.props.zeroEx.getAvailableAddressesAsync();
        const address = addresses[0];
        const url = `https://faucet.0xproject.com/ether/${address}`;
        await fetch(url);
        console.log('Dispense ETH requested');
    };
    // private async orderWETH(): Promise<void> {
    //     const addresses = await this.props.zeroEx.getAvailableAddressesAsync();
    //     const address = addresses[0];
    //     const url = `https://faucet.0xproject.com/order/weth/${address}`;
    //     const response = await fetch(url);
    //     const bodyJson = await response.json();

    //     const signedOrder: SignedOrder = relayerResponseJsonParsers.parseOrderJson(bodyJson);
    //     console.log(signedOrder);

    //     const fillAmount = ZeroEx.toBaseUnitAmount(signedOrder.takerTokenAmount, 18);
    //     try {
    //         await this.props.zeroEx.exchange.fillOrderAsync(signedOrder, fillAmount, true, address);
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
}
