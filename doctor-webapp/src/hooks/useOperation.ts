import { useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { auth } from "@/server/firebase";
import { OperationWithDoctorAndPatient } from "@/types";

const fetchOperation = async (id: string): Promise<OperationWithDoctorAndPatient> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  const token = await user.getIdToken();
  const { data } = await axios.get<OperationWithDoctorAndPatient>(`/api/operations/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const useOperation = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['operation', id],
    queryFn: () => fetchOperation(id),
  });
};
