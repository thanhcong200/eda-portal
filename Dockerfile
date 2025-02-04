# FROM node:20.17.0-bookworm-slim 
FROM dockerhub-proxy.aws.platform.vpbank.dev/dainv85/strapi-base:5.0.0_3
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Required for package install
RUN rm -rf /var/lib/apt/lists/*
# RUN mv /etc/apt/sources.list /etc/apt/sources.list.bak
# RUN mv /etc/apt/sources.list.d /etc/apt/sources.list.d.bak
RUN echo "deb [trusted=yes] https://registry.aws.platform.vpbank.dev/repository/deb-debian-12-proxy/ bookworm main" | \
    tee /etc/apt/sources.list.d/nexus.list > /dev/null

RUN apt-get update \
    && apt-get install -y gcc g++ make cmake \
    && rm -rf /var/lib/apt/lists/*

# We are copying root yarn.lock file to the context folder during the Publish GH
# action. So, a process will use the root lock file here.
WORKDIR /app
COPY . .
# RUN npm install -g node-gyp
RUN npm config set fetch-retry-maxtimeout 600000 -g \
    && npm config set registry https://registry.aws.platform.vpbank.dev/repository/npm-proxy -g \
    && npm config set strict-ssl false -g 

# RUN yarn policies set-version v1.22.22
RUN yarn config set network-timeout 600000 -g \
    && yarn config set registry https://registry.aws.platform.vpbank.dev/repository/npm-proxy -g \
    && yarn config set strict-ssl false -g \
    && yarn config set fetch-retry-maxtimeout 600000 -g

# Download all dependencies
RUN npm install
    
RUN ["npm", "run", "build"]
EXPOSE 1337
CMD ["npm", "run", "develop", "--debug"]
