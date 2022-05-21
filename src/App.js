import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MarketPage from "./components/pages/MarketPage";
import OrderPage from "./components/pages/OrderPage";
import SettingsPage from "./components/pages/SettingsPage";
import NoPage from "./components/pages/NoPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MarketPage />} />
            <Route path="orders" element={<OrderPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
