
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Utilisateur } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}


  async getUserInfo(username: string): Promise<{ id: number, username: string, avatar: string, is2FA: boolean, is2FAValidated: boolean }> {
    const user = await this.prisma.utilisateur.findFirst({
      where: {
        username: username,
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        is2FA: true,
        is2FAValidated:true

      },
    });

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return user;
  }

  async getUserInfoPlus(id: number): Promise<{ id: number, username: string, avatar: string, is2FA: boolean,  is2FAValidated:boolean }> {
    const user = await this.prisma.utilisateur.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        is2FA: true,
        is2FAValidated:true
      },
    });
  
    if (!user) {
      throw new NotFoundException("User not found");
    }
  
    return user;
  }
  
  

  async getAllUsers(): Promise<{ id: number, username: string, avatar: string, is2FA: boolean,  is2FAValidated:boolean }[]> {
    const usersData = await this.prisma.utilisateur.findMany({
      select: {
        id: true,
        username: true,
        avatar: true,
        is2FA : true,
        is2FAValidated:true
      },
    });
  
    return usersData;
  }

  //cette fonction est encore tr's myst/reiuse pour moi haha
  async getFriendsList(user: Utilisateur): Promise<{ id: number, username: string, avatar: string }[]> {
    const friendsList = await this.prisma.utilisateur
      .findUnique({
        where: { id: user.id },
      })
      .friends({
        select: {
          friend: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
  
    if (!friendsList) {
      throw new NotFoundException("User not found");
    }
  
    // Extract the friend data from the nested structure
    const friendsData = friendsList.map((friendship) => friendship.friend);
  
    return friendsData;
  }

  async addFriend(user: Utilisateur, username: string) {
    const friend = await this.getUserInfo(username);
    if (!friend) {
      throw new NotFoundException("Friend not found");
    }

    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [{ user: { id: user.id }, friend: { id: friend.id } }],
      },
    });
    if (existingFriendship) {
      throw new ConflictException("Friendship already exists");
    }
    if (user.username === username) {
      throw new ConflictException(
        "You can't yourself as friend, sorry you are ALONE"
      );
    }
    // Créer l'enregistrement d'amitié
    console.log(user.username + " and " + username + " are now friends");
    const friendship = await this.prisma.friendship.create({
      data: {
        user: { connect: { id: user.id } },
        friend: { connect: { id: friend.id } },
      },
    });
    return {  };
  }
  async destroyFriend(userId: number, friendUserId: number) {
    friendUserId = Number(friendUserId);
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        AND: [{ userId: userId }, { friendId: friendUserId }],
      },
    });

    if (!friendship) {
      throw new NotFoundException("Friendship not found");
    }

    // Supprimer l'amitié
    await this.prisma.friendship.delete({
      where: {
        id: friendship.id,
      },
    });
    return { };
  }

  async updateAvatar(user: Utilisateur, image: any) {

    const updatedUser = await this.prisma.utilisateur.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: image,
      },
      select: {
        id: true,
        avatar: true,
        username: true,
      },
    });
    return updatedUser;
  }

  async getUserMatchHistory(id: number) {
    id = Number(id);
    const user = await this.prisma.utilisateur.findUnique({
      where: { id },
      include: {
        matchHistoryWinner: {
          include: {
            winner: true,
            loser: true,
          },
        },
        matchHistoryLoser: {
          include: {
            winner: true,
            loser: true,
          },
        },
      },
    });

    const matchesWon  = user.matchHistoryWinner.map((match) => ({
      date: match.createdAt,
      winner: match.winner.username,
      loser: match.loser.username,
    }));

    const matchesLost  = user.matchHistoryLoser.map((match) => ({
      date: match.createdAt,
      winner: match.winner.username,
      loser: match.loser.username,
    }));
    console.log("voici lhistorique", matchesLost, matchesWon);
    return {
      matchesWon,
      matchesLost,
    };
  }

  async blockedUserIds(userId: number) {
    const id = Number(userId);
    const blockedUsers = await this.prisma.utilisateur.findUnique({
      where: { id: id },
      select: {
        blockedUsers: {
          select: {
            blockedUserId: true,
          },
        },
      },
    });

    if (!blockedUsers) {
      return [];
    } else {
      const blockedUserIds = blockedUsers.blockedUsers.map(
        (ban) => ban.blockedUserId
      );
      return blockedUserIds;
    }
  }

  async checkIfUserExist(username: string): Promise<boolean> {
    const user = await this.prisma.utilisateur.findFirst({
      where: {
        username: username,
      },
    });

    return !!user;
  }

  async updateUsername(user: Utilisateur, username: string) {
    const updatedUser = await this.prisma.utilisateur.update({
      where: {
        id: user.id,
      },
      data: {
        username: username,
      },
      select: {
        id: true,
        avatar: true,
        username: true,
      },
    });
    return updatedUser;
  }

  // async is2FAValidated(user: Utilisateur, value: boolean) {
  //   // const userToChange = await this.prisma.utilisateur.findUnique({
  //   //     where: {
  //   //     id: user.id,
  //   //     },
  //   // });
  //   // if (!userToChange) {
  //   //     throw new Error("Utilisateur non trouvé");
  //   // }

  //   const updatedUser = await this.prisma.utilisateur.update({
  //     where: {
  //       id: user.id,
  //     },
  //     data: {
  //       is2FAValidated: value,
  //     },
  //   });
  //   return updatedUser;
  // }
}
