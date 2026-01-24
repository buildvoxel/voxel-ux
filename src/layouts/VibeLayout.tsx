import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import HomeIcon from '@mui/icons-material/Home';
import ScienceIcon from '@mui/icons-material/Science';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import InsightsIcon from '@mui/icons-material/Insights';
import ExtensionIcon from '@mui/icons-material/Extension';
import SettingsIcon from '@mui/icons-material/Settings';

const SIDEBAR_WIDTH = 48;

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: <HomeIcon />, label: 'Home', path: '/' },
  { icon: <ScienceIcon />, label: 'Prototypes', path: '/prototypes' },
  { icon: <FolderIcon />, label: 'Repository', path: '/repository/screens' },
  { icon: <DescriptionIcon />, label: 'Context', path: '/context' },
  { icon: <InsightsIcon />, label: 'Insights', path: '/insights' },
  { icon: <ExtensionIcon />, label: 'Integrations', path: '/integrations' },
  { icon: <SettingsIcon />, label: 'Settings', path: '/settings' },
];

export function VibeLayout() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('/prototypes');

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
          backgroundColor: 'grey.900',
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          <ScienceIcon sx={{ color: 'white', fontSize: 18 }} />
        </Box>
        <Divider sx={{ width: '80%', borderColor: 'grey.700', mb: 1 }} />

        {/* Navigation Items */}
        {sidebarItems.map((item) => (
          <Tooltip key={item.path} title={item.label} placement="right" arrow>
            <IconButton
              onClick={() => handleNavigate(item.path)}
              sx={{
                color: activeItem === item.path ? 'primary.light' : 'grey.500',
                '&:hover': {
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
          backgroundColor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
