import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';

/*
  Les fichiers .module.ts dans une application NestJS sont utilisés pour organiser et configurer 
  les différentes parties de votre application. Ils sont essentiels pour la structuration modulaire 
  et la gestion des dépendances dans votre application.

  import Statements : Vous importez les modules et les services nécessaires. Dans cet exemple, vous 
  importez le module Module de NestJS ainsi que les services MessagesService et MessagesGateway à 
  partir de fichiers locaux.

  @Module Decorator : Ce décorateur indique que la classe MessagesModule est un module NestJS. 
  Il prend un objet de configuration avec une propriété providers, qui spécifie les classes de 
  fournisseurs (services) associées à ce module. Dans ce cas, vous déclarez que ce module utilise 
  MessagesGateway et MessagesService comme fournisseurs.

  Providers : Dans le tableau providers, vous spécifiez les classes qui sont des fournisseurs de ce 
  module. Les fournisseurs sont des composants qui peuvent être injectés ailleurs dans votre application. 
  Ici, MessagesGateway et MessagesService sont des fournisseurs pour ce module.

  En résumé, le module MessagesModule définit les fournisseurs de services MessagesGateway et 
  MessagesService pour être utilisés dans d'autres parties de votre application. Ce module e
  ncapsule la logique liée aux messages et expose ces services aux autres modules de votre 
  application NestJS, leur permettant ainsi d'accéder à la logique de messagerie définie 
  dans MessagesService et d'utiliser les fonctionnalités de MessagesGateway pour la communication 
  en temps réel.
*/

@Module({
  providers: [MessagesGateway, MessagesService]
})
export class MessagesModule {}
