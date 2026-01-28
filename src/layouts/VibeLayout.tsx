import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useThemeStore, useBackgroundStyle } from '@/store/themeStore';

const SIDEBAR_WIDTH = 48;

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: <HomeOutlinedIcon />, label: 'Home', path: '/' },
  { icon: <ScienceOutlinedIcon />, label: 'Prototypes', path: '/prototypes' },
  { icon: <FolderOutlinedIcon />, label: 'Repository', path: '/repository/screens' },
  { icon: <DescriptionOutlinedIcon />, label: 'Context', path: '/context' },
  { icon: <InsightsOutlinedIcon />, label: 'Insights', path: '/insights' },
  { icon: <ExtensionOutlinedIcon />, label: 'Integrations', path: '/integrations' },
  { icon: <SettingsOutlinedIcon />, label: 'Settings', path: '/settings' },
];

export function VibeLayout() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('/prototypes');
  const { config, mode } = useThemeStore();
  const backgroundStyle = useBackgroundStyle();

  const navHoverBg = mode === 'craftsman'
    ? 'rgba(184, 134, 11, 0.1)'
    : 'rgba(20, 184, 166, 0.15)';

  const handleNavigate = (path: string) => {
    setActiveItem(path);
    navigate(path);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Icon-only Sidebar */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          backgroundColor: config.colors.bgDark,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 1,
          gap: 0.5,
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            width: 32,
            height: 32,
            background: mode === 'modern' && config.gradients
              ? config.gradients.primary
              : config.colors.primary,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': {
              opacity: 0.9,
            },
          }}
          onClick={() => navigate('/')}
        >
          <ScienceOutlinedIcon sx={{ color: 'white', fontSize: 18 }} />
        </Box>
        <Divider sx={{ width: '80%', borderColor: 'rgba(255,255,255,0.1)', mb: 1 }} />

        {/* Navigation Items */}
        {sidebarItems.map((item) => (
          <Tooltip key={item.path} title={item.label} placement="right" arrow>
            <IconButton
              onClick={() => handleNavigate(item.path)}
              sx={{
                color: activeItem === item.path ? config.colors.primary : '#A8A29E',
                borderRadius: 1,
                '&:hover': {
                  color: 'white',
                  backgroundColor: navHoverBg,
                },
              }}
            >
              {item.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>

      {/* Main Content Area - Full width for Vibe */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ...backgroundStyle,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
