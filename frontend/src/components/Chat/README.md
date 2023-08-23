    ChatFooter : C'est le composant qui gère la saisie et l'envoi de messages. Lorsqu'un utilisateur entre un message, il est envoyé via le socket au serveur avec les détails tels que le texte du message, le nom de l'utilisateur, un identifiant unique, etc.

    Serveur Backend (NestJS) : Il écoute les messages entrants et les diffuse à tous les clients connectés. Vous avez un gestionnaire handleMessage qui diffuse les messages entrants à tous les clients connectés.

    Chat : C'est votre composant principal qui comprend la mise en page globale de la page de chat. Il gère également la réception des messages depuis le serveur et les affiche à l'aide du composant ChatBody.

    ChatBody : C'est le composant qui affiche les messages. Il reçoit les messages en tant que propriété et les affiche différemment selon qu'ils sont envoyés par l'utilisateur actuel ou par d'autres utilisateurs.