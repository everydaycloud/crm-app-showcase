import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Avatar from "@mui/material/Avatar";
import { useMemberQuery } from "src/queries/members";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Link from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useParams } from "react-router-dom";
import { useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

interface IParams {
  memberId: string;
}

const Member = () => {
  const params = useParams() as unknown as IParams;
  const { data: member } = useMemberQuery(params.memberId);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  if (member === undefined) return;

  return (
    <>
      <Menu anchorEl={anchorEl} onClose={() => setAnchorEl(null)} open={open}>
        <MenuItem disabled={member === undefined}>
          <Link
            href={`/members/${member.id}/note/`}
            style={{ textDecoration: "none" }}
          >
            Add/Edit Note
          </Link>
        </MenuItem>
        <MenuItem disabled={member === undefined}>
          <Link
            href={`/members/${member.id}/edit/`}
            style={{ textDecoration: "none" }}
          >
            Edit Member
          </Link>
        </MenuItem>
        <MenuItem disabled={member === undefined}>
          <Link
            href={`/members/${member.id}/photo-upload/`}
            style={{ textDecoration: "none" }}
          >
            Upload Photo
          </Link>
        </MenuItem>
      </Menu>
      <Card>
        <Button
          endIcon={<KeyboardArrowDownIcon />}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          variant="contained"
          sx={{ m: 2 }}
        >
          Actions
        </Button>
        <Button sx={{ m: 2 }}>
          <Link href={"/members/"} style={{ textDecoration: "none" }}>
            Back
          </Link>
        </Button>
        <Stack sx={{ alignItems: "center", alignContent: "center" }}>
          <Avatar
            src={
              member.fileKey
                ? `https://photos.bjjclub.app/${member.fileKey}`
                : "/src/assets/placeholder-avatar.webp"
            }
            alt={`${member.firstName} ${member.lastName}`}
            sx={{ width: 80, height: 80, m: 2 }}
          />
          <CardHeader title={`${member.firstName} ${member.lastName}`} />
        </Stack>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Payment Status</TableCell>
                <TableCell>{member.paymentStatus}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>GC Id</TableCell>
                <TableCell>
                  {member.gcId === null ? (
                    ""
                  ) : (
                    <Link
                      href={`https://manage.gocardless.com/customers/${member.gcId}`}
                    >
                      {member.gcId}
                    </Link>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>{member.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Phone</TableCell>
                <TableCell>{member.phoneNumber ?? ""}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Notes</TableCell>
                <TableCell>{member.note ?? ""}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
};
export default Member;
