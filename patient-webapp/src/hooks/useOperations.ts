import { useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { auth } from "@/firebase";
import { OperationWithDoctorAndPatient } from "@/types";

const fetchOperations = async (): Promise<OperationWithDoctorAndPatient[]> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  const token = await user.getIdToken();
  const { data } = await axios.get<OperationWithDoctorAndPatient[]>('/api/operations', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const useOperations = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['operations'],
    queryFn: fetchOperations,
    onSuccess: (data: OperationWithDoctorAndPatient[]) => {
      // Add each operation to the cache
      data.forEach((operation) => {
        queryClient.setQueryData(['operation', operation.id], operation);
      });
    },
  });
};
