# base image 
FROM node:20

# thiet lap thu muc lam viec cho container
WORKDIR /app/admin

# sao chep file package*.json 
COPY package*.json ./

# cai dat cac dependencies 
RUN npm install

# sao chep toan bo source code vao container
COPY . .

# thiet lap port cho container
EXPOSE 5173

# chay ung dung
CMD ["npm", "run", "dev", "--", "--host"]