# 14-TRANSCENDENCE

Installation (version sans makefile)
1. git clone le projet
2. a la racine du projet, creer un fichier .env vide
3. a la racine du projet, dans un terminal, entrer "docker compose up"
4. une fois le build fait (env. 5min actullement), utiliser les commandes habituelles de docker (ou l'application desktop)

Installation (version avec makefile)
1. git clone le projet
2. a la racine du projet, dans un terminal, entrer "make"
   - le fichier .env se cree automatiquement
   - lancement de docker compose up automatiquement
   - disponibilite des logs soit de builds (auto) ou des dockers (avec la commande "make logs")


***IMPORTANT : Lorsque les modèles prisma ont été modifiés, ou simplement que la base de données a été restet 
   Lancez cette commande à la racine du container backend :   "npx prisma migrate deploy"
