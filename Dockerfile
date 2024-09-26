FROM node:20.17.0-bookworm-slim 
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Required for node-oracledb
# RUN apt-get update \
#     && apt-get install -y gcc g++ make cmake \
#     && rm -rf /var/lib/apt/lists/*

# We are copying root yarn.lock file to the context folder during the Publish GH
# action. So, a process will use the root lock file here.
WORKDIR /app
COPY . .
# RUN npm install -g node-gyp
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm install
# RUN yarn policies set-version v1.22.22
RUN yarn config set network-timeout 600000 -g

RUN ["npm", "run", "build"]
EXPOSE 1337
CMD ["npm", "run", "develop", "--debug"]
