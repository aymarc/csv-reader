#Use the official Node.js 20 base image
FROM node:20

#Set the working directory
WORKDIR /usr/src/app

#Copy package.json and package-lock.json to install dependencies
COPY package*.json ./
RUN npm install

#Copy all source code
COPY . .

#Compile TypeScript to JavaScript
#This command is crucial to create the dist folder.
RUN npm run build

#Expose the application's port
EXPOSE 5000

#Command to start the application
CMD ["npm", "start"]