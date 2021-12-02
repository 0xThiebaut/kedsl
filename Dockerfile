FROM node:16.13.0

# Add Kibana requirements
RUN ["npm", "install", "-g", "node-gyp"]
# Clone Kibana
RUN ["git", "clone", "--branch", "v8.0.0-beta1", "https://github.com/elastic/kibana.git", "/kibana"]
# Build Kibana
WORKDIR /kibana
RUN ["yarn", "kbn", "bootstrap"]
# Link Yarn
WORKDIR /kibana/bazel-out/k8-fastbuild/bin/packages/kbn-es-query/kibana/bazel-out/k8-fastbuild/bin/packages/kbn-es-query
RUN ["yarn", "link"]

# Copy kedsl files
COPY package.json tsconfig.json index.ts /kedsl/
# Install
WORKDIR /kedsl
RUN ["npm", "install"]
# Link Yarn
RUN ["yarn", "link", "@kbn/es-query"]
# Compile kedsl
RUN ["npx", "tsc"]
# Run Kuery
WORKDIR /kedsl/out
ENTRYPOINT ["node", "index.js"]
