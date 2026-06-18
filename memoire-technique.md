### auth - bettterauth / primsa 

lib/auth.ts 

prisma to store and compare user info, betterauth for authentification and roles, implemented brute force protection  

auth client calls the api that then handls the login the auth set up 

 ### middleware 

on vérifie si on est connecté et on redirige. 
Sécurise l'application avant même qu'elle s'affiche 
s'execute sur le edge donc très rapide 

### prisma 
shchema.prisma holds the LDD schema 

### actions are server side queries and compute 

fonction asynchrone sur le serveur 