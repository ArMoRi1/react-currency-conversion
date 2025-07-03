import React, { useState, useEffect } from 'react';

import './App.css';

const App = () => {
    const [rates, setRates] = useState({});
    const [lastChanged, setLastChanged] = useState("from");
    const [fromCurrency, setFromCurrency] = useState("UAH");
    const [toCurrency, setToCurrency] = useState("USD");
    const [fromAmount, setFromAmount] = useState(1);
    const [toAmount, setToAmount] = useState(0);

    useEffect(() => {
        fetch("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json")
            .then((res) => res.json())
            .then((data) => {
                const needed = data.filter((currency) =>
                    ["USD", "EUR", "CNY", "CHF"].includes(currency.cc)
                );
                const obj = { UAH: 1 };
                needed.forEach((item) => {
                    obj[item.cc] = item.rate;
                });
                setRates(obj);
            });
    }, []);

    const convertCurrency = (amount, from, to) => {
        if (!rates[from] || !rates[to]) return 0;
        if (from === "UAH") {
            return amount / rates[to];
        } else if (to === "UAH") {
            return amount * rates[from];
        } else {
            const uahAmount = amount * rates[from];
            return uahAmount / rates[to];
        }
    };

    useEffect(() => {
        if (lastChanged === "from") {
            setToAmount(convertCurrency(fromAmount, fromCurrency, toCurrency));
        } else {
            setFromAmount(convertCurrency(toAmount, toCurrency, fromCurrency));
        }
    }, [rates, fromCurrency, toCurrency, fromAmount, toAmount, lastChanged]);

    const handleFromAmountChange = (value) => {
        setFromAmount(value);
        setLastChanged("from");
        setToAmount(convertCurrency(value, fromCurrency, toCurrency));
    };

    const handleToAmountChange = (value) => {
        setToAmount(value);
        setLastChanged("to");
        setFromAmount(convertCurrency(value, toCurrency, fromCurrency));
    };

    const swapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
        setFromAmount(toAmount);
        setToAmount(fromAmount);
    };

    const setCurrency = (currency) => {
        if (fromCurrency === "UAH") {
            setToCurrency(currency);
        } else {
            setFromCurrency(currency);
        }
    };

    const currencies = ["UAH", "USD", "EUR", "CNY", "CHF"];

    return (
        <div className="app">
            <div className="currency-input">
                <label>З валюти ({fromCurrency}):</label>
                <input
                    type="number"
                    value={fromAmount.toFixed(2)}
                    onChange={(e) => handleFromAmountChange(Number(e.target.value))}
                    placeholder={`Введіть суму в ${fromCurrency}`}
                />
            </div>
            <div className="swap-container">
                <button className="swap-button" onClick={swapCurrencies}>
                    ⇅ Поміняти місцями
                </button>
            </div>
            <div className="currency-input">
                <label>В валюту ({toCurrency}):</label>
                <input
                    type="number"
                    value={toAmount.toFixed(2)}
                    onChange={(e) => handleToAmountChange(Number(e.target.value))}
                    placeholder={`Введіть суму в ${toCurrency}`}
                />
            </div>
            <div className="display-grid">
                <div className="cell header">{fromCurrency}</div>
                <div className="cell header">{toCurrency || "—"}</div>
                <div className="cell value">{fromAmount.toFixed(2)}</div>
                <div className="cell value">{toAmount.toFixed(2)}</div>
            </div>
            <div className="controls">
                {currencies
                    .filter((curr) => curr !== fromCurrency && curr !== toCurrency)
                    .map((currency) => (
                        <button key={currency} onClick={() => setCurrency(currency)}>
                            {currency}
                        </button>
                    ))}
            </div>
            <div>
                <strong>Поточна пара:</strong> {fromCurrency} ⇄ {toCurrency}
            </div>
        </div>
    );
};

export default App;
