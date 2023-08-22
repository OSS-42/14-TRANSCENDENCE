/*
    Le fichier monfichier.entity.ts est généralement utilisé dans le contexte 
    d'une application NestJS pour définir la structure de vos entités de base de données, 
    notamment si vous utilisez un système de gestion de base de données relationnelle 
    tel que PostgreSQL avec prisma.

    Ces fichiers d'entité sont importants dans le contexte de NestJS car ils sont utilisés par 
    des outils tels que prisma pour créer et gérer automatiquement les schémas de base de données 
    à partir de ces définitions d'entité. Ils sont essentiels pour définir la structure de votre 
    base de données, les relations entre les tables, les types de données, etc.

    Une fois que vous avez défini vos entités, vous pouvez les utiliser dans vos services pour 
    effectuer des opérations de base de données telles que la création, la récupération, la mise
    à jour et la suppression d'enregistrements. Ces fichiers sont donc fondamentaux pour la 
    persistance des données dans une application NestJS avec une base de données.
*/

export class Message {
    name: string;
    text: string;
}
