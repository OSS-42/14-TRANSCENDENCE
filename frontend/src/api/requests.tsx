

import { User } from "../models/User";
import api from "./axiosSetup"

// const BASE_URL = "/api";
// const jwt_token = Cookies.get("jwt_token");

export async function fetchUserMe(): Promise<User | undefined> {
  try {
    const response = await api.get(`/users/me`, {
      
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function addFriendApi(friendUsername: string): Promise<void> {
  try {
    await api.get(`/users/addFriend/${friendUsername}`)
  } catch (error) {
    console.error("Error adding friend:", error);
    throw error;
  }
}

export async function fetchFriendsList(): Promise<User[]> {
  try {
    const response = await api.get(`/users/friendsList`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function fetchUsersList(): Promise<User[]> {
  try {
    const response = await api.get(`/users/allUsers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function fetchBlockedUsers(id: number): Promise<number[]> {
  try {
    const banResponse = await api.get(`/users/blockedUsers/${id}`);
    return banResponse.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function fetchMatchHistory(id: number): Promise<{}> {
  try {
    const banResponse = await api.get(
      `/users/matchHistory/${id}`);
    return banResponse.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}
export async function updateAvatarApi(avatar: FormData): Promise<void> {
  try {
    await api.post(`/users/updateAvatar`, avatar);
    console.log("Avatar updated successfully.");
  } catch (error) {
    console.error("Error updating avatar:", error);
  }
}

export async function destroyFriend(friendId: number): Promise<void> {
  try {
    await api.get(`/users/removeFriend/${friendId}`);
  } catch (error) {
    console.error("Error adding friend:", error);
    throw error;
  }
}

export async function isUserExist(username: string): Promise<boolean> {
  try {
    const response = await api.get(
      `/users/userExist/${username}`);
    return response.data;
  } catch (error) {
    console.error("Error adding checking for username", error);
    throw error;
  }
}

export async function updateUser(editedName: string): Promise<void> {
  try {
    const response = await api.post(
      `/users/updateUsername`,
      { newUsername: editedName },
    );
    console.log("Updating name was successful");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating user data:", error);
  }
}
