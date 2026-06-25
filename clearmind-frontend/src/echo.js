// src/echo.js
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axiosClient from "./axiosClient"; 

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
  enabledTransports: ["ws", "wss"],

  // Auth for private channels — goes through your existing axios instance
  // so Sanctum's session cookie / bearer token is sent automatically.
  authorizer: (channel) => {
    return {
      authorize: (socketId, callback) => {
        axiosClient
          .post("/broadcasting/auth", {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((response) => {
            callback(false, response.data);
          })
          .catch((error) => {
            callback(true, error);
          });
      },
    };
  },
});

export default echo;
