import axios from "axios";
import { newStaff, Staff } from "src/models";
import { useQuery } from "src/query";

export const useAllStaffQuery = () =>
  useQuery<Staff[]>(["allStaff"], async () => {
    const response = await axios.get("/v1/staff/");
    return response.data.staff.map((data: unknown) => newStaff(data));
  });
