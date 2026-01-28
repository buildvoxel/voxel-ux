import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { useAuthStore } from '@/store/authStore';
import { voxelColors, voxelFonts } from '@/theme/muiTheme';

const drawerWidth = 240;
const collapsedWidth = 64;

interface NavItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: { label: string; path: string; icon: React.ReactNode }[];
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: <HomeOutlinedIcon /> },
  { label: 'Prototypes', path: '/prototypes', icon: <ScienceOutlinedIcon /> },
  {
    label: 'Repository',
    icon: <FolderOutlinedIcon />,
    children: [
      { label: 'Screens', path: '/repository/screens', icon: <ImageOutlinedIcon /> },
      { label: 'Components', path: '/repository/components', icon: <WidgetsOutlinedIcon /> },
    ],
  },
  { label: 'Product Context', path: '/context', icon: <DescriptionOutlinedIcon /> },
  { label: 'Insights', path: '/insights', icon: <InsightsOutlinedIcon /> },
  { label: 'Integrations', path: '/integrations', icon: <ExtensionOutlinedIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsOutlinedIcon /> },
];

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [repositoryOpen, setRepositoryOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const currentWidth = collapsed ? collapsedWidth : drawerWidth;

  // Craftsman Design System colors
  const navTextColor = '#A8A29E'; // Muted text on dark
  const navActiveTextColor = '#FFFFFF'; // Active text
  const navHoverBg = 'rgba(184, 134, 11, 0.1)'; // Brass hover

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Drawer - Deep Charcoal */}
      <Drawer
        variant="permanent"
        sx={{
          width: currentWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: currentWidth,
            boxSizing: 'border-box',
            transition: 'width 0.2s ease-in-out',
            overflowX: 'hidden',
            backgroundColor: voxelColors.bgDark,
            borderRight: 'none',
          },
        }}
      >
        {/* Logo - Instrument Serif for brand name */}
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: collapsed ? 1 : 2,
            gap: 1.5,
            minHeight: 64,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              backgroundColor: voxelColors.primary,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ScienceOutlinedIcon sx={{ color: 'white', fontSize: 18 }} />
          </Box>
          {!collapsed && (
            <Typography
              sx={{
                fontFamily: voxelFonts.display,
                fontSize: '1.125rem',
                fontWeight: 400,
                color: 'white',
              }}
            >
              Voxel
            </Typography>
          )}
        </Toolbar>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Navigation */}
        <List sx={{ flex: 1, pt: 1, px: 1 }}>
          {navItems.map((item) => {
            if (item.children) {
              const isParentActive = isActive('/repository');
              return (
                <Box key={item.label}>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => {
                        if (collapsed) {
                          setCollapsed(false);
                          setRepositoryOpen(true);
                        } else {
                          setRepositoryOpen(!repositoryOpen);
                        }
                      }}
                      sx={{
                        minHeight: 44,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        px: 1.5,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: navHoverBg,
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: collapsed ? 0 : 2,
                          justifyContent: 'center',
                          color: isParentActive ? voxelColors.primary : navTextColor,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {!collapsed && (
                        <>
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontSize: 14,
                              fontWeight: isParentActive ? 500 : 400,
                              color: isParentActive ? navActiveTextColor : navTextColor,
                            }}
                          />
                          <Box sx={{ color: navTextColor }}>
                            {repositoryOpen ? <ExpandLessOutlinedIcon fontSize="small" /> : <ExpandMoreOutlinedIcon fontSize="small" />}
                          </Box>
                        </>
                      )}
                    </ListItemButton>
                  </ListItem>
                  {!collapsed && (
                    <Collapse in={repositoryOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.children.map((child) => {
                          const isChildActive = isActive(child.path);
                          return (
                            <ListItemButton
                              key={child.path}
                              onClick={() => handleNavigate(child.path)}
                              sx={{
                                pl: 4,
                                py: 0.75,
                                mb: 0.25,
                                borderRadius: 1,
                                backgroundColor: isChildActive ? 'rgba(184, 134, 11, 0.15)' : 'transparent',
                                '&:hover': {
                                  backgroundColor: isChildActive ? 'rgba(184, 134, 11, 0.2)' : navHoverBg,
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 32,
                                  color: isChildActive ? voxelColors.primary : navTextColor,
                                }}
                              >
                                {child.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={child.label}
                                primaryTypographyProps={{
                                  fontSize: 13,
                                  fontWeight: isChildActive ? 500 : 400,
                                  color: isChildActive ? navActiveTextColor : navTextColor,
                                }}
                              />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Collapse>
                  )}
                </Box>
              );
            }

            const isItemActive = item.path ? isActive(item.path) : false;
            return (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => item.path && handleNavigate(item.path)}
                  sx={{
                    minHeight: 44,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: 1.5,
                    borderRadius: 1,
                    backgroundColor: isItemActive ? 'rgba(184, 134, 11, 0.15)' : 'transparent',
                    '&:hover': {
                      backgroundColor: isItemActive ? 'rgba(184, 134, 11, 0.2)' : navHoverBg,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 2,
                      justifyContent: 'center',
                      color: isItemActive ? voxelColors.primary : navTextColor,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: isItemActive ? 500 : 400,
                        color: isItemActive ? navActiveTextColor : navTextColor,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Collapse Toggle */}
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            size="small"
            sx={{ color: navTextColor, '&:hover': { color: navActiveTextColor } }}
          >
            {collapsed ? <MenuOutlinedIcon /> : <ChevronLeftOutlinedIcon />}
          </IconButton>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* App Bar - Clean white header */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: voxelColors.surface,
            borderBottom: `1px solid ${voxelColors.border}`,
          }}
        >
          <Toolbar>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={handleUserMenuOpen} size="small">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: voxelColors.primary,
                  fontFamily: voxelFonts.body,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  sx: {
                    border: `1px solid ${voxelColors.border}`,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    mt: 0.5,
                  },
                },
              }}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || 'user@example.com'}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { handleUserMenuClose(); navigate('/settings'); }}>
                <ListItemIcon>
                  <PersonOutlinedIcon fontSize="small" sx={{ color: voxelColors.textSecondary }} />
                </ListItemIcon>
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutOutlinedIcon fontSize="small" sx={{ color: voxelColors.textSecondary }} />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page Content - Parchment background with grid */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: voxelColors.bgPrimary,
            backgroundImage: `
              linear-gradient(to right, ${voxelColors.grid} 1px, transparent 1px),
              linear-gradient(to bottom, ${voxelColors.grid} 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
