import TradingViewWidget from "react-tradingview-widget";

function MarketPage(){
    return (
        <div className="page trading-view-page">
            <TradingViewWidget symbol="COINBASE:BTCUSD" autosize/>
        </div>
    );
}

export default MarketPage;