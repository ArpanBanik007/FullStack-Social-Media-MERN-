import React, { useState } from "react";
import InputField from "../componants/InputField";
import { useNavigate } from "react-router-dom";
import Button from "../componants/Button";
import axios from "axios";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handelChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handelSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/users/login",
        formData,
        {
          withCredentials: true,
        }
      );

      setSuccess(res?.data?.message || "Login successful!");

      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message || "Something went wrong or Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-700">
      <div className="bg-white p-6 rounded-2xl shadow-md w-96">
        {error && (
          <p className="mb-4 text-center text-red-600 font-medium">{error}</p>
        )}
        {success && (
          <p className="mb-4 text-center text-green-600 font-medium">
            {success}
          </p>
        )}
        <h2 className="text-xl font-semibold mb-4 flex justify-center">
          Login
        </h2>
        <form onSubmit={handelSubmit}>
          <InputField
            type="text"
            name="identifier"
            placeholder="Email or Username"
            value={formData.identifier}
            onChange={handelChange}
          />
          <InputField
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handelChange}
          />

          <Button
            type="submit"
            loading={loading}
            text="Login"
            disabled={loading}
          />
        </form>
        <p className="mt-4 flex items-center justify-center text-red-500">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-blue-500 underline cursor-pointer"
          >
            Signup
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
