import logo from './logo.svg';
import './App.css';
import Login from './components/Login';
import Logout from './components/Logout';
import Header from "./components/Header";
import TradingViewWidget from "react-tradingview-widget";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Header />
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <Login />
        <Logout />
        <div className="tvw">
          <TradingViewWidget symbol="COINBASE:BTCUSD" autosize/>
        </div>
      </header>
    </div>
  );
}

export default App;
