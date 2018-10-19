import { ContractWrappers } from '@0x/contract-wrappers';
import { MetamaskSubprovider, RPCSubprovider, SignerSubprovider, Web3ProviderEngine } from '@0x/subproviders';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { Content, Footer } from 'bloomer';
import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ToastProvider, withToastManager } from 'react-toast-notifications';

import { Account } from './components/account';
import { Faucet } from './components/faucet';
import { InstallMetamask } from './components/install_metamask';
import { Nav } from './components/nav';
import { Welcome } from './components/welcome';
import { ZeroExActions } from './components/zeroex_actions';

interface AppState {
    web3Wrapper?: Web3Wrapper;
    contractWrappers?: ContractWrappers;
    web3?: any;
}
const networkIdToRPCURI = {
    1: 'https://mainnet.infura.io',
    3: 'https://ropsten.infura.io',
    42: 'https://kovan.infura.io',
};

export class MainApp extends React.Component<{}, AppState> {
    public componentDidMount(): void {
        const web3 = (window as any).web3;
        if (web3) {
            let web3Wrapper = new Web3Wrapper(web3.currentProvider);
            void web3Wrapper.getNetworkIdAsync().then(networkId => {
                const providerEngine = new Web3ProviderEngine({ pollingInterval: 50000 });
                const signer = (web3.currentProvider as any).isMetaMask
                    ? new MetamaskSubprovider(web3.currentProvider)
                    : new SignerSubprovider(web3.currentProvider);
                console.log(signer);
                const rpcProvider = new RPCSubprovider(networkIdToRPCURI[networkId]);
                providerEngine.addProvider(signer);
                providerEngine.addProvider(rpcProvider);
                providerEngine.start();
                const provider = providerEngine;
                web3Wrapper = new Web3Wrapper(provider);
                const contractWrappers = new ContractWrappers(provider, { networkId });
                _.map(
                    [
                        contractWrappers.exchange.abi,
                        contractWrappers.erc20Token.abi,
                        contractWrappers.etherToken.abi,
                        contractWrappers.forwarder.abi,
                    ],
                    abi => web3Wrapper.abiDecoder.addABI(abi),
                );
                this.setState({ web3Wrapper, contractWrappers, web3 });
            });
        }
    }
    public render(): React.ReactNode {
        const AccountWithToasts = withToastManager(Account);
        const ZeroExActionsWithToasts = withToastManager(ZeroExActions);
        if (!this.state || !this.state.contractWrappers || !this.state.web3Wrapper) {
            return <div />;
        }
        return (
            <div style={{ paddingLeft: 30, paddingRight: 30, paddingBottom: 30 }}>
                <Nav web3Wrapper={this.state.web3Wrapper} />
                <Content className="container">
                    {this.state.web3 && (
                        <div>
                            <Welcome />
                            <ToastProvider>
                                <AccountWithToasts
                                    erc20TokenWrapper={this.state.contractWrappers.erc20Token}
                                    web3Wrapper={this.state.web3Wrapper}
                                />
                                <ZeroExActionsWithToasts
                                    contractWrappers={this.state.contractWrappers}
                                    web3Wrapper={this.state.web3Wrapper}
                                />
                                <Faucet web3Wrapper={this.state.web3Wrapper} />
                            </ToastProvider>
                        </div>
                    )}
                    {!this.state.web3 && <InstallMetamask />}
                </Content>
                <Footer />
            </div>
        );
    }
}

const e = React.createElement;
const main = document.getElementById('app');
if (main) {
    ReactDOM.render(e(MainApp), main);
} else {
    console.log('Cannot find main container');
}
