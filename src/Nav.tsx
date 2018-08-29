import { Navbar, NavbarBrand, NavbarEnd, NavbarItem, NavbarMenu, Image } from 'bloomer';
import * as React from 'react';

interface NavState {
    isActive: boolean;
}
interface NavProps {}
export class Nav extends React.Component<NavProps, NavState> {
    constructor(props: NavProps) {
        super(props);
        this.state = { isActive: false };
    }
    render() {
        return (
            <Navbar style={{ zIndex: -1 }}>
                <NavbarBrand>
                    <NavbarItem>
                        <Image
                            isSize="16x16"
                            src="https://0xproject.com/images/favicon/favicon-2-32x32.png"
                            style={{ marginRight: '10px' }}
                        />
                        <strong> 0x Sandbox </strong>
                    </NavbarItem>
                </NavbarBrand>
                <NavbarMenu isActive={this.state.isActive}>
                    <NavbarEnd />
                </NavbarMenu>
            </Navbar>
        );
    }
}
