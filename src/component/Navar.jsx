import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios"; 
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, setUserData, setIsLoggedin, backendurl } =
    useContext(AppContext);  const sendverificationotp = async () => {
    try {
      console.log('Sending verification OTP for:', userData); 
      if (!userData?._id || !userData?.email) {
        toast.error('User data not found. Please try logging in again.');
        return;
      }
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        backendurl + "/api/auth/send-verify-otp",
        { email: userData.email, userid: userData._id }
      );

      if (data.success) {
        toast.success("Verification OTP sent to your email");
        navigate("/verify-account");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(backendurl + "/api/auth/logout");
      data.success && setIsLoggedin(false);
      data.success && setUserData(false);
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div className="w-full flex justify-between items-center p-5 ">
      <div>
       <img
        src='./images/logo1.png'
        alt="logo"
        className="w-44 h-auto cursor-pointer"
        onClick={() => navigate("/")}
      />
      </div> 
      {userData ? (
        <div className="w-8 h-8 justify-center items-center flex rounded-full bg-sky-400 text-gray-100 font-semibold relative group">
          {userData.name[0].toUpperCase()}          <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
              {!userData.isAccountVerified && (
                <li
                  onClick={sendverificationotp}
                  className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                >
                  VerifyAccount
                </li>
              )}
              <li
                onClick={logout}
                className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10"
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-gray-50 rounded-full px-6 py-2 text-white cursor-pointer bg-sky-400 transition-all"
        >
          Login

        </button>
      )}
    </div>
  );
};

export default Navbar;