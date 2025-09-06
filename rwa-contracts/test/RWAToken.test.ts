import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract } from "ethers";

describe("RWAToken", function () {
  let rwaToken: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy contract
    const RWAToken = await ethers.getContractFactory("RWAToken");
    rwaToken = await RWAToken.deploy(
      "Real World Asset Token",
      "RWA",
      "ipfs://QmSampleMetadataURI"
    );
    await rwaToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await rwaToken.owner()).to.equal(owner.address);
    });

    it("Should set the correct name and symbol", async function () {
      expect(await rwaToken.name()).to.equal("Real World Asset Token");
      expect(await rwaToken.symbol()).to.equal("RWA");
    });

    it("Should set the base URI", async function () {
      expect(await rwaToken.baseURI()).to.equal("ipfs://QmSampleMetadataURI");
    });
  });

  describe("Minting", function () {
    it("Should mint a new token", async function () {
      const tokenId = 1;
      const amount = 1000;
      
      await expect(rwaToken.mint(addr1.address, tokenId, amount))
        .to.emit(rwaToken, "AssetMinted")
        .withArgs(addr1.address, tokenId, amount);
      
      expect(await rwaToken.balanceOf(addr1.address, tokenId)).to.equal(amount);
    });

    it("Should only allow owner to mint", async function () {
      const tokenId = 1;
      const amount = 1000;
      
      await expect(
        rwaToken.connect(addr1).mint(addr2.address, tokenId, amount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should mint batch tokens", async function () {
      const tokenIds = [1, 2, 3];
      const amounts = [100, 200, 300];
      
      await rwaToken.mintBatch(addr1.address, tokenIds, amounts);
      
      for (let i = 0; i < tokenIds.length; i++) {
        expect(await rwaToken.balanceOf(addr1.address, tokenIds[i])).to.equal(amounts[i]);
      }
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      // Mint some tokens for testing
      await rwaToken.mint(addr1.address, 1, 1000);
    });

    it("Should transfer tokens between accounts", async function () {
      const tokenId = 1;
      const amount = 100;
      
      await expect(
        rwaToken.connect(addr1).safeTransferFrom(
          addr1.address,
          addr2.address,
          tokenId,
          amount,
          "0x"
        )
      ).to.emit(rwaToken, "TransferSingle");
      
      expect(await rwaToken.balanceOf(addr1.address, tokenId)).to.equal(900);
      expect(await rwaToken.balanceOf(addr2.address, tokenId)).to.equal(100);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const tokenId = 1;
      const amount = 2000; // More than minted
      
      await expect(
        rwaToken.connect(addr1).safeTransferFrom(
          addr1.address,
          addr2.address,
          tokenId,
          amount,
          "0x"
        )
      ).to.be.revertedWith("ERC1155: insufficient balance for transfer");
    });

    it("Should handle batch transfers", async function () {
      // Mint additional tokens
      await rwaToken.mint(addr1.address, 2, 500);
      await rwaToken.mint(addr1.address, 3, 300);
      
      const tokenIds = [1, 2, 3];
      const amounts = [100, 50, 30];
      
      await rwaToken.connect(addr1).safeBatchTransferFrom(
        addr1.address,
        addr2.address,
        tokenIds,
        amounts,
        "0x"
      );
      
      for (let i = 0; i < tokenIds.length; i++) {
        expect(await rwaToken.balanceOf(addr2.address, tokenIds[i])).to.equal(amounts[i]);
      }
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await rwaToken.mint(addr1.address, 1, 1000);
    });

    it("Should burn tokens", async function () {
      const tokenId = 1;
      const amount = 100;
      
      await expect(rwaToken.connect(addr1).burn(addr1.address, tokenId, amount))
        .to.emit(rwaToken, "AssetBurned")
        .withArgs(addr1.address, tokenId, amount);
      
      expect(await rwaToken.balanceOf(addr1.address, tokenId)).to.equal(900);
    });

    it("Should not allow burning more than balance", async function () {
      const tokenId = 1;
      const amount = 2000;
      
      await expect(
        rwaToken.connect(addr1).burn(addr1.address, tokenId, amount)
      ).to.be.revertedWith("ERC1155: burn amount exceeds balance");
    });

    it("Should only allow token owner to burn their tokens", async function () {
      const tokenId = 1;
      const amount = 100;
      
      await expect(
        rwaToken.connect(addr2).burn(addr1.address, tokenId, amount)
      ).to.be.revertedWith("Caller is not token owner");
    });
  });

  describe("Pausing", function () {
    it("Should pause and unpause transfers", async function () {
      await rwaToken.mint(addr1.address, 1, 1000);
      
      // Pause the contract
      await rwaToken.pause();
      expect(await rwaToken.paused()).to.be.true;
      
      // Try to transfer while paused
      await expect(
        rwaToken.connect(addr1).safeTransferFrom(
          addr1.address,
          addr2.address,
          1,
          100,
          "0x"
        )
      ).to.be.revertedWith("Pausable: paused");
      
      // Unpause
      await rwaToken.unpause();
      expect(await rwaToken.paused()).to.be.false;
      
      // Transfer should work now
      await rwaToken.connect(addr1).safeTransferFrom(
        addr1.address,
        addr2.address,
        1,
        100,
        "0x"
      );
      
      expect(await rwaToken.balanceOf(addr2.address, 1)).to.equal(100);
    });

    it("Should only allow owner to pause/unpause", async function () {
      await expect(rwaToken.connect(addr1).pause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
      
      await expect(rwaToken.connect(addr1).unpause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });

  describe("URI Management", function () {
    it("Should return correct URI for tokens", async function () {
      const tokenId = 1;
      await rwaToken.mint(addr1.address, tokenId, 100);
      
      const uri = await rwaToken.uri(tokenId);
      expect(uri).to.equal("ipfs://QmSampleMetadataURI/1");
    });

    it("Should update base URI", async function () {
      const newURI = "ipfs://QmNewMetadataURI";
      
      await rwaToken.setBaseURI(newURI);
      expect(await rwaToken.baseURI()).to.equal(newURI);
      
      const tokenId = 1;
      await rwaToken.mint(addr1.address, tokenId, 100);
      expect(await rwaToken.uri(tokenId)).to.equal("ipfs://QmNewMetadataURI/1");
    });

    it("Should only allow owner to update URI", async function () {
      await expect(
        rwaToken.connect(addr1).setBaseURI("ipfs://QmUnauthorized")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Supply Tracking", function () {
    it("Should track total supply correctly", async function () {
      const tokenId = 1;
      
      // Initial supply should be 0
      expect(await rwaToken.totalSupply(tokenId)).to.equal(0);
      
      // Mint tokens
      await rwaToken.mint(addr1.address, tokenId, 1000);
      expect(await rwaToken.totalSupply(tokenId)).to.equal(1000);
      
      // Mint more
      await rwaToken.mint(addr2.address, tokenId, 500);
      expect(await rwaToken.totalSupply(tokenId)).to.equal(1500);
      
      // Burn some
      await rwaToken.connect(addr1).burn(addr1.address, tokenId, 200);
      expect(await rwaToken.totalSupply(tokenId)).to.equal(1300);
    });
  });
});