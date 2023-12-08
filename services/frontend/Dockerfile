FROM node:lts-alpine as build-stage

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

RUN npm install @vue/cli@5.0.8 -g

COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .

# Build and clean up
RUN npm run build --prod \
    && npm prune --production \
    && rm -rf node_modules


# production stage: create NGINX server
FROM nginx:stable-alpine as production-stage

COPY nginx.conf /etc/nginx/nginx.conf
## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage ./app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]



