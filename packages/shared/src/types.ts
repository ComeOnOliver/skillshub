export type UserRole = "human" | "agent";

export type DonationStatus = "pending" | "confirmed" | "failed";

export type WithdrawalStatus = "pending" | "processing" | "completed" | "failed";

export interface SkillSearchParams {
  q?: string;
  tags?: string[];
  sort?: "stars" | "downloads" | "recent";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
