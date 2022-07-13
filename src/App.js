import './App.css';
import React from 'react';
import web3 from './web3';
import lottery from './lottery';

class App extends React.Component 
{
	constructor(props)
    {
        super(props);

        this.state = 
        {
            manager: '',
            players: [],
            balance: '',
            inputValue: '',
            message: ''
        };

        this.onInputChange = this.onInputChange.bind(this);
        this.onEnterSubmit = this.onEnterSubmit.bind(this);
        this.onPickSubmit = this.onPickSubmit.bind(this);
    }

    async componentDidMount() 
    {
		// No need to specify 'from' attribute value in call() as it defaults to account selected in metamask
		const manager = await lottery.methods.manager().call();
        const players = await lottery.methods.getPlayers().call();
        const balance = await web3.eth.getBalance(lottery.options.address);

		this.setState
        (   
            {
                manager,
                players,
                balance: web3.utils.fromWei(balance, 'ether'),
                message: '',
            }
        );
	}

    async onInputChange(evt)
    {
        this.setState({ inputValue: evt.target.value });
    }
	
    async onEnterSubmit(evt)
    {
        evt.preventDefault();

        this.setState({ message: 'Entering you into lottery...' });

        const player = await web3.currentProvider.request({method: 'eth_requestAccounts'});
        const amount = web3.utils.toWei(this.state.inputValue, 'ether');

        await lottery.methods.enter().send
        (
            {
                from: player[0],
                value: amount
            }
        );
        
        this.setState
        (
            currentState =>
            (
                {
                    players: [...currentState.players, player[0]],
                    balance: currentState.balance + currentState.inputValue,
                    inputValue: '',
                    message: 'Successfully entered into lottery!'
                }
            )
        );
    }

    async onPickSubmit(evt)
    {
        this.setState({ message: 'Picking winner...' });

        const manager = await web3.currentProvider.request({ method: 'eth_requestAccounts' });

        await lottery.methods.pickWinner().send
        (
            {
                from: manager[0]
            }
        );

        this.setState
        (
            currentState =>
            (
                {
                    balance: '0',
                    players: [],
                    inputValue: '',
                    message: 'Winner picked!'
                }
            )
        );
    }

	render() 
    {
		return (
			<div>
                <h2>Lottery Contract</h2>
                <p>
                    This contract is managed by { this.state.manager }
                </p>
                <p>
                    There are { this.state.players.length } players, competing 
                    for a prize of { this.state.balance } ether!
                </p>

                <hr />

                <h4>Feeling lucky?</h4>
                <form>
                    <div>
                        <label>Enter ether amount to bet</label>
                    </div>
                    <div>
                        <input value =  { this.state.inputValue } onChange = { this.onInputChange }/>
                    </div>

                    <button type = "submit" onClick = { this.onEnterSubmit }>
                        Enter lottery!
                    </button>
                </form>

                <div>{ this.state.message }</div>

                <h4>Time to pick a winner?</h4>
                <button onClick = { this.onPickSubmit }>
                    Pick Winner!
                </button>
            </div>
		);
	}
}
export default App;
