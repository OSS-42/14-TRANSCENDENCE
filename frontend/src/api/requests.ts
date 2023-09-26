import axios from "axios";
import Cookies from "js-cookie";
import { User } from "../models/User";

const BASE_URL = "/api";
const jwt_token = Cookies.get("jwt_token");

interface MatchData {
  date: string;
  winner: string;
  loser: string;
}
interface MatchHistoryData {
  matchesWon: MatchData[];
  matchesLost: MatchData[];
}

export async function fetchUserMe(): Promise<User | undefined> {
  try {
    const response = await axios.get(`${BASE_URL}/users/me`, {
      headers: {
        Authorization: "Bearer " + jwt_token,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function addFriendApi(friendUsername: string): Promise<void> {
  try {
    await axios.get(`${BASE_URL}/users/addFriend/${friendUsername}`, {
      headers: {
        Authorization: `Bearer ${jwt_token}`,
      },
    });
  } catch (error) {
    console.error("Error adding friend:", error);
    throw error;
  }
}

export async function fetchUserInfo(username: string): Promise<User | undefined> {
  try {
    const response = await axios.get(`${BASE_URL}/users/${username}`, {
      headers: {
        Authorization: `Bearer ${jwt_token}`,
      },
    });
		return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
}

export async function fetchFriendsList(): Promise<User[]> {
  try {
    const response = await axios.get(`${BASE_URL}/users/friendsList`, {
      headers: {
        Authorization: `Bearer ${jwt_token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function fetchUsersList(): Promise<User[]> {
  try {
    const response = await axios.get(`${BASE_URL}/users/allUsers`, {
      headers: {
        Authorization: "Bearer " + jwt_token,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function fetchBlockedUsers(id: number): Promise<number[]> {
  try {
    const banResponse = await axios.get(
      `${BASE_URL}/users/blockedUsers/${id}`,
      {
        headers: {
          Authorization: "Bearer " + jwt_token,
        },
      }
    );
    return banResponse.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function fetchMatchHistory(id: number): Promise<MatchHistoryData> {
  try {
    const banResponse = await axios.get(
      `${BASE_URL}/users/matchHistory/${id}`,
      {
        headers: {
          Authorization: "Bearer " + jwt_token,
        },
      }
    );
    return banResponse.data as MatchHistoryData;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function updateAvatarApi(avatar: FormData): Promise<void> {
  try {
    await axios.post(`${BASE_URL}/users/updateAvatar`, avatar, {
      headers: {
        Authorization: "Bearer " + jwt_token,
      },
    });
    console.log("Avatar updated successfully.");
  } catch (error) {
    console.error("Error updating avatar:", error);
  }
}

export async function destroyFriend(friendId: number): Promise<void> {
  try {
    await axios.get(`${BASE_URL}/users/removeFriend/${friendId}`, {
      headers: {
        Authorization: `Bearer ${jwt_token}`,
      },
    });
  } catch (error) {
    console.error("Error adding friend:", error);
    throw error;
  }
}

export async function isUserExist(username: string): Promise<boolean> {
  try {
    const response = await axios.get(
      `${BASE_URL}/users/userExist/${username}`,
      {
        headers: {
          Authorization: `Bearer ${jwt_token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding checking for username", error);
    throw error;
  }
}

export async function updateUserName(editedName: string): Promise<void> {
  try {
    const response = await axios.post(
      `${BASE_URL}/users/updateUsername`,
      { newUsername: editedName },
      {
        headers: {
          Authorization: `Bearer ${jwt_token}`,
        },
      }
    );
    console.log("Updating name was successful");
    return response.data;
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
}

export async function twoFactorValidationStatus(bool: boolean) {
  try {
    const response = await axios.post(
      `${BASE_URL}/users/is2FAValidated`,
      { value: bool },
      {
        headers: {
          Authorization: `Bearer ${jwt_token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user 2FA", error);
    throw error;
  }
}
