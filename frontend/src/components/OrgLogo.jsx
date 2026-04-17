import { useState } from "react";

/**
 * Displays an organization logo using the following priority:
 * 1. Explicit image_url if provided
 * 2. Clearbit Logo API derived from website_url domain
 * 3. Fallback: navy circle with first letter of organization name
 *
 * Props:
 *   name: organization name (required, for fallback + alt)
 *   imageUrl: optional explicit logo URL
 *   websiteUrl: optional website URL to derive domain for Clearbit
 *   size: "sm" | "md" | "lg" (default "md")
 */
export default function OrgLogo(props) {
  var name = props.name || "";
  var imageUrl = props.imageUrl;
  var websiteUrl = props.websiteUrl;
  var size = props.size || "md";

  var [imgError, setImgError] = useState(false);
  var [clearbitError, setClearbitError] = useState(false);

  var sizeCls = {
    sm: "w-8 h-8 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-16 h-16 text-xl",
  }[size] || "w-11 h-11 text-sm";

  // Derive Clearbit URL from website domain
  var clearbitUrl = null;
  if (websiteUrl) {
    try {
      var url = websiteUrl.indexOf("://") !== -1 ? websiteUrl : "https://" + websiteUrl;
      var domain = new URL(url).hostname.replace(/^www\./, "");
      if (domain) clearbitUrl = "https://logo.clearbit.com/" + domain;
    } catch (e) {
      clearbitUrl = null;
    }
  }

  var initial = (name.charAt(0) || "?").toUpperCase();

  // Priority 1: explicit image_url
  if (imageUrl && !imgError) {
    return (
      <div className={"rounded bg-white border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 " + sizeCls}>
        <img
          src={imageUrl}
          alt={name}
          onError={function () { setImgError(true); }}
          className="w-full h-full object-contain p-1"
        />
      </div>
    );
  }

  // Priority 2: Clearbit
  if (clearbitUrl && !clearbitError) {
    return (
      <div className={"rounded bg-white border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 " + sizeCls}>
        <img
          src={clearbitUrl}
          alt={name}
          onError={function () { setClearbitError(true); }}
          className="w-full h-full object-contain p-1"
        />
      </div>
    );
  }

  // Fallback: navy circle with initial
  return (
    <div className={"rounded bg-[#1e3a8a] flex items-center justify-center flex-shrink-0 " + sizeCls}>
      <span className="text-white font-bold">{initial}</span>
    </div>
  );
}