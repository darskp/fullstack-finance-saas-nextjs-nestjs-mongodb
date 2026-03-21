"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import api from "@/services/apiClient";

const AxiosInterceptor = ({ children }: { children: React.ReactNode }) => {
  const { getToken, isLoaded } = useAuth();
  const [interceptorReady, setInterceptorReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

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

    setInterceptorReady(true);

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [getToken, isLoaded]);

  if (!isLoaded || !interceptorReady) {
    return null;
  }

  return <>{children}</>;
};

export default AxiosInterceptor;
