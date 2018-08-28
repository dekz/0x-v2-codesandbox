import { ContractWrappers, RPCSubprovider, Web3ProviderEngine } from '0x.js';
import { SignerSubprovider } from '@0xproject/subproviders';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import { Content, Footer } from 'bloomer';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ToastProvider, withToastManager } from 'react-toast-notifications';
import Account from './Account';
import Faucet from './Faucet';
import InstallMetamask from './helpers/InstallMetamask';
import { Nav } from './Nav';
import Welcome from './Welcome';
import ZeroExActions from './ZeroExActions';

// Kovan is a test network
// Please ensure you have Metamask installed
// and it is connected to the Kovan test network
const KOVAN_NETWORK_ID = 42;
const KOVAN_RPC = 'https://kovan.infura.io';

const AccountWithToasts = withToastManager(Account);
const ZeroExActionsWithToasts = withToastManager(ZeroExActions);
const App = () => {
    let renderContent;
    // Detect if Web3 is found, if not, ask the user to install Metamask
    if ((window as any).web3) {
        const web3 = (window as any).web3;
        // Set up Web3 Provider Engine with a few helper Subproviders from 0x
        const providerEngine = new Web3ProviderEngine({ pollingInterval: 10000 });
        // All signing based requests till go to the SignerSubprovider
        providerEngine.addProvider(new SignerSubprovider(web3.currentProvider));
        // All other requests will fall through to the next subprovider, such as data requests
        providerEngine.addProvider(new RPCSubprovider(KOVAN_RPC));
        providerEngine.start();

        const contractWrappers = new ContractWrappers(providerEngine, { networkId: KOVAN_NETWORK_ID });
        const web3Wrapper = new Web3Wrapper(providerEngine);
        const erc20TokenWrapper = contractWrappers.erc20Token;

        // Browse the individual files for more handy examples
        renderContent = (
            <div>
                <Welcome />
                <ToastProvider>
                    <AccountWithToasts erc20TokenWrapper={erc20TokenWrapper} web3Wrapper={web3Wrapper} />
                    <Faucet web3Wrapper={web3Wrapper} />
                    <ZeroExActionsWithToasts contractWrappers={contractWrappers} web3Wrapper={web3Wrapper} />
                </ToastProvider>
            </div>
        );
    } else {
        renderContent = <InstallMetamask />;
    }
    return (
        <div>
            <Nav />
            <Content className="container" style={{ marginTop: '20px' }}>
                {renderContent}
            </Content>
            <Footer />
        </div>
    );
};

const e = React.createElement;
const main = document.getElementById('app');
if (main) {
    ReactDOM.render(e(App), main);
} else {
    console.log('Cannot find main container');
}
