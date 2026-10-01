import Title from "src/components/Title";
import Card from "@mui/material/Card";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { useAllStaffQuery } from "src/queries/staff";
import { formatDateTime } from "src/utils";

const AllStaff = () => {
  const { data: staff } = useAllStaffQuery();

  return (
    <>
      <Title title="Staff List" />
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Id</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Verified</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.email}</TableCell>
                  <TableCell>{record.id}</TableCell>
                  <TableCell>{formatDateTime(record.created)}</TableCell>
                  <TableCell>{formatDateTime(record.emailVerified)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
};
export default AllStaff;
