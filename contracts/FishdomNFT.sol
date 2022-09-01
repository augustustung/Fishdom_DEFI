//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FishdomNFT is ERC721Enumerable {
    using Strings for uint256;
    using Counters for Counters.Counter;

    string private constant _baseExtension = ".json";

    Counters.Counter private _tokenCounter;
    string private _baseUri;
    address private _owner;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseUri_
    ) ERC721(name_, symbol_) {
        _baseUri = baseUri_;
        _owner = msg.sender;
        _tokenCounter.increment();
    }

    // setBaseUri for NFT
    function setBaseUri(string calldata baseUri_) external onlyOwner {
        _baseUri = baseUri_;
    }

    // Return base for NFT
    function _baseURI() internal view override returns (string memory) {
        return _baseUri;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(_baseURI(), tokenId.toString(), _baseExtension)
            );
    }

    /**
     * @dev Only mint for the owner
     * @param number - the number crown
     */
    function mint(uint256 number) external onlyOwner {
        for (uint256 i = 0; i < number; i++) {
            _mint(msg.sender, _tokenCounter.current());
            _tokenCounter.increment();
        }
    }

    function burn(uint256 tokenId) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "CROWNNFT: Not owner or approved by owner"
        );
        _burn(tokenId);
    }

    function ownerToTokenArray(address account)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory ownerArray = new uint256[](balanceOf(account));
        for (uint256 i = 0; i < balanceOf(account); i++) {
            ownerArray[i] = tokenOfOwnerByIndex(account, i);
        }
        return ownerArray;
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        _owner = newOwner;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "FishdomNFT: Only owner");
        _;
    }
}
