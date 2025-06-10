import React, { useEffect, useState } from 'react';

interface Token {
  id: string;
  name: string;
  value: number;
  volatility: number;
}

const fetchTokenData = async (): Promise<Token[]> => {
  const response = await fetch('/api/tokens');
  return response.json();
};

const TokenDashboard = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [minValue, setMinValue] = useState(0);

  useEffect(() => {
    fetchTokenData().then(data => {
      setTokens(data);
      setFilteredTokens(data);
    });
  }, []);

  const filterByValue = (min: number) => {
    const filtered = tokens.filter(token => token.value >= min);
    setFilteredTokens(filtered);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setMinValue(val);
    filterByValue(val);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Token Dashboard</h1>
      <input
        type="number"
        value={minValue}
        onChange={handleValueChange}
        className="mb-4 p-2 border"
        placeholder="Min Value"
      />
      <ul>
        {filteredTokens.map(token => (
          <li key={token.id} className="mb-2">
            <strong>{token.name}</strong>: ${token.value.toFixed(2)} (Volatility: {token.volatility})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TokenDashboard;