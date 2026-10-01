import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import {
  ListMember,
  Member,
  newListMember,
  newMember,
  PaymentStatus,
} from "src/models";
import { useQuery, useMutation } from "src/query";

export const useMembersQuery = (
  paymentStatus?: PaymentStatus | null,
  search?: string | null,
) =>
  useQuery<ListMember[]>(
    ["members", paymentStatus ?? "", search ?? ""],
    async () => {
      const response = await axios.get("/v1/members/", {
        params: {
          paymentStatus,
          search,
        },
      });
      return response.data.members.map((json: any) => newListMember(json));
    },
  );

export const useMemberQuery = (id: string) => {
  return useQuery<Member>(["members", id], async () => {
    const response = await axios.get(`/v1/members/${id}/`);
    return newMember(response.data);
  });
};

export interface IMemberData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
}

export const useCreateMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: IMemberData) => await axios.post("/v1/members/", data),
    {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
    },
  );
};

export const useEditMemberMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: IMemberData) => await axios.put(`/v1/members/${id}/`, data),
    {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
    },
  );
};

export const useUploadPhotoMutation = (memberId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (fileList: File[]) => {
      const formData = new FormData();
      fileList.forEach((file) => formData.append("file", file));
      return await axios.put(`/v1/members/${memberId}/photo/`, formData);
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["members"] });
      },
    },
  );
};

export interface IMemberNoteData {
  note: string | null;
}

export const useMemberNoteMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: IMemberNoteData) =>
      await axios.put(`/v1/members/${id}/note/`, data),
    {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
    },
  );
};
