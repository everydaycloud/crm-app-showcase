import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid2";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { ListMember } from "src/models";

interface IProps {
  members: ListMember[];
}

const MemberGrid = ({ members }: IProps) => {
  return (
    <Grid container spacing={2}>
      {members.map((member) => (
        <Grid sx={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={member.id}>
          <Link
            href={`/members/${member.id}/`}
            style={{ textDecoration: "none" }}
          >
            <Card
              sx={{
                textAlign: "center",
                borderRadius: 4,
                boxShadow: 3,
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Avatar
                src={
                  member.fileKey
                    ? `https://photos.bjjclub.app/${member.fileKey}`
                    : "/src/assets/placeholder-avatar.webp"
                }
                alt={`${member.firstName} ${member.lastName}`}
                sx={{ width: 80, height: 80, mb: 2 }}
              />
              <CardContent sx={{ p: 0 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {member.firstName}
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {member.lastName}
                </Typography>
                <Typography
                  variant="body2"
                  color={member.paymentStatus === "PAID" ? "green" : "error"}
                >
                  {member.paymentStatus}
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
};

export default MemberGrid;
