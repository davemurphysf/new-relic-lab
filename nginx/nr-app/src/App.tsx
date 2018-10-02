import axios from 'axios';
import * as React from 'react';
import { Button, Col, ControlLabel, Form, FormControl, FormGroup, Grid, HelpBlock, Radio, Row } from 'react-bootstrap';
import './App.css';
import logo from './logo.svg';

interface ILabState {
  errorMsg?: string,
  key: string,
  value: string,
  verb?: string,
  store?: string,
  time?: string,
  succeeded?: boolean,
  valueFromServer?: string
};

interface IResponse {
  success: boolean,
  duration: number,
  value: string
}

class App extends React.Component<{}, ILabState> {
  constructor(props: any) {
    super(props);
    this.state = {
      key: '',
      value: ''
    };
    this.keyChanged = this.keyChanged.bind(this);
    this.valueChanged = this.valueChanged.bind(this);
    this.submitClicked = this.submitClicked.bind(this);
    this.storeChanged = this.storeChanged.bind(this);
    this.verbChanged = this.verbChanged.bind(this);
  }
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Dave Murphy New Relic Lab</h1>
        </header>
        <Grid className="store">
          <Row>
            <Col xs={12} md={6} mdOffset={3}>
              <Form>
                <FormGroup>
                  <ControlLabel>Key</ControlLabel>
                  <FormControl
                    type="text"
                    placeholder="Enter Key"
                    onChange={this.keyChanged}
                    value={this.state.key}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Value</ControlLabel>
                  <FormControl
                    type="text"
                    placeholder="Enter Value"
                    onChange={this.valueChanged}
                    value={this.state.value}
                  />
                </FormGroup>
                <FormGroup >
                  <ControlLabel>Store</ControlLabel>{' '}
                  <Radio
                    name="radioGroup"
                    selected={this.state.store === 'redis'}
                    id='redis'
                    // tslint:disable-next-line:jsx-no-lambda
                    onChange={() => this.storeChanged('redis')}
                  >
                    Redis
                  </Radio>{' '}
                  <Radio
                    name="radioGroup"
                    selected={this.state.store === 'db'}
                    id='db'
                    // tslint:disable-next-line:jsx-no-lambda
                    onChange={() => this.storeChanged('db')}
                  >
                    Postgres
                  </Radio>{' '}
                  <Radio
                    name="radioGroup"
                    selected={this.state.store === 'storage'}
                    id='storage'
                    // tslint:disable-next-line:jsx-no-lambda
                    onChange={() => this.storeChanged('storage')}
                  >
                    Google Cloud Storage
                  </Radio>
                </FormGroup>
                <FormGroup >
                  <ControlLabel>Verb</ControlLabel>{' '}
                  <Radio
                    name="verbGroup"
                    selected={this.state.verb === 'GET'}
                    id='GET'
                    // tslint:disable-next-line:jsx-no-lambda
                    onChange={() => this.verbChanged('GET')}
                  >
                    GET
                  </Radio>{' '}
                  <Radio
                    name="verbGroup"
                    selected={this.state.verb === 'POST'}
                    id='POST'
                    // tslint:disable-next-line:jsx-no-lambda
                    onChange={() => this.verbChanged('POST')}
                  >
                    POST
                  </Radio>{' '}
                  <Radio
                    name="verbGroup"
                    selected={this.state.verb === 'DELETE'}
                    id='DELETE'
                    // tslint:disable-next-line:jsx-no-lambda
                    onChange={() => this.verbChanged('DELETE')}
                  >
                    DELETE
                  </Radio>
                </FormGroup>
                <FormGroup>
                  <Button bsStyle="success" onClick={this.submitClicked}>
                    Send Request
                  </Button>
                  {
                    this.state.errorMsg &&
                    <HelpBlock>{this.state.errorMsg}</HelpBlock>
                  }
                </FormGroup>
              </Form>
              {!this.state.errorMsg && (this.state.time || this.state.valueFromServer) &&
                <p>
                  {'Operation succeeded: ' + this.state.succeeded}
                  <br />
                  {this.state.time}
                  <br />
                  {'Value from server: ' + this.state.valueFromServer}
                </p>
              }
            </Col>
          </Row>
        </Grid>
      </div >
    );
  }
  private keyChanged(e: React.FormEvent<FormControl & HTMLInputElement>) {
    this.setState({
      key: e.currentTarget.value
    });
  }
  private valueChanged(e: React.FormEvent<FormControl & HTMLInputElement>) {
    this.setState({
      value: e.currentTarget.value
    });
  }
  private storeChanged(store: string) {
    this.setState({
      store
    });
  }
  private verbChanged(verb: string) {
    this.setState({
      verb
    });
  }
  private async submitClicked() {
    if (!this.state.key) {
      this.setState({
        errorMsg: 'Key is missing'
      });
      return;
    }

    if (this.state.key.length > 64) {
      this.setState({
        errorMsg: 'Key is too long (64 characters or less)'
      });
      return;
    }

    if (!this.state.store) {
      this.setState({
        errorMsg: 'Store is missing'
      });
      return;
    }

    if (!this.state.verb) {
      this.setState({
        errorMsg: 'Verb is missing'
      });
      return;
    }

    if (this.state.verb === 'POST') {
      if (!this.state.value) {
        this.setState({
          errorMsg: 'Value is missing'
        });
        return;
      }

      if (this.state.value.length > 64) {
        this.setState({
          errorMsg: 'Value is too long (64 characters or less)'
        });
        return;
      }
    }

    let response: IResponse;
    const startTime = Date.now();
    let endTime: number;
    try {
      switch (this.state.verb) {
        case 'POST':
          const postResponse = await axios.post(`api/${this.state.store}/${this.state.key}?value=${this.state.value}`,
            {},
            {
              headers: {
                'X-CUSTOM-SECRET-HEADER': 'Very Secret'
              }
            }
          );
          response = postResponse.data as IResponse;
          break;
        case 'DELETE':
          const deleteResponse = await axios.delete(`api/${this.state.store}/${this.state.key}`,
            {
              headers: {
                'X-CUSTOM-SECRET-HEADER': 'A little Secret'
              }
            }
          );
          response = deleteResponse.data as IResponse;
          break;
        case 'GET':
        default:
          const getResponse = await axios.get(`api/${this.state.store}/${this.state.key}`,
            {
              headers: {
                'X-CUSTOM-SECRET-HEADER': 'Not very Secret'
              }
            }
          );
          response = getResponse.data as IResponse;
      }
      endTime = Date.now();
    } catch (error) {
      this.setState({
        errorMsg: 'Hmmm...an error occured on the request',
        succeeded: false
      });
      return;
    }
    this.setState({
      errorMsg: undefined,
      succeeded: response.success,
      time: `Time on server: ${response.duration}ms, Time perceived by client: ${endTime - startTime}ms`,
      valueFromServer: response.value
    });
  }
}

export default App;
