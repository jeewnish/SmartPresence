import { Image, type ImageStyle, type StyleProp } from "react-native";

// Maps a short, friendly name to its asset in assets/icons.
// These come straight from the design pack supplied for the project.
const ICONS = {
  "arrow-left": require("../assets/icons/arrow-left.png"),
  "arrow-right": require("../assets/icons/arrow-right.png"),
  bell: require("../assets/icons/bell-notification-social-media.png"),
  book: require("../assets/icons/book-alt.png"),
  calendar: require("../assets/icons/calendar-lines-pen.png"),
  "clock-five": require("../assets/icons/clock-five.png"),
  upload: require("../assets/icons/cloud-upload-alt.png"),
  envelope: require("../assets/icons/envelope.png"),
  eye: require("../assets/icons/eye.png"),
  fingerprint: require("../assets/icons/fingerprint.png"),
  "graduation-cap": require("../assets/icons/graduation-cap.png"),
  home: require("../assets/icons/home.png"),
  link: require("../assets/icons/link-icon.png"),
  location: require("../assets/icons/location-icon.png"),
  lock: require("../assets/icons/lock.png"),
  megaphone: require("../assets/icons/megaphone.png"),
  "menu-dots": require("../assets/icons/menu-dots-vertical.png"),
  settings: require("../assets/icons/settings.png"),
  "time-past": require("../assets/icons/time-past.png"),
  user: require("../assets/icons/user.png"),
} as const;

export type IconName = keyof typeof ICONS;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ImageStyle>;
};

// Custom flat-icon pack is monochrome black on transparent background,
// so we recolor it per-screen with tintColor instead of shipping
// a separate asset for every color variant.
export default function Icon({ name, size = 20, color = "#000000", style }: IconProps) {
  return (
    <Image
      source={ICONS[name]}
      style={[{ width: size, height: size, tintColor: color }, style]}
      resizeMode="contain"
    />
  );
}
