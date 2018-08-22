import { Token, ZeroEx } from '0x.js';
import { BigNumber } from '@0xproject/utils';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import { Button, Column, Columns, Content, Icon, Subtitle, Table } from 'bloomer';
import * as _ from 'lodash';
import * as React from 'react';
import { tokensByNetwork } from './helpers/tokens';

interface Props {
    zeroEx: ZeroEx;
    toastManager: { add: (msg: string, appearance: {}) => void };
}

interface TokenBalance {
    token: Token;
    balance: BigNumber;
    allowance: BigNumber;
}

type AddressTokenBalance = { [address: string]: TokenBalance[] };

interface AccountState {
    balances: AddressTokenBalance;
    accounts: string[];
    selectedAccount: string;
}

const ETHER_TOKEN_NAME = 'ETH';

export default class Account extends React.Component<Props, AccountState> {
    private _web3Wrapper: Web3Wrapper;
    constructor(props: Props) {
        super(props);
        this.state = { accounts: [''], balances: {}, selectedAccount: '' };
        this._web3Wrapper = new Web3Wrapper(this.props.zeroEx.getProvider());
        this.fetchAccountDetailsAsync();
    }

    fetchAccountDetailsAsync = async () => {
        const addresses = await this.props.zeroEx.getAvailableAddressesAsync();
        const address = addresses[0];
        if (!address) {
            return;
        }
        const networkId = await this._web3Wrapper.getNetworkIdAsync();
        const tokens = tokensByNetwork[networkId];
        const balances = {};
        const allowances = {};
        balances[address] = {};
        allowances[address] = {};
        // Fetch all the Balances for all of the tokens in the Token Registry
        const allBalancesAsync = _.map(
            tokens,
            async (token: Token): Promise<TokenBalance> => {
                try {
                    const balance = await this.props.zeroEx.erc20Token.getBalanceAsync(token.address, address);
                    const allowance = await this.props.zeroEx.erc20Token.getProxyAllowanceAsync(token.address, address);
                    const numberBalance = new BigNumber(balance);
                    return { token: token, balance: numberBalance, allowance };
                } catch (e) {
                    console.log(e);
                    const zero = new BigNumber(0);
                    return { token: token, balance: zero, allowance: zero };
                }
            },
        );

        // Convert all of the Units into more Human Readable numbers
        // Many ERC20 tokens go to 18 decimal places
        const results = await Promise.all(allBalancesAsync);
        balances[address] = results;
        // Fetch the Balance in Ether
        try {
            const ethBalance = await this._web3Wrapper.getBalanceInWeiAsync(address);
            if (ethBalance) {
                const ethBalanceNumber = new BigNumber(ethBalance);
                balances[address] = [
                    ...balances[address],
                    {
                        token: { name: ETHER_TOKEN_NAME, decimals: 18, symbol: 'ETH' },
                        balance: ethBalanceNumber,
                        allowance: new BigNumber(0),
                    },
                ];
            }
        } catch (e) {
            console.log(e);
        }

        // Update the state in React
        this.setState(prev => {
            const prevSelectedAccount = prev.selectedAccount;
            const selectedAccount = prevSelectedAccount == '' ? address : prevSelectedAccount;
            return { ...prev, balances, accounts: addresses, allowances, selectedAccount };
        });
    };
    setProxyAllowanceAsync = async (tokenAddress: string) => {
        const { zeroEx } = this.props;
        const { accounts } = this.state;
        const account = accounts[0];
        const txHash = await zeroEx.erc20Token.setUnlimitedProxyAllowanceAsync(tokenAddress, account);
        this.transactionSubmitted(txHash);
    };
    transactionSubmitted = async (txHash: string) => {
        console.log(txHash);
        this.props.toastManager.add(`Transaction Submitted: ${txHash}`, {
            appearance: 'success',
            autoDismiss: true,
        });
        const receipt = await this._web3Wrapper.awaitTransactionMinedAsync(txHash);
        const appearance = receipt.status === 1 ? 'success' : 'error';
        this.props.toastManager.add(`Transaction Mined: ${txHash}`, {
            appearance,
            autoDismiss: true,
        });
        console.log(receipt);
        this.fetchAccountDetailsAsync();
    };
    render() {
        const { balances } = this.state;
        const account = this.state.selectedAccount;
        const userBalances = balances[account];
        const fetchBalancesButton = (
            <Button isSize="small" isColor="info" id="fetchAccountBalances" onClick={this.fetchAccountDetailsAsync}>
                Fetch Balances
            </Button>
        );
        let contentRender = (
            <div>
                <strong>Detecting Metamask...</strong>
                <p> Please ensure Metamask is unlocked </p>
            </div>
        );

        if (userBalances) {
            const balancesString = _.map(userBalances, (tokenBalance: TokenBalance) => {
                const name = tokenBalance.token.name;
                const symbol = tokenBalance.token.symbol;
                const balance = ZeroEx.toUnitAmount(tokenBalance.balance, tokenBalance.token.decimals);
                const allowance = ZeroEx.toUnitAmount(tokenBalance.allowance, tokenBalance.token.decimals);
                const allowanceRender = allowance.greaterThan(0) ? (
                    <Icon isSize="small" className="fa fa-check-circle" style={{ color: 'rgb(77, 197, 92)' }} />
                ) : (
                    <a href="#" onClick={() => this.setProxyAllowanceAsync(tokenBalance.token.address)}>
                        <Icon isSize="small" className="fa fa-lock" />
                    </a>
                );
                return balance ? (
                    <tr key={name}>
                        <td>{symbol}</td>
                        <td>{balance.toFixed(4)}</td>
                        <td>{allowanceRender}</td>
                    </tr>
                ) : (
                    <tr />
                );
            });
            contentRender = (
                <div>
                    <Table isStriped={false} isNarrow={true} className="is-hoverable">
                        <thead>
                            <tr>
                                <th>Token</th>
                                <th>Balance</th>
                                <th>Allowance</th>
                            </tr>
                        </thead>
                        <tbody>{balancesString}</tbody>
                    </Table>
                </div>
            );
        }

        return (
            <Content style={{ marginTop: '15px' }}>
                <Subtitle isSize={6}>Account: {account}</Subtitle>
                <Columns>
                    <Column isSize={3}>{contentRender}</Column>
                </Columns>
                {fetchBalancesButton}
            </Content>
        );
    }
}
