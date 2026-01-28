import { useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {
  House,
  Flask,
  Folder,
  Brain,
  ChartLine,
  Plug,
  Gear,
  Code,
  At,
  Flag,
  DownloadSimple,
  ArrowCounterClockwise,
  CaretDown,
  ShareNetwork,
} from '@phosphor-icons/react';
// Flask still used in sidebarItems
import { useThemeStore, useBackgroundStyle } from '@/store/themeStore';
import { useScreensStore } from '@/store/screensStore';

const SIDEBAR_WIDTH = 48;

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: <House size={20} />, label: 'Home', path: '/' },
  { icon: <Flask size={20} />, label: 'Prototypes', path: '/prototypes' },
  { icon: <Folder size={20} />, label: 'Repository', path: '/repository/screens' },
  { icon: <Brain size={20} />, label: 'Context', path: '/context' },
  { icon: <ChartLine size={20} />, label: 'Insights', path: '/insights' },
  { icon: <Plug size={20} />, label: 'Integrations', path: '/integrations' },
  { icon: <Gear size={20} />, label: 'Settings', path: '/settings' },
];

export function VibeLayout() {
  const navigate = useNavigate();
  const { screenId } = useParams<{ screenId?: string }>();
  const [activeItem, setActiveItem] = useState('/prototypes');
  const [pagesMenuAnchor, setPagesMenuAnchor] = useState<null | HTMLElement>(null);
  const { config, mode } = useThemeStore();
  const backgroundStyle = useBackgroundStyle();
  const { getScreenById } = useScreensStore();

  const screen = screenId ? getScreenById(screenId) : null;

  const navHoverBg = mode === 'craftsman'
    ? 'rgba(184, 134, 11, 0.1)'
    : 'rgba(20, 184, 166, 0.15)';

  const toolbarIconColor = config.colors.textSecondary;

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
          component="img"
          src="/voxel-logo.png"
          alt="Voxel"
          onClick={() => navigate('/')}
          sx={{
            width: 32,
            height: 32,
            mb: 1,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            '&:hover': {
              opacity: 0.8,
            },
          }}
        />
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

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ...backgroundStyle,
        }}
      >
        {/* Top Toolbar */}
        <Box
          sx={{
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            borderBottom: '1px solid',
            borderColor: 'rgba(0,0,0,0.08)',
            backgroundColor: config.colors.bgPrimary,
          }}
        >
          {/* Left: Project Name */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: config.colors.textPrimary,
              fontFamily: config.fonts.display,
            }}
          >
            {screen?.name || 'New Project'}
          </Typography>

          {/* Center: Toolbar Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Code View">
              <IconButton size="small" sx={{ color: toolbarIconColor }}>
                <Code size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Mentions">
              <IconButton size="small" sx={{ color: toolbarIconColor }}>
                <At size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Flag">
              <IconButton size="small" sx={{ color: toolbarIconColor }}>
                <Flag size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton size="small" sx={{ color: toolbarIconColor }}>
                <DownloadSimple size={18} />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" sx={{ mx: 1, height: 20 }} />

            <Tooltip title="Undo">
              <IconButton size="small" sx={{ color: toolbarIconColor }}>
                <ArrowCounterClockwise size={18} />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" sx={{ mx: 1, height: 20 }} />

            {/* Pages Dropdown */}
            <Button
              size="small"
              endIcon={<CaretDown size={14} />}
              onClick={(e) => setPagesMenuAnchor(e.currentTarget)}
              sx={{
                color: config.colors.textSecondary,
                textTransform: 'none',
                fontWeight: 400,
                fontSize: '0.8125rem',
              }}
            >
              Pages /
            </Button>
            <Menu
              anchorEl={pagesMenuAnchor}
              open={Boolean(pagesMenuAnchor)}
              onClose={() => setPagesMenuAnchor(null)}
            >
              <MenuItem onClick={() => setPagesMenuAnchor(null)}>
                Main Page
              </MenuItem>
              <MenuItem onClick={() => setPagesMenuAnchor(null)}>
                + Add Page
              </MenuItem>
            </Menu>
          </Box>

          {/* Right: Share Button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<ShareNetwork size={16} />}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              borderColor: 'rgba(0,0,0,0.12)',
              color: config.colors.textPrimary,
            }}
          >
            Share
          </Button>
        </Box>

        {/* Content Area */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
