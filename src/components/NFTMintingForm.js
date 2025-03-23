import React, { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { uploadMetadataToPinata } from "../services/ipfsService";
import { saveNFT } from "../services/nftStorage";
import { contractAddress, contractABI } from "../services/contractConfig";

const NFTMintingForm = ({ user, account, setStatus, setLoading, loading, onNFTMinted }) => {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tokenURI, setTokenURI] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create a preview for image files
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        // Set a generic icon for non-image files
        setFilePreview('/file-icon.png');
      }
    }
  };

  const mintNFT = async () => {
    if (!file || !name || !description) return alert("Please complete all fields");
    if (!account) return alert("Please connect your wallet first");

    setStatus("Uploading metadata...");
    const uri = await uploadMetadataToPinata(file, name, description, setStatus, setLoading);
    if (!uri) return setStatus("Failed to upload metadata.");
    
    setTokenURI(uri);

    try {
      setStatus("Minting NFT...");
      setLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractABI.abi, signer);
      const transaction = await contract.mintNFT(account, uri);
      
      setStatus("Waiting for transaction confirmation...");
      const receipt = await transaction.wait();
      
      // Get the token ID from the event logs
      const tokenId = receipt.logs[0].topics[3];
      const tokenIdNumber = parseInt(tokenId, 16);
      
      // Save NFT info to localStorage
      saveNFT({
        id: Date.now().toString(), // Generate a unique ID
        userId: user.uid,
        walletAddress: account,
        tokenId: tokenIdNumber,
        tokenURI: uri,
        name: name,
        description: description,
        createdAt: new Date().toISOString(),
        fileType: file.type || "application/octet-stream",
        filePreview: filePreview
      });
      
      setStatus("NFT Minted Successfully!");
      
      // Refresh the user's NFTs
      onNFTMinted();
      
      // Reset form fields
      setFile(null);
      setFilePreview(null);
      setName("");
      setDescription("");
    } catch (error) {
      console.error("Minting error:", error);
      setStatus("Error minting NFT: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6">Mint a New NFT</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Upload File:</label>
        <input 
          type="file"
          onChange={handleFileChange}
          className="w-full p-2 border border-gray-300 rounded bg-gray-100"
        />
        
        {filePreview && (
          <div className="mt-2 flex justify-center">
            <img 
              src={filePreview} 
              alt="Preview" 
              className="max-h-40 max-w-full object-contain rounded border border-gray-300"
            />
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">NFT Name:</label>
        <input 
          type="text"
          placeholder="Enter NFT Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded bg-gray-100"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Description:</label>
        <textarea 
          placeholder="Enter NFT Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded bg-gray-100"
          rows="3"
        />
      </div>

      <button 
        onClick={mintNFT}
        disabled={loading || !file || !name || !description}
        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "Mint NFT"}
      </button>
      
      {tokenURI && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="mb-2 font-medium">Token URI:</p>
          <p className="text-sm break-all">{tokenURI}</p>
          <div className="mt-2 flex space-x-2">
            <a 
              href={tokenURI} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-700 hover:underline"
            >
              View Metadata
            </a>
            <a 
              href={`https://testnets.opensea.io/${account}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-700 hover:underline"
            >
              View on OpenSea
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTMintingForm;