import React from "react";
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

type BlockType =
  | "text"
  | "image"
  | "video"
  | "weather"
  | "trip"
  | "clock"
  | "news"
  | "pdf"
  | "calendar"
  | "tasks"
  | string;

/**
 * Returns an icon component based on block type.
 * We intentionally loosen types here and use React.createElement
 * to avoid react-icons vs local React type incompatibilities.
 */
export const getIcon = (type: BlockType): any => {
  const iconClass = "h-5 w-5 mr-1 text-custom-color-800";
  const props = { className: iconClass };

  switch (type) {
    case "text":
      return React.createElement(FaRegFileAlt as any, props);
    case "image":
      return React.createElement(FaRegImage as any, props);
    case "video":
      return React.createElement(FaRegPlayCircle as any, props);
    case "weather":
      return React.createElement(FaCloudSun as any, props);
    case "trip":
      return React.createElement(FaBus as any, props);
    case "clock":
      return React.createElement(FaRegClock as any, props);
    case "news":
      return React.createElement(FaRegNewspaper as any, props);
    case "pdf":
      return React.createElement(FaFilePdf as any, props);
    case "calendar":
      return React.createElement(FaRegCalendarAlt as any, props);
    case "tasks":
      return React.createElement(FaTasks as any, props);
    default:
      return React.createElement(FaPuzzlePiece as any, props);
  }
};

