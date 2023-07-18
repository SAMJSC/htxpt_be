###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18-alpine As development

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND yarn.lock.
# Copying this first prevents re-running yarn install on every code change.
COPY --chown=node:node package.json yarn.lock ./

# Copy .env
COPY --chown=node:node .env ./

# Install app dependencies using the `yarn install` command
RUN yarn install --frozen-lockfile

# Bundle app source
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:18-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

# Copy .env
COPY --chown=node:node .env ./

# In order to run `yarn run build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `yarn install` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN yarn run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Running `yarn install --production` ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN yarn install --production && yarn cache clean

USER node

###################
# PRODUCTION
###################

FROM node:18-alpine As production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Copy .env
COPY --chown=node:node .env ./

# Start the server using the production build
CMD [ "node", "dist/main.js" ]

# HEALTHCHECK
# In this case, we're using curl to make a request to the health check endpoint.
# We are also assuming that the app runs on port 3000 - if not, you should change the port.
HEALTHCHECK --interval=5m --timeout=3s \
  CMD curl -f http://localhost:3000/health-check || exit 1