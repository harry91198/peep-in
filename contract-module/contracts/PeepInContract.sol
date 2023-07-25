// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@opengsn/contracts/src/ERC2771Recipient.sol";

contract PeepInContract is Initializable, UUPSUpgradeable, OwnableUpgradeable, ERC2771Recipient {

    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIdCounter;
    event NewEntry(uint256 indexed tokenId, address indexed to, string uri);
    event ReviewSubmitted(uint256 indexed tokenId, address indexed reviewer, uint256 rating, uint256 timestamp, string reviewLink);

    mapping(uint256 => address) public ownerOf; // mapping for storing owner of the company (tokenId => owner)
    mapping(uint256 => string) public companyMetadata; // mapping for storing company metadata (tokenId => metadata)
    uint256 public totalCom; // total number of companies registered on the platform

    // structure that will store rating, timestamp & reviewLink
    struct ReviewData {
        uint128 rating;
        uint128 timestamp;
        string reviewLink;
    }
    // structure that will store totalRating & totalCount
    struct RatingData {
        uint128 totalRating;
        uint128 totalCount;
    }

    // mapping for storing reviews structure for tokenId and reviewAddress
    mapping(uint256 => mapping(address => ReviewData)) private Review; 
    // mapping for storing ratingData structure for tokenId
    mapping(uint256 => RatingData) public ratingsData;
    uint256 constant public RATING_PRECISION = 1000000; // 10^6 decimal places added for precision
    mapping(address => uint256) public ownerIs; // mapping for storing tokenId of the owner (owner => tokenId)
    /// @custom:oz-upgrades-unsafe-allow constructor    
    constructor() {
        _disableInitializers();
    }
    function initialize(address trustedForwarder_) initializer public {

        __Ownable_init();

        __UUPSUpgradeable_init();
        _setTrustedForwarder(trustedForwarder_); // set trustedForwarder for Biconomy gasless transactions support

        _tokenIdCounter.increment();//because we want it to start company list index from 1 & not 0

    }

    /**
     * @notice register a company on the platform
     * @dev onlyOwner can call this function
     * @param to address to which company will be registered
     * @param uri string URI where company metadata stored
     */
    function addCompany(address to, string memory uri) external onlyOwner {
        require(ownerIs[to] == 0, "Address is already owner of a company");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        ownerOf[tokenId] = to;
        ownerIs[to] = tokenId;
        companyMetadata[tokenId] = uri;
        totalCom++;
        emit NewEntry(tokenId, to, uri);
    }

    /**
     * @notice edit details of a company stored on the platform
     * @dev owner of the company(tokenId) can call this function
     * @param tokenId uint256 token ID to edit the details for
     * @param uri string new URI where company metadata stored
     */
    function editCompany(uint256 tokenId, string memory uri) external {
        require(ownerOf[tokenId] == _msgSender(), "Caller is not the owner");
        companyMetadata[tokenId] = uri;
        emit NewEntry(tokenId, ownerOf[tokenId], uri);
    }

    /**
     * @notice submits the reviews for the given token ID by function caller
     * @dev checks rating range emits ReviewSubmitted event after updating average rating
     * @param tokenId uint256 token ID to submit the rating/reviews for
     * @param rating uint128 ranging between 1 & 5
     * @param reviewLink string URI where reviews get stored
     */
    function submitReview(uint256 tokenId, uint128 rating, string memory reviewLink) public {
        require(rating >= 1 && rating <= 5, "Invalid rating"); // Assuming rating ranges from 1 to 5

        // Update the avg rating of this company's tokenID
        updateAverageRating(tokenId, Review[tokenId][_msgSender()].rating, rating);

        // Create a new structReview
        ReviewData memory newReviewData = ReviewData({
            rating: rating,
            timestamp: uint128(block.timestamp),
            reviewLink: reviewLink
        });

        // Add the newReviewData to the mapping
        Review[tokenId][_msgSender()] = newReviewData;

        // Emit the event
        emit ReviewSubmitted(tokenId, _msgSender(), rating, block.timestamp, reviewLink);
    }

    /**
     * @notice Function to get specific reviewDetails for a given company tokenId and reviewer address
     * @param tokenId uint256 token ID to get the rating/reviews for
     * @param reviewer address of reviewer
     * @return rating uint128 rating points 
     * @return timestamp uint128 time at which rating was posted
     * @return reviewLink string uri where reviewContent is stored
     */
    function getReview(uint256 tokenId, address reviewer) public view returns (uint128, uint128, string memory) {
        ReviewData memory review = Review[tokenId][reviewer];
        return (review.rating, review.timestamp, review.reviewLink);
    }

    // function called internally to update average rating for a given tokenId 
    // after a new rating is submitted or edited by a reviewer
    function updateAverageRating(uint256 tokenId, uint128 oldRating, uint128 newRating) internal {
        if(oldRating == 0){
            // first time rating
            ratingsData[tokenId].totalRating += newRating;
            ratingsData[tokenId].totalCount += 1;
        }else{
            // not first time rating
            ratingsData[tokenId].totalRating = ratingsData[tokenId].totalRating + newRating - oldRating;
        }
    }

    /**
     * @notice Function to get average rating for specific tokenId
     * @param tokenId uint256 token ID to get the average rating for
     * @return avgRating uint256 totalRating/totalCount
     */
    function getAverageRating(uint256 tokenId) public view returns (uint256) {
        if (ratingsData[tokenId].totalCount == 0) return 0;
        return ratingsData[tokenId].totalRating * RATING_PRECISION / ratingsData[tokenId].totalCount;
    }



    /**
     * @notice function to withdraw fees to owner
     * @dev only owner can call this function
     * @param _to the address to withdraw fees to
     */
    function feesWithdraw(address payable _to) external onlyOwner{
        uint256 amount = (address(this)).balance;
        require(_to.send(amount), 'Fee Transfer to Owner failed.');
    }

    // The following functions are overrides required by Solidity.
    function _msgSender()
    internal
    view
    override(ContextUpgradeable, ERC2771Recipient)
    returns (address sender)
    {
        return super._msgSender();
    }

    function _msgData()
        internal
        view
        override(ContextUpgradeable, ERC2771Recipient)
        returns (bytes calldata)
    {
        return super._msgData();
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}
}