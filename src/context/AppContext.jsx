import React from 'react';
import { useEffect } from "react";
import { createContext, useState } from "react";
import { toast } from "react-toastify";
import axiosPrivate from '../utils/axisoPrivate'


export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  const [isLoggedin, setIsLoggedin] = useState(!!localStorage.getItem('token'));
  const [userData, setUserData] = useState(null);

  const getAuthState = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedin(false);
      setUserData(null);
      return;
    }

    try {
      const { data } = await axiosPrivate.get(`${backendurl}/api/auth/is-auth`);
      if (data.success) {
        setIsLoggedin(true);
        setUserData(data.user);
      } else {
        setIsLoggedin(false);
        setUserData(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
      }
    } catch (error) {
      setIsLoggedin(false);
      setUserData(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      if (error.response && error.response.status !== 402) {
        toast.error(error.response?.data?.message || 'Authentication check failed');
      }
    }
  }

  const getuserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const { data } = await axiosPrivate.get(`${backendurl}/api/user/data`);
      if (data.success) {
        setUserData(data.userData);
        setIsLoggedin(true);
      } else {
        toast.error(data.message);
        setUserData(null);
        setIsLoggedin(false);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
      }
    } catch (error) {
      console.log('User data fetch error:', error);
      if (error.response && error.response.status === 401) {
        setIsLoggedin(false);
        setUserData(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to fetch user data');
      }
    }
  }
      useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
          getAuthState();
          getuserData();
        }
      }, []);

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      setIsLoggedin(false);
      setUserData(null);
    };

    const value = {
      backendurl,
      isLoggedin,
      setIsLoggedin,
      userData,
      setUserData,
      getuserData,
      getAuthState,
      logout
    };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
export default AppContextProvider;