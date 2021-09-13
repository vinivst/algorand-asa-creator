/* global AlgoSigner */
import './App.css';
import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  InputGroup,
  InputGroupAddon,
  Input,
  Button,
} from 'reactstrap';

const algosdk = require('algosdk');
const baseServer = process.env.REACT_APP_BASESERVER;
const port = '';
const token = {
  'X-API-Key': process.env.REACT_APP_TOKEN,
};

const algodClient = new algosdk.Algodv2(token, baseServer, port);

//const appId = 13793863;

class App extends Component {
  state = {
    accounts: [],
    assetName: '',
    unitName: '',
    total: 0,
    decimals: 0,
    note: '',
    loaded: false,
  };

  componentDidMount = async () => {
    try {
      // Use web3 to get the user's accounts.
      await AlgoSigner.connect({
        ledger: 'TestNet',
      });
      const accounts = await AlgoSigner.accounts({
        ledger: 'TestNet',
      });

      if (typeof AlgoSigner === 'undefined') {
        alert(
          `Failed to load AlgoSigner. You must have AlgoSigner Chrome Extension installed.`
        );
      } else {
        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        //console.log(accounts[0]['address']);
        this.setState({ accounts: accounts, loaded: true });
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  handleSubmit = async () => {
    let { accounts, assetName, unitName, total, decimals, note } = this.state;
    /*
    try {
      const txParams = await AlgoSigner.algod({
        ledger: 'TestNet',
        path: '/v2/transactions/params',
      });
      //console.log(txParams);
      const signedTx = await AlgoSigner.sign({
        from: accounts[0]['address'],
        assetName: assetName,
        unitName: unitName,
        total: total,
        decimals: decimals,
        note: AlgoSigner.encoding.stringToByteArray(note),
        type: 'appl',
        appOnComplete: 0,
        fee: txParams['min-fee'],
        firstRound: txParams['last-round'],
        lastRound: txParams['last-round'] + 1000,
        genesisID: txParams['genesis-id'],
        genesisHash: txParams['genesis-hash'],
      });
      const result = await AlgoSigner.send({
        ledger: 'TestNet',
        tx: signedTx.blob,
      });
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.log(error);
    }*/
    try {
      let suggestedParams = await algodClient.getTransactionParams().do();

      const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: accounts[0]['address'],
        assetName: assetName,
        unitName: unitName,
        total: +total,
        decimals: +decimals,
        note: AlgoSigner.encoding.stringToByteArray(note),
        suggestedParams: { ...suggestedParams },
      });

      // Use the AlgoSigner encoding library to make the transactions base64
      const txn_b64 = AlgoSigner.encoding.msgpackToBase64(txn.toByte());

      const signedTxs = await AlgoSigner.signTxn([{ txn: txn_b64 }]);
      let tx = await AlgoSigner.send({
        ledger: 'TestNet',
        tx: signedTxs[0].blob,
      });
      console.log(tx);
    } catch (error) {
      console.log(error);
    }
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    //console.log(event.target.name);
    //console.log(event.target.value);

    this.setState({
      [name]: value,
    });
  };

  render() {
    if (!this.state.loaded) {
      return (
        <div>
          Loading...You must have AlgoSigner Chrome Extension installed.
        </div>
      );
    }

    return (
      <Container>
        <div className="App">
          <Row>
            <Col className="title">
              <h1>Algorand - ASA Creation Demo</h1>
            </Col>
          </Row>
          <Row>
            <Col className="title">
              <br />
              <h2>Create New Token</h2>
              <br />
            </Col>
          </Row>
          <Row>
            <Col>
              <InputGroup>
                <InputGroupAddon addonType="prepend" className="assetName">
                  Asset Name:
                </InputGroupAddon>
                <Input
                  type="text"
                  name="assetName"
                  value={this.state.assetName}
                  onChange={this.handleInputChange}
                />
                <InputGroupAddon addonType="prepend" className="unitName">
                  Unit Name:
                </InputGroupAddon>
                <Input
                  type="text"
                  name="unitName"
                  value={this.state.unitName}
                  onChange={this.handleInputChange}
                />
                <InputGroupAddon addonType="prepend" className="total">
                  Total Supply:
                </InputGroupAddon>
                <Input
                  type="number"
                  name="total"
                  value={this.state.total}
                  onChange={this.handleInputChange}
                />
                <InputGroupAddon addonType="prepend" className="decimals">
                  Decimals:
                </InputGroupAddon>
                <Input
                  type="number"
                  name="decimals"
                  value={this.state.decimals}
                  onChange={this.handleInputChange}
                />
                <InputGroupAddon addonType="prepend" className="note">
                  Note:
                </InputGroupAddon>
                <Input
                  type="text"
                  name="note"
                  value={this.state.note}
                  onChange={this.handleInputChange}
                />
                <InputGroupAddon addonType="append">
                  <Button onClick={this.handleSubmit} color="secondary">
                    Create Token
                  </Button>
                </InputGroupAddon>
              </InputGroup>
              <br />
            </Col>
          </Row>
        </div>
      </Container>
    );
  }
}

export default App;
