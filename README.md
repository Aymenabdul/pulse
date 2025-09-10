# Media analytics credentials : 

# cloudpanel and ssh access credentials 

Panel user name : admin
Panel password : #KKNpanel2727

ssh-key : ssh root@147.79.68.1ssh 
password : 2KRP7vC&y9nWDfSSoP)a

>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# Yt_tracker db credentials 

Database name : media
Database username :Mroot
Database password : An@lytics#2@25

>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# Pulz db credentials

Databasename : pulse
database username : Pulse
databasepassword : E$@db@pu!$e

>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# media tracker db credentials 

Db Name : mediatracker
Db User : media
Dbpassword : Medi@T*@c!(ER

# you need to use these credentials to run the backend 

# front end command to run the project and build the bundle 
# run command 
npm run dev
# build command 
npm run build

# run command for backend 
mvn clean install
mvn spring-boot:run
mvn clean package

# this command is for server to run the command without terminating the process

nohup java -jar <jar file name> --server.port=<port number> > output.log 2>&1 &