import PropTypes from "prop-types";
import { Link } from "@mui/material";
import excelicon from 'assets/icon/excelicon.svg'

const SampleTemplateLink = ({ type, excelicon }) => {
  const getTemplatePath = () => {
    switch (type) {
      case 0:
        return "/individualuploadTemplate.xlsx";
      case 1:
        return "/customeruploadTemplate.xlsx";
      case 2:
        return "/vendoruploadTemplate.xlsx";
      case 3:
        return "/EmployeeNewUploadTemplate.xlsx";
      case 5:
        return "/ClientuploadTemplate.xlsx";
      case 6:
        return "/BulkssTemplate.xlsx";
      default:
        return null;
    }
  };

  const templatePath = getTemplatePath();

  if (!templatePath) return null;

  return (
    <Link
      href={`${import.meta.env.BASE_URL}${templatePath.replace(/^\//, '')}`}
      download={templatePath.split("/").pop()}
      underline="hover"
      sx={{ display: "flex", alignItems: "center", cursor: "pointer", color: "primary.main" }}
    >
      <img
        src={excelicon || `${import.meta.env.BASE_URL}assets/icon/excelicon.svg`}
        alt="Sample Template"
        style={{ height: 28, width: 24, marginRight: 8 }}
      />
      Sample Template
    </Link>
  );
};

SampleTemplateLink.propTypes = {
  type: PropTypes.number.isRequired,
  excelicon: PropTypes.string.isRequired,
};

export default SampleTemplateLink;
