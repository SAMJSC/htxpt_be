FROM node:16.18.1
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

EXPOSE 3939

RUN chmod +x entry-cmd.sh
ENTRYPOINT ["./entry-cmd.sh"]