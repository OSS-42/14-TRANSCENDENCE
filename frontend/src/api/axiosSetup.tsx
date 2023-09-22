// import axios from "axios";
// import Cookies from "js-cookie";

// const BASE_URL = "/api";
// let jwt_token = Cookies.get("jwt_token");

// // Créez une instance Axios avec une configuration de base
// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     Authorization: `Bearer ${jwt_token}`,
//   },
// });

// // Ajoutez un intercepteur de réponse
// api.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//       if (error.response && error.response.status === 401) {
//         const seretUserId = getSecretUserId(); 
//         try {
//           const response = await api.post('/newToken', 
//             secretUserId,
//           });
//           const newAccessToken = response.data.accessToken;
//           jwt_token = newAccessToken; // Stockez le nouveau token où vous le souhaitez
//           // Répétez la requête initiale
//           const originalRequest = error.config;
//           originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//           return api(originalRequest);
//         } catch (refreshError) {
//           console.error('Erreur lors du rafraîchissement du token :', refreshError);
//           // Gérez les erreurs de rafraîchissement, par exemple, déconnectez l'utilisateur
//         }
//       }
//       return Promise.reject(error);
//     }
//   );

// export default api;
