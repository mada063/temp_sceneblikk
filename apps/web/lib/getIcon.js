import {
    FaRegFileAlt,
    FaRegImage,
    FaRegPlayCircle,
    FaPuzzlePiece,
    FaCloudSun,
    FaBus,
    FaFilePdf,
    FaRegClock,
    FaRegNewspaper,
    FaRegCalendarAlt,
    FaTasks,
  } from "react-icons/fa";
  
  /**
   * Returns an icon component based on block type.
   * @param {string} type
   * @returns JSX.Element
   */
  export const getIcon = (type) => {
    const iconClass = "h-5 w-5 mr-1 text-custom-color-800";
  
    switch (type) {
      case "text":
        return <FaRegFileAlt className={iconClass} />;
      case "image":
        return <FaRegImage className={iconClass} />;
      case "video":
        return <FaRegPlayCircle className={iconClass} />;
      case "weather":
        return <FaCloudSun className={iconClass} />;
      case "trip":
        return <FaBus className={iconClass} />;
      case "clock":
        return <FaRegClock className={iconClass} />;
      case "news":
        return <FaRegNewspaper className={iconClass} />;
      case "pdf":
        return <FaFilePdf className={iconClass} />;
      case "calendar":
        return <FaRegCalendarAlt className={iconClass} />;
      case "tasks":
        return <FaTasks className={iconClass} />;
      default:
        return <FaPuzzlePiece className={iconClass} />;
    }
  };
  