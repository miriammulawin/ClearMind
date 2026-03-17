import React from "react";

function ProfileAvatar({ firstName, lastName, profilePic, size = 52 }) {
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  if (profilePic) {
    return (
      <img
        src={profilePic}
        alt="Profile"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "#8046bf",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: "700",
        fontSize: size / 2.5,
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export default ProfileAvatar;