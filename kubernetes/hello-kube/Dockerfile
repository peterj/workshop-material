FROM node:10-alpine as builder
ENV NODE_ENV "production"

COPY package*.json /app/
# Use npm ci for a clean install
RUN cd /app && npm ci

WORKDIR /app
COPY . .

# Remove extra packages
RUN npm prune --production

FROM builder
CMD [ "npm", "start"]