"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import api from "@/services/apiClient";

const AxiosInterceptor = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [getToken]);

  return <>{children}</>;
};

export default AxiosInterceptor;
