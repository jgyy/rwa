import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rwa.com' },
    update: {},
    create: {
      email: 'admin@rwa.com',
      username: 'admin',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true,
      walletAddress: '0x1234567890123456789012345678901234567890',
    },
  });

  // Create test users
  const userPassword = await bcrypt.hash('user123', 10);
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      username: 'johndoe',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      emailVerified: true,
      walletAddress: '0x2345678901234567890123456789012345678901',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      username: 'janedoe',
      password: userPassword,
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'ISSUER',
      emailVerified: true,
      walletAddress: '0x3456789012345678901234567890123456789012',
    },
  });

  // Create sample assets
  const asset1 = await prisma.asset.create({
    data: {
      name: 'Luxury Apartment NYC',
      description: 'Premium 2-bedroom apartment in Manhattan with stunning city views',
      category: 'REAL_ESTATE',
      status: 'ACTIVE',
      totalSupply: 1000,
      availableSupply: 800,
      price: 1000,
      currency: 'USD',
      metadataUri: 'ipfs://QmSampleHash1',
      imageUrl: 'ipfs://QmSampleImageHash1',
      legalName: 'NYC Luxury Properties LLC',
      jurisdiction: 'New York, USA',
      valuationAmount: 1000000,
      valuationDate: new Date('2024-01-15'),
      ownerId: user2.id,
      creatorId: user2.id,
      attributes: {
        create: [
          { traitType: 'Location', value: 'Manhattan, NYC' },
          { traitType: 'Size', value: '1200 sq ft' },
          { traitType: 'Bedrooms', value: '2' },
          { traitType: 'Bathrooms', value: '2' },
          { traitType: 'Floor', value: '15' },
        ],
      },
      documents: {
        create: [
          {
            name: 'Property Deed',
            type: 'OWNERSHIP',
            url: 'ipfs://QmDeedHash',
            isPublic: false,
            isVerified: true,
            uploadedBy: user2.id,
          },
          {
            name: 'Valuation Report',
            type: 'VALUATION',
            url: 'ipfs://QmValuationHash',
            isPublic: true,
            isVerified: true,
            uploadedBy: user2.id,
          },
        ],
      },
    },
  });

  const asset2 = await prisma.asset.create({
    data: {
      name: 'Gold Bullion - 1kg',
      description: 'Physical gold bullion stored in certified vault',
      category: 'COMMODITY',
      status: 'ACTIVE',
      totalSupply: 100,
      availableSupply: 100,
      price: 65000,
      currency: 'USD',
      metadataUri: 'ipfs://QmSampleHash2',
      imageUrl: 'ipfs://QmSampleImageHash2',
      legalName: 'Gold Vault Storage Inc',
      jurisdiction: 'Switzerland',
      valuationAmount: 6500000,
      valuationDate: new Date('2024-02-01'),
      ownerId: user2.id,
      creatorId: user2.id,
      attributes: {
        create: [
          { traitType: 'Weight', value: '1kg' },
          { traitType: 'Purity', value: '99.99%' },
          { traitType: 'Storage Location', value: 'Zurich Vault' },
          { traitType: 'Certification', value: 'LBMA Good Delivery' },
        ],
      },
    },
  });

  const asset3 = await prisma.asset.create({
    data: {
      name: 'Vintage Art Collection',
      description: 'Curated collection of 20th century modern art pieces',
      category: 'ART',
      status: 'ACTIVE',
      totalSupply: 500,
      availableSupply: 500,
      price: 2000,
      currency: 'USD',
      metadataUri: 'ipfs://QmSampleHash3',
      imageUrl: 'ipfs://QmSampleImageHash3',
      legalName: 'Fine Arts Holdings',
      jurisdiction: 'London, UK',
      valuationAmount: 1000000,
      valuationDate: new Date('2024-01-20'),
      ownerId: admin.id,
      creatorId: admin.id,
      attributes: {
        create: [
          { traitType: 'Collection Size', value: '15 pieces' },
          { traitType: 'Era', value: '1950-1980' },
          { traitType: 'Storage', value: 'Climate Controlled' },
          { traitType: 'Insurance', value: 'Fully Insured' },
        ],
      },
    },
  });

  // Create sample transactions
  await prisma.transaction.create({
    data: {
      type: 'MINT',
      status: 'COMPLETED',
      assetId: asset1.id,
      fromUserId: user2.id,
      toAddress: user2.walletAddress!,
      amount: 1000,
      price: 1000000,
      currency: 'USD',
      transactionHash: '0xabc123def456789',
      blockNumber: BigInt(1000000),
      completedAt: new Date(),
    },
  });

  await prisma.transaction.create({
    data: {
      type: 'PURCHASE',
      status: 'COMPLETED',
      assetId: asset1.id,
      fromUserId: user1.id,
      toAddress: user1.walletAddress!,
      amount: 200,
      price: 200000,
      currency: 'USD',
      transactionHash: '0xdef456789abc123',
      blockNumber: BigInt(1000001),
      completedAt: new Date(),
    },
  });

  // Create sample bids
  await prisma.bid.create({
    data: {
      assetId: asset1.id,
      bidderId: user1.id,
      amount: 50,
      pricePerToken: 950,
      totalPrice: 47500,
      currency: 'USD',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  // Create sample activities
  await prisma.activity.createMany({
    data: [
      {
        type: 'ASSET_CREATED',
        description: 'Created asset: Luxury Apartment NYC',
        userId: user2.id,
        assetId: asset1.id,
      },
      {
        type: 'ASSET_MINTED',
        description: 'Minted 1000 tokens for Luxury Apartment NYC',
        userId: user2.id,
        assetId: asset1.id,
      },
      {
        type: 'TRANSACTION_COMPLETED',
        description: 'Purchased 200 tokens of Luxury Apartment NYC',
        userId: user1.id,
        assetId: asset1.id,
      },
    ],
  });

  // Create sample notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,
        type: 'TRANSACTION',
        title: 'Purchase Successful',
        message: 'You have successfully purchased 200 tokens of Luxury Apartment NYC',
      },
      {
        userId: user2.id,
        type: 'BID',
        title: 'New Bid Received',
        message: 'You received a new bid for Luxury Apartment NYC',
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log('Created users:', { admin, user1, user2 });
  console.log('Created assets:', { asset1, asset2, asset3 });
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });