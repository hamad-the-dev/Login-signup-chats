


import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../component/Navar.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { backendurl, setIsLoggedin, getuserData, isLoggedin } =
    useContext(AppContext);
  const [state, setState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const onSubitHandler = async (e) => {
    e.preventDefault();
    toast.dismiss(); 
    setError("");
    axios.defaults.withCredentials = true;

    if (state === "Sign Up") {
      try {
        const { data } = await axios.post(`${backendurl}/api/auth/register`, {
          name,
          email,
          password,
        });

        if (data.success) {
          toast.success("User registered successfully", { toastId: "register-success" });
          setState("Login");
        } else {
          toast.error(data.message, { toastId: "register-error" });
        }
      } catch (error) {
        setError(error.message);
        toast.error(error.message, { toastId: "register-catch" });
      }
    } else {
      try {
        const { data } = await axios.post(`${backendurl}/api/auth/login`, {
          email,
          password,
        });

        if (data.success) {
          toast.success("Login successful", { toastId: "login-success" });
          setIsLoggedin(true);
          getuserData();
          localStorage.setItem("token", data.user.token);
          localStorage.setItem("userRole", data.user.role);
          localStorage.setItem("user", JSON.stringify(data?.user));

          if (data.user.role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/");
          }
        } else {
          setError(data.message);
          toast.error(data.message, { toastId: "login-error" });
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          setError(error.response.data.message);
          toast.error(error.response.data.message, { toastId: "login-403" });
        } else {
          setError("An error occurred during login");
          toast.error("An error occurred during login", { toastId: "login-catch" });
        }
      }
    }
  };

  return (
    <>
    <Navbar />
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-sky-100">
    
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border-2">
        <h2 className="text-2xl text-sky-400 font-bold text-center mb-2">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>
        <p className="text-sm text-center text-sky-400 mb-6">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account!"}
        </p>

        <form onSubmit={onSubitHandler} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {state === "Sign Up" && (
            <div className="flex items-center border rounded px-3 py-2">

              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Full Name"
                className="w-full outline-none required"
              />
            </div>
          )}

          <div className="flex items-center border rounded px-3 py-2">
           <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email"
              className="w-full outline-none"
              required
            />
          </div>

          <div className="flex items-center border rounded px-3 py-2">
           
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              className="w-full outline-none"
              required
            />
          </div>

          {state === "Login" && (
            <div className="flex justify-end -mt-2">
              <Link
                to="/reset-password"
                className="text-sm text-sky-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-sky-400 hover:bg-sky-600 text-white py-2 rounded-lg transition"
          >
            {state === "Sign Up" ? "Sign Up" : "Login"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          {state === "Sign Up"
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            onClick={() => setState(state === "Sign Up" ? "Login" : "Sign Up")}
            className="text-sky-400 hover:underline"
          >
            {state === "Sign Up" ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
    </>
  );
};

export default Login;