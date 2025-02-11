# Generated by https://smithery.ai. See: https://smithery.ai/docs/config#dockerfile
# Use a Node.js image as the base
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json tsconfig.json ./

# Install dependencies
RUN npm install --ignore-scripts

# Copy the source code
COPY src ./src

# Build the project
RUN npm run build

# Use a smaller Node.js image for the release stage
FROM node:18-alpine AS release

# Set the working directory
WORKDIR /app

# Copy the build artifacts and package.json
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies
RUN npm install --omit=dev

# Specify the command to run the MCP server
ENTRYPOINT ["node", "build/index.js"]
