import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosClient from "./axiosClient";
import toast from "react-hot-toast";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosClient.post("/reset-password", {
        ...form,
        token,
      });

      toast.success("Password reset successful!");
    } catch (err) {
      toast.error("Reset failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="New Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        onChange={(e) =>
          setForm({ ...form, password_confirmation: e.target.value })
        }
      />
      <button type="submit">Reset Password</button>
    </form>
  );
}

export default ResetPassword;
