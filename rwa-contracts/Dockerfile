# Contracts Dockerfile for Hardhat Node
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY .npmrc* ./
RUN npm ci

# Copy contract files
COPY . .

# Compile contracts
RUN npx hardhat compile

# Expose Hardhat node port
EXPOSE 8545

# Run Hardhat node
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]