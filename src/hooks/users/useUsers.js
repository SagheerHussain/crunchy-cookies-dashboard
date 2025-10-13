// src/hooks/users/useUsers.js
import { useQuery } from "@tanstack/react-query";
import { getUsersLists, getUserById } from "../../api/users";

const usersKey = (params = {}) => ["users", params];
const userKey = (id) => ["user", id];

export function useUsers(params = {}) {
  return useQuery({
    queryKey: usersKey(params),
    queryFn: () => getUsersLists(params),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    select: (payload) => {
      const items = Array.isArray(payload?.data) ? payload.data : [];
      const rows = items.map((it, idx) => ({
        id: it?._id || it?.id || idx,
        firstName: it?.firstName || "",
        lastName: it?.lastName || "",
        email: it?.email || "",
        phone: it?.phone || "",
        role: it?.role || "",
        gender: it?.gender || "",
        dob: it?.dob || "",
        status: it?.status || "",
        isActive: it?.status, // ⬅️ normalized to isActive
      }));
      return { rows, success: payload?.success ?? true, message: payload?.message ?? "" };
    },
  });
}

export function useUserDetail(id) {
  return useQuery({
    queryKey: userKey(id),
    queryFn: () => getUserById(id),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    // ⬅️ return the plain user object so data === user
    select: (payload) => payload?.data ?? payload ?? {},
    enabled: !!id,
  });
}
