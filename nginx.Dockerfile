FROM nginx
COPY nginx.conf.template /etc/nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]