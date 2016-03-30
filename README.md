# ms-molecules
An Interface for Requesting and Uploading Molecules

##Building and Running
`docker build -t molecules .`
`docker run --rm -i -t -p 3000:3000 --link postgres:postgres -v $PWD:/src users /bin/sh`
 where the names of the microservice containers are on the left side of the :

 where $PWD is a variable to your current directory and may need changing if you are using a windows environment


