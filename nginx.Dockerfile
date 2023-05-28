ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

FROM nginx
COPY nginx.conf.${NODE_ENV}.template /etc/nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]