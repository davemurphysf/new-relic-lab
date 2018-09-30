FROM nginx:1.15

WORKDIR /tmp

RUN set -x \
	&& apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y python python-daemon python-setproctitle

COPY nginx-nr-agent_2.0.0-11_all.deb .

RUN ["dpkg", "-i", "nginx-nr-agent_2.0.0-11_all.deb"]

RUN ["apt-get", "install", "-f"]

WORKDIR /app

COPY nginx-nr-agent.ini /etc/nginx-nr-agent/nginx-nr-agent.ini

RUN ln -sf /dev/stdout /var/log/nginx-nr-agent.log

RUN nohup bash -c "service nginx-nr-agent start &"

COPY nginx.conf /etc/nginx/nginx.conf

COPY nr-app/build /app