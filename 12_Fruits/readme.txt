// setup mongo 
// https://www.mongodb.com/try/download/community     
// choose msi for windows.
C:\Program Files\MongoDB\Server\8.2\bin
cmd --> ./mongod   // d stands for daemon. it is not native to windows, but it is a standard implemented.  
or alt: ./mongod --dbpath C:\data\db  // on Windows, use a full drive path; "/data/db" is Unix-style and wrong on C: drive
in C:\ make this --> C:\data\db

// use mongosh / mongo shell
// https://www.mongodb.com/try/download/terraform-provider 
    //MongoDB Shell -- .zip
C:\Program Files\mongosh-2.8.2-win32-x64\bin
./mongosh to get into the shell. 
