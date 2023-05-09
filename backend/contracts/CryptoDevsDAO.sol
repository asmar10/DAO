// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IFakeNFTMarketplace {
    function getPrice() external view returns (uint);
    function purchase(uint256 _tokenId) external payable;
    function available(uint256 _tokenId) external view returns (bool);
}

interface ICryptoDevsNFT {
    function balanceOf(address) external view returns(uint);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
}

contract CryptoDevsDAO is Ownable {

    modifier onlyNFTholder {
        require(cryptoDevsNFT.balanceOf(msg.sender)>0,"Not a DAO member");
        _;
    }

    modifier activeProposalOnly(uint propId) {
        require(proposals[propId].deadline >=block.timestamp, "Proposal Expired");
        _;
    }


    modifier inactiveProposalOnly(uint256 propId) {
        require(proposals[propId].deadline < block.timestamp,"DEADLINE_NOT_EXCEEDED");
        require(proposals[propId].executed == false,"PROPOSAL_ALREADY_EXECUTED");
        _;
    }

    enum Vote { 
        Yes, //0
        No //1
    }

    struct Proposal {
        uint256 nftTokenId;
        uint256 deadline;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        mapping(uint256 => bool) voters;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint => bool)public doesProposalExists;

    uint256 public numProposals;

    IFakeNFTMarketplace nftMarketplace;
    ICryptoDevsNFT cryptoDevsNFT;

    constructor(address _nftMarketplace, address _cryptoDevsNFT) payable {
        nftMarketplace = IFakeNFTMarketplace(_nftMarketplace);
        cryptoDevsNFT = ICryptoDevsNFT(_cryptoDevsNFT);
    }

    function createProposal(uint _tokenId) public onlyNFTholder returns (uint){
        require(nftMarketplace.available(_tokenId),"NFT not for sale");
        require(doesProposalExists[_tokenId]==false,"Proposal alredy exists");
        Proposal storage proposal = proposals[numProposals];
        proposal.nftTokenId = _tokenId;
        proposal.deadline = block.timestamp + 5 minutes;
        numProposals++;
        doesProposalExists[_tokenId] = true;
        return numProposals-1;      
    }

    function vote(uint _proposalId, Vote _vote) external onlyNFTholder activeProposalOnly( _proposalId) {
        Proposal storage proposal = proposals[_proposalId];

        uint256 voterNFTBalance = cryptoDevsNFT.balanceOf(msg.sender);
        uint256 numVotes = 0;

        // Calculate how many NFTs are owned by the voter
        // that haven't already been used for voting on this proposal
        for (uint256 i = 0; i < voterNFTBalance; i++) {
            uint256 tokenId = cryptoDevsNFT.tokenOfOwnerByIndex(msg.sender, i);
            if (proposal.voters[tokenId] == false) {
                numVotes++;
                proposal.voters[tokenId] = true;
            }
        }
        require(numVotes > 0, "ALREADY_VOTED");

        if (_vote == Vote.Yes) {
            proposal.yesVotes += numVotes;
        } else {
            proposal.noVotes += numVotes;
        }
    }

    function executeProposal(uint256 proposalIndex) external onlyNFTholder inactiveProposalOnly(proposalIndex)
    {
        Proposal storage proposal = proposals[proposalIndex];

        if (proposal.yesVotes > proposal.noVotes) {
            uint256 nftPrice = nftMarketplace.getPrice();
            require(address(this).balance >= nftPrice, "NOT_ENOUGH_FUNDS");
            nftMarketplace.purchase{value: nftPrice}(proposal.nftTokenId);
        }

        doesProposalExists[proposal.nftTokenId]=false;
        proposal.executed = true;
    }

    function withdrawEther() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to withdraw, contract balance empty");
        (bool sent, ) = payable(owner()).call{value: amount}("");
        require(sent, "FAILED_TO_WITHDRAW_ETHER");
    }

    receive() external payable {}

    fallback() external payable {}
}

