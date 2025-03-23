// localStorage functions for NFT data

export const saveNFT = (nftData) => {
    // Get existing NFTs from localStorage
    const existingNFTs = JSON.parse(localStorage.getItem('nfts') || '[]');
    
    // Add the new NFT
    existingNFTs.push(nftData);
    
    // Save back to localStorage
    localStorage.setItem('nfts', JSON.stringify(existingNFTs));
  };
  
  export const loadUserNFTs = (userId, setMintedNFTs) => {
    // Get NFTs from localStorage
    const allNFTs = JSON.parse(localStorage.getItem('nfts') || '[]');
    
    // Filter NFTs by userId
    const userNFTs = allNFTs.filter(nft => nft.userId === userId);
    
    setMintedNFTs(userNFTs);
  };
  
  export const deleteNFTRecord = (nftId) => {
    // Get all NFTs from localStorage
    const allNFTs = JSON.parse(localStorage.getItem('nfts') || '[]');
    
    // Filter out the NFT to delete
    const updatedNFTs = allNFTs.filter(nft => nft.id !== nftId);
    
    // Save back to localStorage
    localStorage.setItem('nfts', JSON.stringify(updatedNFTs));
  };