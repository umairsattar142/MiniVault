import React, { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import "./App.css";
import AuthForms from "./components/AuthForms";
import NFTMintingForm from "./components/NFTMintingForm";
import NFTManagement from "./components/NFTManagement";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./services/firebase";
import { loadUserNFTs } from "./services/nftStorage";

function App() {
  // Auth states
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");
  
  // Wallet and NFT states
  const [account, setAccount] = useState("");
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNFTManagement, setShowNFTManagement] = useState(false);

  // Check auth state on load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        loadUserNFTs(user.uid, setMintedNFTs);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAccount("");
      setMintedNFTs([]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Wallet functions
  const connectWallet = async () => {
    if (!user) return alert("Please log in first!");
    
    if (window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 text-black p-4">
      <header className="w-full max-w-6xl flex justify-between items-center py-4">
        <h1 className="text-2xl md:text-3xl font-bold">MintVault by Umair Sattar</h1>
        
        {user && (
          <div className="flex items-center space-x-4">
            <p className="text-sm hidden md:block">
              {user.email}
            </p>
            <button 
              onClick={handleLogout}
              className="bg-black hover:bg-gray-800 text-white font-bold py-1 px-3 text-sm rounded transition"
            >
              Logout
            </button>
          </div>
        )}
      </header>
      
      <main className="w-full max-w-6xl flex-grow flex flex-col items-center justify-start py-6 space-y-6">
        {!user ? (
          <AuthForms setUser={setUser} setAuthError={setAuthError} authError={authError} loading={loading} setLoading={setLoading} />
        ) : (
          <>
            {!account && (
              <button 
                onClick={connectWallet}
                className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-lg transition text-lg"
              >
                Connect Wallet
              </button>
            )}
            
            {account && (
              <div className="w-full flex flex-col items-center">
                <div className="bg-white p-3 rounded-lg shadow mb-6 text-center">
                  <p className="text-sm text-gray-600">Connected Wallet</p>
                  <p className="font-mono font-medium">{account.slice(0, 6)}...{account.slice(-4)}</p>
                </div>
                
                <div className="w-full flex flex-col md:flex-row items-start justify-center gap-6">
                  <div className="w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <button
                        onClick={() => setShowNFTManagement(false)}
                        className={`py-2 px-4 ${!showNFTManagement ? 'border-b-2 border-black font-bold' : 'text-gray-600'}`}
                      >
                        Mint NFT
                      </button>
                      <button
                        onClick={() => setShowNFTManagement(true)}
                        className={`py-2 px-4 ${showNFTManagement ? 'border-b-2 border-black font-bold' : 'text-gray-600'}`}
                      >
                        Manage NFTs
                      </button>
                    </div>
                    
                    {!showNFTManagement ? (
                      <NFTMintingForm 
                        user={user}
                        account={account}
                        setStatus={setStatus}
                        setLoading={setLoading}
                        loading={loading}
                        onNFTMinted={() => loadUserNFTs(user.uid, setMintedNFTs)}
                      />
                    ) : (
                      <NFTManagement 
                        user={user}
                        account={account}
                        mintedNFTs={mintedNFTs}
                        setStatus={setStatus}
                        setLoading={setLoading}
                        loading={loading}
                        refreshNFTs={() => loadUserNFTs(user.uid, setMintedNFTs)}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      
      {status && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg p-3 rounded-lg max-w-xs border-l-4 border-black">
          <p className="text-sm">{status}</p>
        </div>
      )}
    </div>
  );
}

export default App;