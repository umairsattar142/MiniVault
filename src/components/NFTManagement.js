import React from "react";
import { BrowserProvider, Contract } from "ethers";
import { deleteNFTRecord } from "../services/nftStorage";
import { contractAddress, contractABI } from "../services/contractConfig";

const NFTManagement = ({ user, account, mintedNFTs, setStatus, setLoading, loading, refreshNFTs }) => {
  // Transfer NFT
  const transferNFT = async (tokenId, toAddress) => {
    if (!toAddress) return alert("Please enter recipient address");
    
    try {
      setLoading(true);
      setStatus("Transferring NFT...");
      
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractABI.abi, signer);
      
      const transaction = await contract.transferFrom(account, toAddress, tokenId);
      await transaction.wait();
      
      // Update NFT ownership in localStorage
      const allNFTs = JSON.parse(localStorage.getItem('nfts') || '[]');
      const updatedNFTs = allNFTs.map(nft => {
        if (nft.tokenId === tokenId && nft.userId === user.uid) {
          // Mark as transferred
          return { ...nft, transferred: true, transferredTo: toAddress };
        }
        return nft;
      });
      
      localStorage.setItem('nfts', JSON.stringify(updatedNFTs));
      
      setStatus("NFT transferred successfully!");
      refreshNFTs();
    } catch (error) {
      console.error("Transfer error:", error);
      setStatus("Error transferring NFT: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNFT = (nftId) => {
    deleteNFTRecord(nftId);
    setStatus("NFT record removed successfully");
    refreshNFTs();
  };

  return (
    <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Your NFTs</h2>
      
      {mintedNFTs.length === 0 ? (
        <p className="text-center text-gray-500">You haven't minted any NFTs yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mintedNFTs.map((nft) => (
            <div key={nft.id} className="border border-gray-300 rounded p-4">
              <div className="flex justify-center mb-3">
                {nft.filePreview && (
                  <img 
                    src={nft.filePreview} 
                    alt={nft.name} 
                    className="h-32 object-contain"
                  />
                )}
              </div>
              <h3 className="font-bold text-lg mb-1">{nft.name}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{nft.description}</p>
              <p className="text-xs text-gray-500 mb-2">
                Token ID: {nft.tokenId}
              </p>
              
              {nft.transferred ? (
                <p className="text-xs text-gray-500 mb-2">
                  Transferred to: {nft.transferredTo.slice(0, 6)}...{nft.transferredTo.slice(-4)}
                </p>
              ) : (
                <div className="mt-3 flex flex-col space-y-2">
                  <a 
                    href={nft.tokenURI} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-gray-700 hover:underline"
                  >
                    View Metadata
                  </a>
                  <a 
                    href={`https://testnets.opensea.io/assets/${contractAddress}/${nft.tokenId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-gray-700 hover:underline"
                  >
                    View on OpenSea
                  </a>
                  
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium">Transfer NFT</summary>
                    <div className="mt-2 p-2 bg-gray-100 rounded">
                      <input 
                        type="text" 
                        placeholder="Recipient address"
                        className="w-full p-1 text-xs border border-gray-300 rounded mb-2"
                        id={`recipient-${nft.id}`}
                      />
                      <button
                        onClick={() => {
                          const recipientAddress = document.getElementById(`recipient-${nft.id}`).value;
                          transferNFT(nft.tokenId, recipientAddress);
                        }}
                        className="w-full bg-black text-white text-xs py-1 px-2 rounded"
                      >
                        Transfer
                      </button>
                    </div>
                  </details>
                  
                  <button
                    onClick={() => handleDeleteNFT(nft.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove from list
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NFTManagement;