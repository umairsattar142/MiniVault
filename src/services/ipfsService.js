import axios from "axios";

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_API_SECRET = process.env.REACT_APP_PINATA_API_SECRET;

export const uploadMetadataToPinata = async (file, name, description, setStatus, setLoading) => {
  if (!file) return alert("Please select a file");

  // First upload the file itself
  const fileFormData = new FormData();
  fileFormData.append("file", file);
  
  const fileOptions = JSON.stringify({ cidVersion: 0 });
  fileFormData.append("pinataOptions", fileOptions);

  try {
    setLoading(true);
    setStatus("Uploading file to IPFS...");
    
    // Upload the file first
    const fileResponse = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      fileFormData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "pinata_api_key": PINATA_API_KEY,
          "pinata_secret_api_key": PINATA_API_SECRET,
        },
      }
    );
    
    const fileIPFSHash = fileResponse.data.IpfsHash;
    const fileUrl = `https://ipfs.io/ipfs/${fileIPFSHash}`;
    
    setStatus("Creating metadata...");
    
    // Determine the appropriate mime type
    const mimeType = file.type || "application/octet-stream";
    
    // Create NFT metadata JSON object
    const metadataJSON = {
      name: name,
      description: description,
      image: fileUrl,
      attributes: [
        {
          trait_type: "File Type",
          value: mimeType
        },
        {
          trait_type: "File Size",
          value: `${Math.round(file.size / 1024)} KB`
        },
        {
          display_type: "date", 
          trait_type: "Created",
          value: Math.floor(Date.now() / 1000)
        }
      ]
    };
    
    // Upload the metadata JSON
    const metadataResponse = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadataJSON,
      {
        headers: {
          "Content-Type": "application/json",
          "pinata_api_key": PINATA_API_KEY,
          "pinata_secret_api_key": PINATA_API_SECRET,
        },
      }
    );
    
    const metadataUrl = `https://ipfs.io/ipfs/${metadataResponse.data.IpfsHash}`;
    setStatus("Metadata uploaded successfully!");
    
    return metadataUrl;
  } catch (error) {
    console.error("Upload failed:", error);
    setStatus("Failed to upload: " + error.message);
    return null;
  } finally {
    setLoading(false);
  }
};