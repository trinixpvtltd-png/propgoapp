import AsyncStorage from "@react-native-async-storage/async-storage";

// CONFIGURATION
const API_BASE_URL = "http://localhost:3000/api"; // Change this for production
// For Android emulator: 'http://10.0.2.2:3000/api'
// For iOS simulator: 'http://localhost:3000/api'
// For physical device: 'http://YOUR_COMPUTER_IP:3000/api'

// Token storage keys
const ACCESS_TOKEN_KEY = "@propgo_access_token";
const REFRESH_TOKEN_KEY = "@propgo_refresh_token";
const USER_KEY = "@propgo_user";

// API Response Types
interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  [key: string]: any;
}

interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
  createdAt: string;
}

interface ListingResponse {
  message: string;
  listing: any;
}

interface ListingsResponse {
  message: string;
  listings: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// =====================================================
// TOKEN MANAGEMENT
// =====================================================

export const TokenService = {
  // Save tokens to AsyncStorage
  async saveTokens(accessToken: string, refreshToken: string) {
    try {
      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
      ]);
    } catch (error) {
      console.error("Error saving tokens:", error);
    }
  },

  // Get access token
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  },

  // Get refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  },

  // Clear tokens (logout)
  async clearTokens() {
    try {
      await AsyncStorage.multiRemove([
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_KEY,
      ]);
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  },

  // Save user data
  async saveUser(user: User) {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user:", error);
    }
  },

  // Get user data
  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },
};

// =====================================================
// HTTP CLIENT
// =====================================================

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Make authenticated request
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const accessToken = await TokenService.getAccessToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add authorization header if token exists
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle token expiration
      if (response.status === 401 && data.error?.includes("expired")) {
        // Try to refresh token
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry original request with new token
          return this.request(endpoint, options);
        } else {
          // Refresh failed, logout user
          await TokenService.clearTokens();
          throw new Error("Session expired. Please login again.");
        }
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = await TokenService.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      await TokenService.saveTokens(data.accessToken, data.refreshToken);
      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  }

  // HTTP Methods
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// =====================================================
// AUTH API
// =====================================================

export const AuthAPI = {
  // Signup
  async signup(data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/signup", data);

    // Save tokens and user
    await TokenService.saveTokens(response.accessToken, response.refreshToken);
    await TokenService.saveUser(response.user);

    return response;
  },

  // Login
  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);

    // Save tokens and user
    await TokenService.saveTokens(response.accessToken, response.refreshToken);
    await TokenService.saveUser(response.user);

    return response;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      const refreshToken = await TokenService.getRefreshToken();
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local tokens
      await TokenService.clearTokens();
    }
  },

  // Check if user is logged in
  async isLoggedIn(): Promise<boolean> {
    const token = await TokenService.getAccessToken();
    return !!token;
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    return TokenService.getUser();
  },
};

// =====================================================
// USER API
// =====================================================

export const UserAPI = {
  // Get profile
  async getProfile(): Promise<{ message: string; user: User }> {
    return apiClient.get("/users/profile");
  },

  // Update profile
  async updateProfile(data: {
    name?: string;
    phone?: string;
  }): Promise<{ message: string; user: User }> {
    const response = await apiClient.put("/users/profile", data);

    // Update local user data
    await TokenService.saveUser(response.user);

    return response;
  },
};

// =====================================================
// LISTING API
// =====================================================

export const ListingAPI = {
  // Create listing
  async createListing(data: any): Promise<ListingResponse> {
    return apiClient.post("/listings", data);
  },

  // Get all listings with filters
  async getListings(params?: {
    city?: string;
    typeOfProperty?: string;
    listingFor?: string;
    verified?: boolean;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    rooms?: number;
    page?: number;
    limit?: number;
  }): Promise<ListingsResponse> {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/listings?${queryString}` : "/listings";

    return apiClient.get(endpoint);
  },

  // Get single listing
  async getListingById(id: string): Promise<ListingResponse> {
    return apiClient.get(`/listings/${id}`);
  },

  // Update listing
  async updateListing(id: string, data: any): Promise<ListingResponse> {
    return apiClient.put(`/listings/${id}`, data);
  },

  // Delete listing
  async deleteListing(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/listings/${id}`);
  },

  // Get my listings
  async getMyListings(): Promise<ListingsResponse> {
    return apiClient.get("/listings/user/my-listings");
  },
};

// =====================================================
// EXPORT EVERYTHING
// =====================================================

export default {
  Auth: AuthAPI,
  User: UserAPI,
  Listing: ListingAPI,
  Token: TokenService,
};
