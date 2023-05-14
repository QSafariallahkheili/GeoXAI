FROM node:lts-alpine as build-stage

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

RUN npm install @vue/cli@5.0.8 -g

COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .

RUN npm run build

# production stage: create NGINX server
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d
RUN rm -rf /usr/share/nginx/html/*
ENV PORT = 8080
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]