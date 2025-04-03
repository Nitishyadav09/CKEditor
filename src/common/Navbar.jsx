import { AppBar, Toolbar } from "@mui/material";
import { Typography } from "@mui/material";
import NovartisIcon from "../assets/novartis_logo.svg";
import styled from "styled-components";
import { RiTextBlock } from "react-icons/ri";

const StyledAppBar = styled(AppBar)`
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
  overflow: hidden;
  height: 63px;
  background-color: white !important;
`;

const StyledLogo = styled.img`
  vertical-align: middle;
  border-style: none;
  height: 27.57px;
  width: 151px;
  margin-top: -4px;
  margin-left: 20px;
  margin-right: 1rem;
`;

const StyledTypography = styled(Typography)`
  font-size: 18px !important;
  letter-spacing: 0 !important;
  line-height: 31px !important;
  color: #1565c0;
  font-weight: bold !important;
`;

const Navbar = () => {

  return (
    <StyledAppBar position="static">
      <div style={{ marginRight: "2rem" }}>
        <Toolbar
          style={{
            margin: "0",
            padding: "0",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <StyledLogo
            src={NovartisIcon}
            alt="novartis"
            style={{ cursor: "pointer" }}
          />
          <div style={{display:'flex', alignItems: "center", gap:'0.5rem'}}>
          <RiTextBlock size={25} color={"#1565c0"}/>
          <StyledTypography variant="h6">
             Editor
          </StyledTypography>
          </div>
        </Toolbar>
      </div>
    </StyledAppBar>
  );
};

export default Navbar;
