import React from "react";
import { useWeb3 } from "../contexts/Web3Context";

const Home: React.FC = () => {
  const { account, connectWallet } = useWeb3();

  return (
    <div className="home">
      <h1>Car Rental DApp</h1>
      {account ? (
        <p>Connected: {account}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default Home;