import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";

export const useCurrentUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosClient.get("/me");
        const u = res.data.data;

        // ✅ NORMALIZE HERE (IMPORTANT FIX)
        setUser({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          middleInitial: u.middleInitial,

          fullName:
            `${u.firstName ?? ""} ${u.middleInitial ?? ""} ${u.lastName ?? ""}`.trim(),

          dateOfBirth: u.dob,
          age: u.dob
            ? (() => {
                const today = new Date();
                const birth = new Date(u.dob);
                let age = today.getFullYear() - birth.getFullYear();
                const m = today.getMonth() - birth.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birth.getDate()))
                  age--;
                return age;
              })()
            : null,

          sex: u.sex,
          genderIdentity: u.genderIdentity,
          civilStatus: u.civilStatus,

          contactNo: u.contactNo,
          email: u.email,

          address: u.address,
          homeAddress: u.address,

          profilePicture: u.profilePicture,

          initials: (u.firstName?.[0] || "") + (u.lastName?.[0] || ""),
        });
      } catch (err) {
        console.error("Failed to load user", err);
      }
    };

    fetchUser();
  }, []);

  return user;
};
