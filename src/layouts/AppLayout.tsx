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
import {
  House,
  Flask,
  Folder,
  Browser,
  SquaresFour,
  Brain,
  ChartLine,
  Plug,
  Gear,
  List as ListIcon,
  CaretLeft,
  CaretUp,
  CaretDown,
  SignOut,
  User,
} from '@phosphor-icons/react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore, useBackgroundStyle } from '@/store/themeStore';
import { ThemeToggle } from '@/components/ThemeToggle';

const drawerWidth = 240;
const collapsedWidth = 64;

interface NavItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: { label: string; path: string; icon: React.ReactNode }[];
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: <House size={20} /> },
  { label: 'Prototypes', path: '/prototypes', icon: <Flask size={20} /> },
  {
    label: 'Repository',
    icon: <Folder size={20} />,
    children: [
      { label: 'Screens', path: '/repository/screens', icon: <Browser size={18} /> },
      { label: 'Components', path: '/repository/components', icon: <SquaresFour size={18} /> },
    ],
  },
  { label: 'Product Context', path: '/context', icon: <Brain size={20} /> },
  { label: 'Insights', path: '/insights', icon: <ChartLine size={20} /> },
  { label: 'Integrations', path: '/integrations', icon: <Plug size={20} /> },
  { label: 'Settings', path: '/settings', icon: <Gear size={20} /> },
];

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [repositoryOpen, setRepositoryOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { config, mode } = useThemeStore();
  const backgroundStyle = useBackgroundStyle();

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

  // Dynamic theme colors
  const navTextColor = '#A8A29E'; // Muted text on dark
  const navActiveTextColor = '#FFFFFF'; // Active text
  const navHoverBg = mode === 'craftsman'
    ? 'rgba(184, 134, 11, 0.1)'
    : 'rgba(20, 184, 166, 0.15)';
  const navActiveBg = mode === 'craftsman'
    ? 'rgba(184, 134, 11, 0.15)'
    : 'rgba(20, 184, 166, 0.2)';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Drawer - Deep Charcoal/Void */}
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
            backgroundColor: config.colors.bgDark,
            borderRight: 'none',
          },
        }}
      >
        {/* Logo */}
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
            component="img"
            src="/voxel-logo.png"
            alt="Voxel"
            sx={{
              width: 32,
              height: 32,
              flexShrink: 0,
            }}
          />
          {!collapsed && (
            <Typography
              sx={{
                fontFamily: config.fonts.display,
                fontSize: '1.125rem',
                fontWeight: mode === 'craftsman' ? 400 : 700,
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
                          color: isParentActive ? config.colors.primary : navTextColor,
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
                            {repositoryOpen ? <CaretUp size={16} /> : <CaretDown size={16} />}
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
                                backgroundColor: isChildActive ? navActiveBg : 'transparent',
                                '&:hover': {
                                  backgroundColor: isChildActive ? navHoverBg : navHoverBg,
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 32,
                                  color: isChildActive ? config.colors.primary : navTextColor,
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
                    backgroundColor: isItemActive ? navActiveBg : 'transparent',
                    '&:hover': {
                      backgroundColor: isItemActive ? navHoverBg : navHoverBg,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 2,
                      justifyContent: 'center',
                      color: isItemActive ? config.colors.primary : navTextColor,
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
            {collapsed ? <ListIcon size={20} /> : <CaretLeft size={20} />}
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
            backgroundColor: config.colors.surface,
            borderBottom: `1px solid ${config.colors.border}`,
          }}
        >
          <Toolbar>
            <Box sx={{ flexGrow: 1 }} />
            <ThemeToggle />
            <IconButton onClick={handleUserMenuOpen} size="small" sx={{ ml: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: mode === 'modern' && config.gradients
                    ? config.gradients.primary
                    : config.colors.primary,
                  fontFamily: config.fonts.body,
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
                    border: `1px solid ${config.colors.border}`,
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
                  <User size={18} color={config.colors.textSecondary} />
                </ListItemIcon>
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <SignOut size={18} color={config.colors.textSecondary} />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page Content - Dynamic background */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            ...backgroundStyle,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
