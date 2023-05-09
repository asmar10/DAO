// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol"; 
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

error ArbitrumNFT_OnlyOwnerCanCall();
error ArbitrumNFT_NotEnoughBalanceToWithdraw();
error ArbitrumNFT_TransferFailed();
error ArbitrumNFT_PriceNotMatched(uint256 price);
error ArbitrumNFT_SimilarToCurrentPrice(uint256 currentPrice);
error ArbitrumNFT_SimilarToCurrentBaseURI(string currentBaseURI);

contract ArbitrumNFT is ERC721Enumerable {

/////////////////////////State Varaibles///////////////////////////////////
    AggregatorV3Interface internal priceFeed;
    string private baseURI;
    address private owner;
    uint256 public pricePerNFT;
    
/////////////////////////Mapping///////////////////////////////////
    mapping(uint256 => string) private _tokenURIs;

/////////////////////////Events///////////////////////////////////
    event NFTMinted(
        address indexed user,
        uint256 indexed tokenId
     );

/////////////////////////Modifier///////////////////////////////////
    modifier onlyOwner() {
       if(msg.sender != owner) {
           revert ArbitrumNFT_OnlyOwnerCanCall();
       }
        _;
    }

    constructor(string memory _uri, uint256 _initialPrice)ERC721("ArbitrumNFT", "AN"){
        owner = msg.sender;     
        baseURI = _uri; 
        pricePerNFT = _initialPrice;
        priceFeed = AggregatorV3Interface(
            0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7            // Provide the address here
        );
    }

/////////////////////////Main Functions///////////////////////////////////

     function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId),"ERC721URIStorage: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    } 

     function buyNFT(string calldata data) public payable {
         if(msg.value < getPrice()) {
             revert ArbitrumNFT_PriceNotMatched(getPrice());
         }
        uint256 mintIndex = totalSupply() + 1;
        _safeMint(_msgSender(), mintIndex);
        _setTokenURI(mintIndex, data);

        emit NFTMinted(_msgSender(),mintIndex);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal  {
        super._beforeTokenTransfer(from,to,tokenId, 1);
    }

/////////////////////////OnlyOwner Functions///////////////////////////////////

        function setPrice(uint256 _price) public onlyOwner {
        if(pricePerNFT == _price) {
            revert ArbitrumNFT_SimilarToCurrentPrice(pricePerNFT);
        }
        pricePerNFT = _price;
    }

    function setBaseURI(string memory _uri) public onlyOwner {
        if(keccak256(abi.encodePacked(baseURI)) == keccak256(abi.encodePacked(_uri))) {
            revert ArbitrumNFT_SimilarToCurrentBaseURI(baseURI);
        }

        baseURI = _uri;
    }
    
    function transferOwnerShip(address _newOwner) public onlyOwner returns(bool) {
        owner = _newOwner;
        return true;
    }

    function withdraw() public onlyOwner returns(bool) {
       if(address(this).balance == 0) {
           revert ArbitrumNFT_NotEnoughBalanceToWithdraw();
       }
       (bool success,) = payable(msg.sender).call{value: address(this).balance}("");
       if(!success) {
           revert ArbitrumNFT_TransferFailed();
       }
       return true;
    }

/////////////////////////View Functions///////////////////////////////////  

    function getLatestPrice() view internal returns (int) {
         (,int price,,,) = priceFeed.latestRoundData();
        // return 190115000000;
         return price;
    }

    function getPrice() public view returns (uint256) {
        uint256 temp = uint256(getLatestPrice());
        uint256 price= (((pricePerNFT * 10 * 18) / temp) * 10 * 8);
        return price;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory){
        require(_exists(tokenId),"ERC721URIStorage: URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();
       
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        return super.tokenURI(tokenId);
    } 

    function supportsInterface(bytes4 interfaceId) public view override returns (bool){
        return super.supportsInterface(interfaceId);
    }

     function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
    
}