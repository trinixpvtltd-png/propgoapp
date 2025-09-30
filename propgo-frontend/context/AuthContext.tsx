import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthAPI, TokenService } from "../services/api.service";
import { Alert } from "react-native";

type User = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  didSkip: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    name?: string,
    phone?: string
  ) => Promise<void>;
  skip: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [didSkip, setDidSkip] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const loggedIn = await AuthAPI.isLoggedIn();
      if (loggedIn) {
        const userData = await AuthAPI.getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error("Check login status error:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await AuthAPI.login({ email, password });

      setUser(response.user);
      setIsAuthenticated(true);
      setDidSkip(false);

      Alert.alert("Success", "Logged in successfully!");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid credentials");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    name?: string,
    phone?: string
  ) => {
    try {
      setLoading(true);
      const response = await AuthAPI.signup({ email, password, name, phone });

      setUser(response.user);
      setIsAuthenticated(true);
      setDidSkip(false);

      Alert.alert("Success", "Account created successfully!");
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message || "Could not create account");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const skip = () => {
    setIsAuthenticated(false);
    setDidSkip(true);
    setUser(null);
  };

  const logout = async () => {
    try {
      setLoading(true);
      await AuthAPI.logout();

      setUser(null);
      setIsAuthenticated(false);
      setDidSkip(false);

      Alert.alert("Logged Out", "You have been logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Could not logout");
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      didSkip,
      user,
      loading,
      login,
      signup,
      skip,
      logout,
    }),
    [isAuthenticated, didSkip, user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
