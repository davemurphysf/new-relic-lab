FROM nginx:1.15

WORKDIR /app

COPY nginx-nr-agent.ini /etc/nginx-nr-agent/nginx-nr-agent.ini

RUN ln -sf /dev/stdout /var/log/nginx-nr-agent.log

RUN nohup bash -c "service nginx-nr-agent start &"

COPY nginx.conf /etc/nginx/nginx.conf

COPY nr-app/build /app