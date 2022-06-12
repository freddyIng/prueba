-First and foremost, make sure you have nodejs and postgresql installed on your operating system. This application was tested on a debian 9 operating system with node version 14.15.0 and postgresql version 13.1

-Next, make sure to create an .env file with the following parameters:

DB_USER=yourDatabaseUser

DB_DATABASE=YourDatabase

DB_PASSWORD=YourPassword

DB_HOST=localhost

EMAIL_USER=yourEmailUser (It must be outlook/hotmail, since this application is configured for that email provider)

EMAIL_PASSWORD=YourEmailPassword

AWS_S3_BUCKET=YourBucket

AWS_S3_KEY=YourKey

AWS_S3_SECRET=YourSecret

AWS_S3_REGION=BucketRegion

UNSPLASH_KEY=YourUnplashApiKey (https://unsplash.com/)

-Install dependencies (npm install)

-Next, create the database using the "db.js" file found in your archive directory by running the command "node db.js"

-Run the application with the command "node app.js"

-If you want test the api, you can  open the browser and go to localhost:5000, I create a html template for that,
or use postman or some equivalent tool