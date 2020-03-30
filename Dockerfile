# LATEST LTS release
FROM node:lts-alpine

# Copy app, define workdir
RUN mkdir -p /opt/app
COPY . /opt/app
WORKDIR /opt/app

# Updates, upgrades, dependencies and build
RUN apk update && \
  apk upgrade --no-cache

# Install app's dependencies and build
RUN npm install --no-optional && \
  npm cache clean --force && \
  npm run build

# Expose port
EXPOSE 80

# Don't run app as root
USER node

# Start
CMD ["npm", "run", "start"]
