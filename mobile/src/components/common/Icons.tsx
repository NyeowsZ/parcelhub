import React from 'react';
import Svg, { Path, Rect, Circle, Line, Polyline } from 'react-native-svg';
import { Colors } from '../../constants/theme';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const HomeIcon: React.FC<IconProps> = ({
  size = 22,
  color = Colors.structure.textPrimary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5h-4v5a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PackageIcon: React.FC<IconProps> = ({
  size = 22,
  color = Colors.structure.textPrimary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16.5 9.4L7.55 4.24a1.8 1.8 0 00-1.8 0L2.5 6.1a1.8 1.8 0 00-.9 1.55v8.7a1.8 1.8 0 00.9 1.55l3.25 1.86a1.8 1.8 0 001.8 0l8.95-5.16a1.8 1.8 0 00.9-1.55v-8.7a1.8 1.8 0 00-.9-1.55l-3.25-1.86z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.3 7l8.7 5 8.7-5M12 12v9.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BellIcon: React.FC<IconProps> = ({
  size = 22,
  color = Colors.structure.textPrimary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const UserIcon: React.FC<IconProps> = ({
  size = 22,
  color = Colors.structure.textPrimary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="7"
      r="4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PlusIcon: React.FC<IconProps> = ({
  size = 20,
  color = Colors.structure.textPrimary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const QrCodeIcon: React.FC<IconProps> = ({
  size = 22,
  color = Colors.structure.textPrimary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth={strokeWidth} />
    <Rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth={strokeWidth} />
    <Rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M14 14h3v3h-3zM18 18h3v3h-3zM14 20h2v1h-2zM20 14v2h1v-2z"
      fill={color}
    />
  </Svg>
);

export const BanknoteIcon: React.FC<IconProps> = ({
  size = 22,
  color = Colors.structure.textPrimary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="6" width="20" height="12" rx="3" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M6 12h.01M18 12h.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const ClockIcon: React.FC<IconProps> = ({
  size = 20,
  color = Colors.structure.textPrimary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M12 7v5l3 3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const HelpCircleIcon: React.FC<IconProps> = ({
  size = 20,
  color = Colors.structure.textPrimary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({
  size = 18,
  color = Colors.accent.successText,
  strokeWidth = 2.2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="20 6 9 17 4 12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({
  size = 22,
  color = Colors.accent.successText,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    <Polyline
      points="16 9 11 14 8 11"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({
  size = 20,
  color = Colors.structure.textPrimary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({
  size = 18,
  color = Colors.structure.textMuted,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12h14M12 5l7 7-7 7"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({
  size = 18,
  color = Colors.structure.textMuted,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CloseIcon: React.FC<IconProps> = ({
  size = 18,
  color = Colors.structure.textPrimary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = ({
  size = 22,
  color = '#92400E',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline
      points="9 12 11 14 15 10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const KeyIcon: React.FC<IconProps> = ({
  size = 20,
  color = Colors.accent.brandPrimary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 2l-2 2m-1.5 1.5L14 9l-2-2-4 4 2 2-2 2-2-2-2.5 2.5a5 5 0 107.07 0L17.5 10.5 19 12l2-2-1.5-1.5L21 7l-2-2 2-3z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BackspaceIcon: React.FC<IconProps> = ({
  size = 22,
  color = Colors.structure.textSecondary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="18" y1="9" x2="12" y2="15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="12" y1="9" x2="18" y2="15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const InfoIcon: React.FC<IconProps> = ({
  size = 18,
  color = Colors.structure.textSecondary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="12" y1="16" x2="12" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Circle cx="12" cy="8" r="0.8" fill={color} />
  </Svg>
);

export const HubStationIcon: React.FC<IconProps> = ({
  size = 20,
  color = Colors.accent.brandPrimary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="9" y1="22" x2="9" y2="18" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="15" y1="22" x2="15" y2="18" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="8" y1="6" x2="10" y2="6" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="14" y1="6" x2="16" y2="6" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="8" y1="10" x2="10" y2="10" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="14" y1="10" x2="16" y2="10" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="8" y1="14" x2="10" y2="14" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="14" y1="14" x2="16" y2="14" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const HandshakeIcon: React.FC<IconProps> = ({
  size = 22,
  color = Colors.accent.brandPrimary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 11l-4-4a2 2 0 00-2.8 0L2 16.2a2 2 0 000 2.8l3 3a2 2 0 002.8 0L17 13"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 13l4-4a2 2 0 012.8 0l9.2 9.2a2 2 0 010 2.8l-3 3a2 2 0 01-2.8 0L7 15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
