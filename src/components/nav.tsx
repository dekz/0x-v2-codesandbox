import { Web3Wrapper } from '@0x/web3-wrapper';
import { Image, Navbar, NavbarBrand, NavbarItem, Tag } from 'bloomer';
import * as React from 'react';

interface NavState {
    networkId?: number;
}
interface NavProps {
    web3Wrapper?: Web3Wrapper;
}
const networkIdToNetwork = {
    1: 'Mainnet',
    3: 'Ropsten',
    42: 'Kovan',
};
const NETWORK_CHECK_INTERVAL_MS = 2000;
export class Nav extends React.Component<NavProps, NavState> {
    public state = { networkId: undefined };
    constructor(props: NavProps) {
        super(props);
        void this.fetchNetworkDetailsAsync();
        setInterval(() => {
            void this.fetchNetworkDetailsAsync();
        }, NETWORK_CHECK_INTERVAL_MS);
    }
    public async fetchNetworkDetailsAsync() {
        const { web3Wrapper } = this.props;
        if (web3Wrapper) {
            const networkId = await web3Wrapper.getNetworkIdAsync();
            if (networkId !== this.state.networkId) {
                this.setState({ networkId });
            }
        }
    }
    public renderNetworkDropdown(): React.ReactNode {
        const { networkId } = this.state;
        if (networkId) {
            const networkName = networkIdToNetwork[networkId];
            return networkName ? <Tag isColor="primary">{networkName}</Tag> : <Tag isColor="warning">Unknown</Tag>;
        }
        return <Tag isColor="danger">Disconnected</Tag>;
    }
    public render(): React.ReactNode {
        const networkRender = this.renderNetworkDropdown();
        return (
            <Navbar style={{ zIndex: -1 }}>
                <NavbarBrand>
                    <NavbarItem>
                        <Image
                            isSize="16x16"
                            src="https://0xproject.com/images/favicon/favicon-2-32x32.png"
                            style={{ marginLeft: 0, marginRight: 10 }}
                        />
                        <strong> 0x Sandbox </strong>
                        <NavbarItem>{networkRender}</NavbarItem>
                    </NavbarItem>
                </NavbarBrand>
            </Navbar>
        );
    }
}
